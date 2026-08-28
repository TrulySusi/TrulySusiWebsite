import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

async function collectRefreshedCookies(
  request: NextRequest,
  cookieOptions?: { name: string },
): Promise<CookieToSet[]> {
  const collected: CookieToSet[] = [];
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          collected.push(...cookiesToSet);
        },
      },
    },
  );
  // Triggers a real token refresh (not just a local JWT read) when the
  // access token is expired — collected above so it can be written onto
  // the response below, which a plain Server Component render can't do.
  await client.auth.getUser();
  return collected;
}

// Without this, a Server Component page render (e.g. /account/orders)
// can't persist a refreshed access token — @supabase/ssr's setAll()
// silently no-ops there since there's no response to write cookies onto
// mid-render. A Server Action call (checkout's getCustomerSession()) can
// write cookies, so it stays fresh while the Server Component read goes
// stale — exactly the "one page shows signed in, another doesn't"
// inconsistency this proxy (formerly "middleware") exists to close.
// Admin (/admin/*) and customer sessions live on separate cookies (see
// lib/supabase/admin-session-*.ts) and are refreshed independently so
// they never interfere with each other.
//
// Scope is deliberately narrow (see matcher below): getUser() makes a
// real network round-trip to Supabase's Auth server for every signed-in
// request it runs on, so this only runs where a Server Component
// actually reads session state directly (/account/orders, and the whole
// /admin tree via its layout). Every other page — checkout, login,
// signup, order-confirmed, the storefront — is a Client Component that
// checks its own session via a Server Action call, which already
// self-refreshes regardless of this proxy. Running this site-wide added
// that round-trip to every navigation for any signed-in visitor
// (customers and, worse, admins working in /admin all day) for no
// benefit on those pages — narrowed after that turned out to be the
// actual cause of a real, reported slowdown.
export async function proxy(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  const refreshedCookies = isAdminPath
    ? await collectRefreshedCookies(request, { name: "sb-admin-auth" })
    : await collectRefreshedCookies(request);

  const response = NextResponse.next({ request });
  for (const { name, value, options } of refreshedCookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}

export const config = {
  matcher: ["/account/orders", "/admin/:path*"],
};
