import Image from "next/image";
import Link from "next/link";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Menu" },
  { href: "/track-order", label: "Track Order" },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="relative h-7 w-32">
              <Image
                src="/brand/wordmark-cream.png"
                alt="Truly Susi's"
                fill
                sizes="128px"
                className="object-contain object-left"
              />
            </div>
            <p className="mt-4 font-display italic text-cream/70">
              Sweeter together.
            </p>
          </div>

          <div>
            <h3 className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-cream/80 transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-2.5 font-body text-sm text-cream/80">
              <li>
                <a
                  href="mailto:feedback@trulysusi.in"
                  className="transition-colors hover:text-cream"
                >
                  feedback@trulysusi.in
                </a>
              </li>
              <li>Salem, Tamil Nadu</li>
              <li>
                <a
                  href="https://instagram.com/trulysusi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-cream"
                >
                  @trulysusi
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6 font-body text-xs text-cream/50">
          &copy; 2026 Truly Susi&rsquo;s
        </div>
      </div>
    </footer>
  );
}
