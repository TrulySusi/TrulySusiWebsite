"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/products", label: "Products" },
];

export function AdminNav({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-navy/10 bg-white px-4 py-6">
      <Link href="/admin" className="font-display text-xl text-navy">
        Truly Susi&rsquo;s
      </Link>
      <p className="mt-0.5 font-body text-xs uppercase tracking-wider text-navy/40">Admin</p>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 font-body text-sm font-medium transition-colors ${
                active ? "bg-navy text-cream" : "text-navy/70 hover:bg-navy/6"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-navy/10 pt-4">
        <p className="truncate font-body text-sm font-medium text-navy">{name}</p>
        <p className="font-body text-xs capitalize text-navy/45">{role}</p>
        <Link href="/" className="mt-3 block font-body text-xs text-navy/50 hover:text-brass">
          ← View site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-1 font-body text-xs text-navy/50 hover:text-brass disabled:opacity-60"
        >
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
