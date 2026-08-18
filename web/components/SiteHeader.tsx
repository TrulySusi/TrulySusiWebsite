import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-navy/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="font-display text-2xl italic font-semibold text-cream"
        >
          Truly Susi&rsquo;s
        </Link>
        <nav>
          <ul className="flex items-center gap-8">
            <li>
              <Link
                href="/shop"
                className="font-body text-xs font-medium uppercase tracking-[0.22em] text-cream/70 transition-colors hover:text-coral"
              >
                Shop
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
