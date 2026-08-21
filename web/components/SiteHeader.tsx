"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon } from "@/components/CartIcon";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/track-order", label: "Track Order" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 sm:px-10 xl:grid xl:grid-cols-3 xl:gap-6">
        <Link href="/" className="relative block h-8 w-28 shrink-0 justify-self-start sm:w-36">
          <Image
            src="/brand/wordmark-cream.png"
            alt="Truly Susi's"
            fill
            sizes="144px"
            className="object-contain object-left"
            priority
          />
        </Link>

        <nav className="hidden xl:block xl:justify-self-center">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`font-body text-xs font-medium uppercase tracking-[0.22em] transition-colors hover:text-brass ${
                      active ? "text-brass" : "text-cream/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end gap-2 sm:gap-3">
          <form action="/shop" method="GET" className="relative hidden xl:block">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/45"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="m17 17-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="Search sweets"
              className="w-40 rounded-full bg-cream/10 py-2 pl-10 pr-4 font-body text-sm text-cream placeholder:text-cream/45 focus:outline-none focus:ring-1 focus:ring-cream/30 xl:w-56"
            />
          </form>
          <CartIcon />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/10 xl:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-cream/10 px-6 pb-6 pt-4 sm:px-10 xl:hidden">
          <nav>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2.5 font-body text-sm font-medium uppercase tracking-[0.18em] transition-colors ${
                        active ? "bg-cream/10 text-brass" : "text-cream/80 hover:bg-cream/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <form action="/shop" method="GET" className="relative mt-4">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/45"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="m17 17-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="Search sweets"
              className="w-full rounded-full bg-cream/10 py-2.5 pl-10 pr-4 font-body text-sm text-cream placeholder:text-cream/45 focus:outline-none focus:ring-1 focus:ring-cream/30"
            />
          </form>
        </div>
      )}
    </header>
  );
}
