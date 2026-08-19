import Image from "next/image";
import Link from "next/link";
import { CartIcon } from "@/components/CartIcon";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Menu" },
  { href: "/track-order", label: "Track Order" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 sm:px-10">
        <Link href="/" className="relative block h-8 w-36 shrink-0">
          <Image
            src="/brand/wordmark-navy.png"
            alt="Truly Susi's"
            fill
            sizes="144px"
            className="object-contain object-left"
            priority
          />
        </Link>
        <nav>
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-xs font-medium uppercase tracking-[0.22em] text-navy/70 transition-colors hover:text-coral"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-3">
          <form action="/shop" method="GET" className="relative hidden sm:block">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="m17 17-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="Search sweets"
              className="w-48 rounded-full bg-navy/6 py-2 pl-10 pr-4 font-body text-sm text-navy placeholder:text-navy/45 focus:outline-none focus:ring-1 focus:ring-navy/25 lg:w-64"
            />
          </form>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
