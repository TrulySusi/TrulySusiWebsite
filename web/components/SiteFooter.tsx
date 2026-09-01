"use client";

import Link from "next/link";
import { useReviewsWidget } from "@/components/ReviewsWidgetContext";

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
  const { openReviews } = useReviewsWidget();

  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto max-w-6xl px-6 py-9 sm:px-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
          <div>
            <h3 className="font-body text-sm font-bold text-cream">Get in touch</h3>
            <ul className="mt-3 space-y-2 font-body text-sm text-cream/80">
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-cream/50">
                  <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
                  <path d="m3 5.5 7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Real support inbox from the product label — not the
                    placeholder email/phone the reference mockup shows. */}
                <a href="mailto:feedback@trulysusi.in" className="transition-colors hover:text-cream">
                  feedback@trulysusi.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-cream/50">
                  <path
                    d="M4 3h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15 15 0 0 1 3.5 4.6 1.5 1.5 0 0 1 5 3Z"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Explicitly user-authorized dummy number — replace with
                    the real one before this goes in front of customers. */}
                <a href="tel:+919876543210" className="transition-colors hover:text-cream">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-cream/50">
                  <path d="M10 18s6-5.2 6-9.6A6 6 0 0 0 4 8.4C4 12.8 10 18 10 18Z" strokeLinejoin="round" />
                  <circle cx="10" cy="8.4" r="2" />
                </svg>
                Salem, Tamil Nadu
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-cream/50">
                  <path
                    d="M10 2.8l2.14 4.53 4.96.62-3.63 3.5.94 4.95L10 13.9l-4.41 2.5.94-4.95-3.63-3.5 4.96-.62L10 2.8Z"
                    strokeLinejoin="round"
                  />
                </svg>
                <button
                  type="button"
                  onClick={openReviews}
                  className="font-body text-sm text-left text-cream/80 transition-colors hover:text-cream"
                >
                  Customer Reviews
                </button>
              </li>
            </ul>
          </div>

          <div>
            <Link href="/" className="font-body text-sm font-bold text-cream">
              Truly Susi&rsquo;s
            </Link>
            <ul className="mt-3 space-y-2">
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
            <ul className="mt-3 space-y-2">
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
            <div className="mt-3 flex gap-2.5">
              <a
                href="https://instagram.com/trulysusi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Truly Susi's on Instagram"
                className="block h-8 w-8 overflow-hidden rounded-lg transition-opacity hover:opacity-85"
              >
                <svg viewBox="0 0 20 20" className="h-full w-full">
                  <defs>
                    <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="5%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285aeb" />
                    </radialGradient>
                  </defs>
                  <rect width="20" height="20" fill="url(#ig-gradient)" />
                  <rect
                    x="5.5"
                    y="5.5"
                    width="9"
                    height="9"
                    rx="3"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.3"
                  />
                  <circle cx="10" cy="10" r="2.6" fill="none" stroke="white" strokeWidth="1.3" />
                  <circle cx="14.2" cy="5.8" r="0.7" fill="white" />
                </svg>
              </a>
              {/* Facebook and LinkedIn pages aren't live yet — shown at
                  reduced opacity, and not linked, until those exist. */}
              <span
                aria-hidden="true"
                title="Facebook (coming soon)"
                className="block h-8 w-8 overflow-hidden rounded-lg opacity-60"
              >
                <svg viewBox="0 0 20 20" className="h-full w-full">
                  <rect width="20" height="20" fill="#1877f2" />
                  <path
                    d="M12.2 6.3H11a1.3 1.3 0 0 0-1.3 1.3V9.2h2.3l-.32 2.2H9.7v5.6H7.4v-5.6H5.6V9.2h1.8V7.4c0-1.8 1.1-3.2 3.1-3.2h1.7v2.1Z"
                    fill="white"
                  />
                </svg>
              </span>
              <span
                aria-hidden="true"
                title="LinkedIn (coming soon)"
                className="block h-8 w-8 overflow-hidden rounded-lg opacity-60"
              >
                <svg viewBox="0 0 20 20" className="h-full w-full">
                  <rect width="20" height="20" fill="#0a66c2" />
                  <rect x="4.3" y="8" width="1.9" height="7" fill="white" />
                  <circle cx="5.25" cy="5.4" r="1.2" fill="white" />
                  <path
                    d="M8.6 8h1.9v1.1c.5-.7 1.3-1.3 2.4-1.3 1.9 0 2.9 1.2 2.9 3.4V15h-1.9v-3.5c0-.9-.4-1.7-1.4-1.7s-1.5.7-1.5 1.7V15H8.6V8Z"
                    fill="white"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-dashed border-cream/25 pt-5 font-body text-xs text-cream/50">
          &copy; 2026 Truly Susi&rsquo;s &middot; Sweeter together.
        </div>
      </div>
    </footer>
  );
}
