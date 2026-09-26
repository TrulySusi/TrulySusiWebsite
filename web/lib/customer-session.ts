"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin and customer logins share the same Supabase Auth users table — an
// admin_users row is just a role flag on top of it. Without this check, an
// admin signed into /admin would also read as "signed in" on the public
// storefront: their email would leak into checkout's contact field, real
// test orders would get attributed to their admin account, and a "Log out"
// click on checkout would kill their admin session too. Every storefront
// spot that needs "is a customer signed in" should call this instead of
// checking auth.getUser() directly.
export async function getCustomerSession(): Promise<{ id: string; email: string; name: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  const adminClient = createAdminClient();
  const { data: admin } = await adminClient.from("admin_users").select("id").eq("id", user.id).maybeSingle();
  if (admin) return null;

  // First choice: the name collected at signup. Older accounts that signed
  // up before that field existed won't have one — fall back to a saved
  // delivery address, then to the email's local part rather than showing
  // nothing.
  const { data: customer } = await adminClient
    .from("customers")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();

  let name = customer?.first_name;
  if (!name) {
    const { data: address } = await adminClient
      .from("addresses")
      .select("first_name, full_name")
      .eq("customer_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    name = address?.first_name || address?.full_name || undefined;
  }
  name = name || user.email.split("@")[0];

  return { id: user.id, email: user.email, name };
}
