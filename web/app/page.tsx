import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { placeholderImageUrl } from "@/lib/catalog";

const PILLARS = [
  {
    title: "Care & Craftsmanship",
    body: "Small batches, stirred and watched by hand — nothing rushed.",
    icon: (
      <path
        d="M10 17.5s-6.5-4.06-6.5-8.75A3.75 3.75 0 0 1 10 6.4a3.75 3.75 0 0 1 6.5 2.35c0 4.69-6.5 8.75-6.5 8.75Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Honesty & Transparency",
    body: "Every label lists what's actually inside — no shortcuts.",
    icon: (
      <path
        d="M10 2.5 16.5 5v4.5c0 4.14-2.79 7.36-6.5 8-3.71-.64-6.5-3.86-6.5-8V5L10 2.5Zm-2.4 7.6 1.8 1.8 3.2-3.6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Heritage & Nostalgia",
    body: "Recipes passed down, remembered in taste, felt in every bite.",
    icon: (
      <path
        d="M3 9.5 10 4l7 5.5V17a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1V9.5Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default async function Home() {
  const favourites = await getFeaturedProducts();

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-coral/10 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-coral">
              Homemade Tamil Sweets &middot; Salem
            </span>
            <h1 className="mt-6 font-display text-6xl italic text-navy sm:text-7xl">
              Sweeter together.
            </h1>
            <p className="mt-5 max-w-lg font-body text-base leading-relaxed text-navy/70">
              Badam Halwa slow-cooked in ghee, Mysore Pak stirred until it
              just holds its shape, and Thenkulal fried the way festivals
              call for — made by hand in Salem, shipped anywhere in India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-navy px-7 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
              >
                Explore the menu
              </Link>
              <Link
                href="#meet-susi"
                className="rounded-full bg-navy/6 px-7 py-3.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
              >
                Our story
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy/4">
            <Image
              src={placeholderImageUrl("home-hero", 900, 675)}
              alt="Truly Susi's sweets"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why Truly Susi's */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="text-center">
          <h2 className="font-display text-3xl text-navy">Why Truly Susi&rsquo;s</h2>
          <p className="mt-2 font-body text-sm text-navy/60">
            Three things we&rsquo;ve never compromised on
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl bg-navy/4 p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/10 text-coral">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="h-5 w-5">
                  {p.icon}
                </svg>
              </div>
              <h3 className="mt-4 font-body text-base font-semibold text-navy">
                {p.title}
              </h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-navy/65">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Favourites */}
      {favourites.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-navy">This week&rsquo;s favourites</h2>
            <Link
              href="/shop"
              className="font-body text-sm font-medium text-coral hover:text-navy"
            >
              View all →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(220px,260px))] gap-x-8 gap-y-14">
            {favourites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Meet Susi */}
      <section id="meet-susi" className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy/4">
            <Image
              src={placeholderImageUrl("meet-susi", 700, 875)}
              alt="Susi, in her kitchen"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-coral">
              Our Story
            </span>
            <h2 className="mt-4 font-display text-4xl text-navy">Meet Susi.</h2>
            <p className="mt-5 max-w-md font-body text-[15px] leading-relaxed text-navy/70">
              She is someone who brings warmth into a room before she&rsquo;s
              even said hello. Feeding people is what makes her happiest —
              not because anyone asked her to, but because she gets to.
              Family recipes, never written down, just passed between
              hands.
            </p>
            <div className="mt-9 border-t border-navy/10 pt-7 font-display text-2xl italic leading-snug text-navy">
              &ldquo;Some sweets you eat. This one, you remember.&rdquo;
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
