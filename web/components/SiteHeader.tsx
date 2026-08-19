import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy/8 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative block h-8 w-7 shrink-0">
            <Image
              src="/brand/icon-navy.png"
              alt=""
              fill
              sizes="28px"
              className="object-contain"
            />
          </span>
          <span className="font-display text-2xl italic font-semibold text-navy">
            Truly Susi&rsquo;s
          </span>
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
