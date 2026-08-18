import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// For Server Components, Server Actions, and Route Handlers that need to
// act as the signed-in customer/owner (anon key + their session cookie).
// RLS still applies — this is not the privileged client.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
