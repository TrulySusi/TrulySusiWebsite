import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely. Only ever call this from
// Route Handlers / Server Actions that have already done their own
// authorization check (e.g. re-pricing checkout, or a verified
// admin_users membership check). The `server-only` import makes any
// accidental client-side import a build error, not a runtime leak.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
