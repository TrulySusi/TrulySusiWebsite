import Image from "next/image";
import Link from "next/link";

const BRAND_LINKS = [
  { href: "/#our-story", label: "Our Story" },
  { href: "/shop", label: "Menu" },
  { href: "/track-order", label: "Track Order" },
];

const POLICY_LINKS = [
  { href: "/policies/terms", label: "Terms & Conditions" },
  { href: "/policies/shipping", label: "Shipping & Delivery" },
  { href: "/policies/privacy", label: "Privacy Policy" },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div>
            <h3 className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-2.5 font-body text-sm text-cream/80">
              <li>
                <a href="mailto:feedback@trulysusi.in" className="transition-colors hover:text-cream">
                  feedback@trulysusi.in
                </a>
              </li>
              <li>Salem, Tamil Nadu</li>
            </ul>
          </div>

          <div>
            <div className="relative h-6 w-28">
              <Image
                src="/brand/wordmark-cream.png"
                alt="Truly Susi's"
                fill
                sizes="112px"
                className="object-contain object-left"
              />
            </div>
            <ul className="mt-4 space-y-2.5">
              {BRAND_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-sm text-cream/80 transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-sm text-cream/80 transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
              Follow Us
            </h3>
            <div className="mt-4 flex gap-2.5">
              <a
                href="https://instagram.com/trulysusi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Truly Susi's on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <rect x="3" y="3" width="14" height="14" rx="4" />
                  <circle cx="10" cy="10" r="3.2" />
                  <circle cx="14" cy="6" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6 font-body text-xs text-cream/50">
          &copy; 2026 Truly Susi&rsquo;s
        </div>
      </div>
    </footer>
  );
}
