import { createBrowserClient } from "@supabase/ssr";

// For Client Components. Uses the anon key — safe to expose, RLS does the
// actual access control (see supabase/schema.sql).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
