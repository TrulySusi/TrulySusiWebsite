"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAdminSessionClient } from "@/lib/supabase/admin-session-client";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

const CHEVRON_ICON = <path d="M5.5 7.5 10 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />;
const VIEW_SITE_ICON = (
  <path
    d="M2.5 10h15M10 2.5a12 12 0 0 1 0 15M10 2.5a12 12 0 0 0 0 15M2.5 10a7.5 7.5 0 0 1 15 0"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);
const LOGOUT_ICON = (
  <path
    d="M8 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H8 M13 14l4-4-4-4 M17 10H7.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export function AdminUserMenu() {
  const { name, role } = useAdminSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createAdminSessionClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const initial = name.trim().charAt(0).toUpperCase() || "A";
  // No staff accounts yet — only "owner" is real right now, and that's an
  // internal role name, not something to show a user. Revisit once staff
  // logins actually exist.
  const roleLabel = role === "owner" ? "Admin" : role;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-white/10"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass font-body text-xs font-bold text-navy">
          {initial}
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="max-w-28 truncate font-body text-xs font-semibold text-cream">{name}</span>
          <span className="font-body text-[10px] capitalize text-cream/50">{roleLabel}</span>
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`h-3.5 w-3.5 text-cream/60 transition-transform ${open ? "rotate-180" : ""}`}
        >
          {CHEVRON_ICON}
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-navy/10 bg-white shadow-lg">
          <div className="border-b border-navy/10 px-4 py-3 sm:hidden">
            <p className="truncate font-body text-sm font-semibold text-navy">{name}</p>
            <p className="font-body text-xs capitalize text-navy/50">{roleLabel}</p>
          </div>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-navy transition-colors hover:bg-cream/60"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-navy/50">
              {VIEW_SITE_ICON}
            </svg>
            View site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 font-body text-sm text-navy transition-colors hover:bg-cream/60 disabled:opacity-60"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-navy/50">
              {LOGOUT_ICON}
            </svg>
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
