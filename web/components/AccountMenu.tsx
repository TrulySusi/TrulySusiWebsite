"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCustomerSession } from "@/lib/customer-session";

const CHEVRON_ICON = <path d="M5.5 7.5 10 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />;
const ORDERS_ICON = (
  <path
    d="M5 3h10v14l-2.5-1.5L10 17l-2.5-1.5L5 17V3Z M7.5 7h5 M7.5 10h5"
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

export function AccountMenu() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCustomerSession().then((session) => {
      setName(session?.name ?? null);
      setChecked(true);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    setName(null);
    router.push("/account/login");
    router.refresh();
  }

  // Not signed in (or still checking) — same plain icon-link as before,
  // straight to sign-in. Defaulting here (rather than a loading spinner)
  // means a guest never sees a flash of the wrong state.
  if (!checked || !name) {
    return (
      <Link
        href="/account/login?redirect=%2Faccount%2Forders"
        aria-label="Sign in"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/45"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
          <circle cx="10" cy="7" r="3" />
          <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
        </svg>
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-cream/25 pl-3 pr-2.5 text-cream transition-colors hover:border-cream/45"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[16px] w-[16px] shrink-0">
          <circle cx="10" cy="7" r="3" />
          <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
        </svg>
        <span className="hidden max-w-24 truncate font-body text-xs font-medium sm:inline">{name}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`hidden h-3.5 w-3.5 text-cream/60 transition-transform sm:block ${open ? "rotate-180" : ""}`}
        >
          {CHEVRON_ICON}
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-navy/10 bg-white shadow-lg">
          <div className="border-b border-navy/10 px-4 py-3">
            <p className="truncate font-body text-sm font-semibold text-navy">Hi, {name}</p>
          </div>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-navy transition-colors hover:bg-cream/60"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-navy/50">
              {ORDERS_ICON}
            </svg>
            My orders
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
