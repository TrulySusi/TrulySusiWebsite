// Pre-launch ordering mode — shared by the server (lib/site-settings.ts, the
// route guards) and by Client Components, so it must not import anything
// server-only.
//
// While Razorpay is pending approval the site does not take payment online.
// Customers are sent to WhatsApp or Instagram DM instead and the order is
// keyed into /admin/orders/new. Everything here is driven by one
// `site_settings` row (key = 'ordering'), so ordering is switched back on with
// a database update rather than a code change.

export type Ordering = {
  /** False = cart, checkout and Razorpay are off and the DM routes show instead. */
  enabled: boolean;
  /** The line shown above the header. Lives in the DB so it can be reworded without a deploy. */
  notice: string | null;
  instagramUrl: string | null;
  /** Bare wa.me link; pass through whatsappOrderUrl to pre-fill a product. */
  whatsappUrl: string | null;
};

/**
 * Fail closed. A missing row, an unreachable Supabase, a typo in the value —
 * all of them read as "ordering is off". The dangerous failure is a site that
 * silently accepts money it cannot actually take; a site that says "message us
 * on WhatsApp" is never dangerous.
 */
export const ORDERING_CLOSED: Ordering = {
  enabled: false,
  notice: null,
  instagramUrl: null,
  whatsappUrl: null,
};

/**
 * wa.me's ?text= pre-fills the message box so the customer arrives having
 * already said what they want — the whole reason WhatsApp is the primary
 * button. Instagram has no equivalent; ig.me/m/<handle> can open the DM thread
 * but cannot put anything in it.
 *
 * Deliberately does NOT quote a total: delivery isn't known until we have the
 * pincode, so promising a figure here would be wrong more often than right.
 */
export function whatsappOrderUrl(
  baseUrl: string,
  productName: string,
  packLabel: string,
  quantity: number,
) {
  const pack = packLabel.replace(" box", "");
  const text =
    `Hi Truly Susi's, I'd like to order ${quantity} × ${productName} (${pack}). ` +
    `Could you confirm the total with delivery?`;
  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}
