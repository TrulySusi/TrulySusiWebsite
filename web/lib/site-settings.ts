import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDERING_CLOSED, type Ordering } from "@/lib/ordering";

/**
 * Business details the FSS (Labelling & Display) Regulations 2020 and the
 * FSSAI E-commerce Guidelines Order (19.03.2021) require a food listing to
 * show. These live in `site_settings` rather than in code so the licence
 * number can be filled in the moment it is granted — one row, no redeploy.
 *
 * The same row table also carries the pre-launch ordering switch (see
 * lib/ordering.ts), for the same reason: turning website checkout back on when
 * Razorpay is approved must not require a code change.
 */
export type SiteSettings = {
  manufacturedBy: string | null;
  address: string | null;
  countryOfOrigin: string | null;
  fssaiLicenceNo: string | null;
  customerCareEmail: string | null;
  customerCarePhone: string | null;
  legalEntityName: string | null;
  ordering: Ordering;
};

type Row = { key: string; value: Record<string, string | null> | null };

/** wa.me wants bare digits with the country code and no "+" or spaces. */
function waDigits(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

/** Cached per request — the footer and every product page ask for this. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  // Opt every page that reads these settings out of static prerendering.
  // Without this, Next bakes the values into the HTML at build time and
  // "one row, no redeploy" stops being true: flipping the ordering switch
  // (or filling in the FSSAI licence number) would leave /cart, /checkout
  // and the policy pages serving the old answer until the next deploy.
  await connection();

  // site_settings is RLS-locked (it also holds the LLP PAN), so read it with
  // the service-role client and expose only the fields below. This module is
  // server-only, so nothing here reaches the browser bundle.
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const rows = (data ?? []) as Row[];
  const get = (key: string, field: string) => rows.find((r) => r.key === key)?.value?.[field] ?? null;

  const customerCarePhone = get("customer_care", "phone");

  // Orders move to a separate line only if someone sets `whatsapp` on the row;
  // otherwise the care number already in the footer is the one number to keep
  // up to date.
  const waNumber = waDigits(get("ordering", "whatsapp") ?? customerCarePhone);
  const orderingEnabled = get("ordering", "enabled") === "true";

  return {
    manufacturedBy: get("manufacturer", "manufactured_by"),
    address: get("manufacturer", "address"),
    countryOfOrigin: get("manufacturer", "country_of_origin"),
    // Intentionally absent until the licence is granted. Everything that
    // renders it must handle null rather than printing a placeholder — an
    // invented or "pending" number on a food listing is worse than none.
    fssaiLicenceNo: get("fssai", "licence_no"),
    customerCareEmail: get("customer_care", "email"),
    customerCarePhone,
    legalEntityName: get("legal_entity", "name"),
    ordering: orderingEnabled
      ? { ...ORDERING_CLOSED, enabled: true }
      : {
          enabled: false,
          notice: get("ordering", "notice"),
          instagramUrl: get("ordering", "instagram_url"),
          whatsappUrl: waNumber ? `https://wa.me/${waNumber}` : null,
        },
  };
});
