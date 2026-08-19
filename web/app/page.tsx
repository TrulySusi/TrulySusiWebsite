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
      {/* Hero — full-bleed background image, swap the src below for the
          client's own photo once shared; everything else stays. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={placeholderImageUrl("home-hero", 1600)}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-navy/75" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 py-28 text-center sm:px-10">
          <span className="inline-block rounded-full bg-white/10 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-coral">
            Homemade Tamil Sweets &middot; Salem
          </span>
          <h1 className="mt-6 font-display text-6xl font-medium text-white sm:text-7xl">
            Sweeter together.
          </h1>
          <p className="mx-auto mt-5 max-w-md font-body text-base leading-relaxed text-white/85">
            Badam Halwa slow-cooked in ghee, Mysore Pak stirred until it
            just holds its shape, and Thenkulal fried the way festivals
            call for — made by hand in Salem, shipped anywhere in India.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-white px-7 py-3.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-white/90"
            >
              Explore the products
            </Link>
            <Link
              href="#our-story"
              className="rounded-full border border-white/40 px-7 py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="our-story" className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-10">
        <span className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-coral">
          Our Story
        </span>
        <h2 className="mt-4 font-display text-5xl italic text-navy sm:text-6xl">
          Truly Susi&rsquo;s begins with Susi.
        </h2>
        <p className="mx-auto mt-5 max-w-md font-body text-[15px] leading-relaxed text-navy/70">
          Born from a mother&rsquo;s lifelong love for feeding people well,
          Truly Susi&rsquo;s turns family recipes into deeply comforting,
          homemade food meant to be shared beyond the home.
        </p>
        <div className="mx-auto mt-9 max-w-md border-t border-navy/10 pt-7 font-display text-2xl italic leading-snug text-navy">
          &ldquo;Some sweets you eat. This one, you remember.&rdquo;
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
            <div
              key={p.title}
              className="rounded-2xl bg-white p-7 shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.12)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sage">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="h-5 w-5">
                    {p.icon}
                  </svg>
                </div>
                <h3 className="font-body text-base font-semibold text-navy">
                  {p.title}
                </h3>
              </div>
              <p className="mt-3 font-body text-sm leading-relaxed text-navy/65">
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
              <ProductCard key={product.id} product={product} showDescription={false} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
