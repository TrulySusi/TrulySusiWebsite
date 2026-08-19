import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Menu" },
  { href: "/track-order", label: "Track Order" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
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
      </div>
    </header>
  );
}
