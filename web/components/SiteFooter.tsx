import Link from "next/link";

const BRAND_LINKS = [
  { href: "/#our-story", label: "Our Story" },
  { href: "/shop", label: "Products" },
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
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          <div>
            <h3 className="font-body text-sm font-bold text-cream">Get in touch</h3>
            <ul className="mt-4 space-y-2.5 font-body text-sm text-cream/80">
              <li>
                {/* Real support inbox from the product label — not the
                    placeholder email/phone the reference mockup shows. */}
                <a href="mailto:feedback@trulysusi.in" className="transition-colors hover:text-cream">
                  feedback@trulysusi.in
                </a>
              </li>
              <li>Salem, Tamil Nadu</li>
            </ul>
          </div>

          <div>
            <Link href="/" className="font-body text-sm font-bold text-cream">
              Truly Susi&rsquo;s
            </Link>
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
            <h3 className="font-body text-sm font-bold text-cream">Quick links</h3>
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
            <h3 className="font-body text-sm font-bold text-cream">Follow us</h3>
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
              {/* Facebook and LinkedIn pages aren't live yet — shown as
                  static (non-linked) icons until those exist. */}
              <span
                aria-hidden="true"
                title="Facebook — coming soon"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream/50"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M12.5 6.5H11a1.5 1.5 0 0 0-1.5 1.5v2H12.5l-.35 2.5H9.5V17.5h-2.5V12.5H5V10H7V7.6C7 5.6 8.3 4 10.5 4H12.5V6.5Z" strokeLinejoin="round" />
                </svg>
              </span>
              <span
                aria-hidden="true"
                title="LinkedIn — coming soon"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream/50"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <rect x="3" y="3" width="14" height="14" rx="3" />
                  <line x1="6.7" y1="8.5" x2="6.7" y2="13.5" strokeLinecap="round" />
                  <circle cx="6.7" cy="6.3" r="0.9" fill="currentColor" stroke="none" />
                  <path d="M9.5 13.5V10.3c0-.9.7-1.8 1.8-1.8s1.7.9 1.7 1.8v3.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-dashed border-cream/25 pt-6 font-body text-xs text-cream/50">
          &copy; 2026 Truly Susi&rsquo;s &middot; Sweeter together.
        </div>
      </div>
    </footer>
  );
}
