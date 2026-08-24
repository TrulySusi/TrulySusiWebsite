import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side counterpart to admin-session-client.ts — reads/writes the
// same "sb-admin-auth" cookie namespace, kept separate from the customer
// session cookie so the two logins never interfere with each other.
export async function createAdminSessionServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: "sb-admin-auth" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component with no request context to
            // write to — safe to ignore as long as middleware refreshes
            // the session (standard @supabase/ssr caveat).
          }
        },
      },
    },
  );
}
