import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: "owner" | "staff";
};

// Server-only: who's signed in (if anyone), and whether they're in
// admin_users. Uses the service-role client for the admin_users lookup
// since that table has no public RLS policies by design — this check is
// itself the authorization gate, run only from trusted server code.
export async function getAdminSession(): Promise<{
  authedEmail: string | null;
  admin: AdminUser | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authedEmail: null, admin: null };

  const adminClient = createAdminClient();
  const { data: admin } = await adminClient
    .from("admin_users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return { authedEmail: user.email ?? null, admin: admin as AdminUser | null };
}
