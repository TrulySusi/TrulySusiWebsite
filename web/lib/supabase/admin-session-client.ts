import { createBrowserClient } from "@supabase/ssr";

// Same project as lib/supabase/client.ts, but stored under a separate
// cookie name so an admin login never overwrites (or gets overwritten by)
// a customer session in the same browser. Only ever used for the admin
// sign-in/out flow itself — admin data access still goes through the
// service-role client in lib/supabase/admin.ts.
export function createAdminSessionClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { name: "sb-admin-auth" } },
  );
}
