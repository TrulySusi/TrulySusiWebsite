"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createAdminSessionClient } from "@/lib/supabase/admin-session-client";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";

const NAV_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <path
        d="M3 3h6v6H3V3Z M11 3h6v4h-6V3Z M11 9h6v8h-6V9Z M3 11h6v6H3v-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <path
        d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5v-7Z M3 6.5 10 10l7-3.5 M10 10v7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <path
        d="M5 3h10v14l-2.5-1.5L10 17l-2.5-1.5L5 17V3Z M7.5 7h5 M7.5 10h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: (
      <path
        d="M10 2.8l2.14 4.53 4.96.62-3.63 3.5.94 4.95L10 13.9l-4.41 2.5.94-4.95-3.63-3.5 4.96-.62L10 2.8Z"
        strokeLinejoin="round"
      />
    ),
  },
];

const LOGOUT_ICON = (
  <path
    d="M8 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H8 M13 14l4-4-4-4 M17 10H7.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

const COLLAPSE_ICON = (
  <path d="M12.5 5 7.5 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
);

export function AdminNav({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin-nav-collapsed");
    if (saved === "1") setCollapsed(true);
    else if (window.innerWidth < 768) setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem("admin-nav-collapsed", !c ? "1" : "0");
      return !c;
    });
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createAdminSessionClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <aside
      className={`relative flex shrink-0 flex-col bg-navy py-6 shadow-[4px_0_16px_-8px_rgba(4,28,53,.3)] transition-all ${
        mounted && collapsed ? "w-[72px] items-center px-2" : "w-56 px-4"
      }`}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-navy/15 bg-white text-navy/50 shadow-sm transition-colors hover:text-navy z-10"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`h-3.5 w-3.5 transition-transform ${mounted && collapsed ? "rotate-180" : ""}`}
        >
          {COLLAPSE_ICON}
        </svg>
      </button>

      {collapsed ? (
        <Image src="/brand/icon-cream.png" alt="Truly Susi's" width={32} height={32} className="h-8 w-8" />
      ) : (
        <Link href="/admin" className="font-body text-xl font-semibold text-cream">
          Truly Susi&rsquo;s
        </Link>
      )}
      {!collapsed && (
        <p className="mt-0.5 font-body text-xs uppercase tracking-wider text-cream/50">Admin</p>
      )}

      <div className={`mt-5 w-full border-t border-white/10 pt-3 ${collapsed ? "flex justify-center" : ""}`}>
        <AdminNotificationBell collapsed={collapsed} />
      </div>

      <nav className={`mt-3 flex w-full flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
        {NAV_LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const content = (
            <>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4.5 w-4.5 shrink-0"
              >
                {link.icon}
              </svg>
              {!collapsed && <span className="flex-1">{link.label}</span>}
            </>
          );

          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-body text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${active ? "bg-brass text-navy" : "text-cream/70 hover:bg-white/10"}`}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className={`mt-auto flex w-full flex-col ${collapsed ? "items-center" : ""}`}>
        {!collapsed && (
          <Link href="/" className="mb-3 font-body text-xs text-cream/50 hover:text-brass">
            ← View site
          </Link>
        )}
        {!collapsed && (
          <div className="mb-2 border-t border-white/10 pt-3">
            <p className="truncate font-body text-sm font-medium text-cream">{name}</p>
            <p className="font-body text-xs capitalize text-cream/50">{role}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? "Log out" : undefined}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-body text-sm font-medium text-cream/70 transition-colors hover:bg-white/10 hover:text-brass disabled:opacity-60 ${
            collapsed ? "justify-center" : "w-full"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5 shrink-0">
            {LOGOUT_ICON}
          </svg>
          {!collapsed && (loggingOut ? "Logging out…" : "Log out")}
        </button>
      </div>
    </aside>
  );
}
