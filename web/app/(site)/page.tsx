import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/catalog";
import { FavouritesCarousel } from "@/components/FavouritesCarousel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TypewriterText } from "@/components/TypewriterText";

const PILLARS = [
  {
    title: "Care & Craftsmanship",
    body: "Small batches, stirred and watched by hand, nothing rushed.",
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
    body: "Every label lists what's actually inside , no shortcuts.",
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
  const favourites = await getFeaturedProducts(10);

  return (
    <main>
      {/* Hero — full-bleed background image, the client's own brass/heirloom
          flat-lay shot. The id is what the floating side tabs watch so they
          stay off the banner until it's scrolled past (see lib/floating-tabs). */}
      <section id="site-hero" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/brand/07_brass_collectibles.png"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-navy/45" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 py-28 text-center sm:px-10">
          <span className="inline-block rounded-full bg-white/10 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-brass">
            Homemade Products &middot; Salem &middot; Shipped all over in India
          </span>
          <h1 className="mt-6 font-display text-6xl font-medium text-white sm:text-7xl" aria-label="Sweeter together">
            <TypewriterText text="Sweeter together" />
          </h1>
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
      <section id="our-story" className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[420px_1fr]">
          <ScrollReveal>
            <Image
              src="/brand/susi_photo.jpg"
              alt="Susi with her family"
              width={700}
              height={613}
              className="mx-auto w-full max-w-sm rounded-2xl shadow-[0_1px_2px_rgba(4,28,53,.06),0_16px_36px_-16px_rgba(4,28,53,.28)] lg:max-w-none"
            />
          </ScrollReveal>
          <ScrollReveal delayMs={150} className="text-center lg:text-left">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-brass">
              Our Story
            </span>
            <h2 className="mt-4 font-display text-5xl italic text-navy sm:text-6xl">
              Truly Susi&rsquo;s begins with Susi.
            </h2>
            <div className="mt-5 flex flex-col gap-4 font-body text-[15px] leading-relaxed text-navy/70">
              <p>
                For as long as we can remember, Susi has had a real passion for
                feeding people, sharing the recipes carried down through
                generations of our family with everyone around her table.
              </p>
              <p>
                They say the one who truly enjoys food is the one who makes
                really good food. That has always been Susi. She cooks what she
                loves, and she loves sharing it. What started as a mother
                feeding her family slowly became a wish to feed everyone else
                too, to take the sweets and savouries her family grew up with
                and share that same warmth beyond our home.
              </p>
              <p>That&rsquo;s how Truly Susi&rsquo;s was born.</p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delayMs={100} className="mx-auto mt-16 max-w-2xl border-t border-navy/10 pt-12 text-center">
          <div className="flex flex-col gap-4 font-body text-[15px] leading-relaxed text-navy/70">
            <p>
              Every laddu, every halwa, every handful of snacks is still made
              the way Susi makes it at home, with the same recipes, the same
              patience, and the same care. From her kitchen, and from our
              generation to the next, we hope it finds a place in yours.
            </p>
            <p>
              For every occasion, every festival, and every little moment in
              between, Truly Susi&rsquo;s will always be there beside you.
            </p>
          </div>
          {/* text-center! — the global `p { text-align: justify }` rule would
              otherwise win over the wrapper's text-center and left-align these. */}
          <p className="mt-9 text-center! font-display text-2xl italic leading-snug text-navy">
            Some sweets you eat. This one, you remember.
          </p>
          <p className="mt-4 text-center! font-body text-xs font-semibold uppercase tracking-[0.28em] text-brass">
            Sweeter together
          </p>
        </ScrollReveal>
      </section>

      {/* Why Truly Susi's */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <ScrollReveal className="text-center">
          <h2 className="font-display text-3xl text-navy">Why Truly Susi&rsquo;s</h2>
        </ScrollReveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <ScrollReveal key={p.title} delayMs={i * 120}>
              <div className="rounded-2xl bg-white p-7 shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.12)]">
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
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Kuruvi — the brand's little-messenger mascot */}
      <section>
        <ScrollReveal className="mx-auto max-w-2xl px-6 py-16 text-center sm:px-10">
          <Image
            src="/brand/06_kuruvi.png"
            alt="Kuruvi, the little sparrow messenger"
            width={140}
            height={129}
            className="mx-auto h-[104px] w-auto"
          />
          <h2 className="mt-6 font-display text-3xl text-navy">Meet our Kuruvi</h2>
          <p className="mx-auto mt-4 max-w-md text-center! font-body text-[15px] leading-relaxed text-navy/70">
            In Tamil, குருவி means House Sparrow, the little bird that always finds its way
            home. Our Kuruvi is the messenger that flies between Susi&rsquo;s kitchen and your
            doorstep, carrying something sweet every time.
          </p>
          <p className="mt-4 text-center! font-body text-xs uppercase tracking-[0.2em] text-navy/45">
            குருவி -  The Little Messenger
          </p>
        </ScrollReveal>
      </section>

      {/* Favourites */}
      {favourites.length > 0 && (
        <section className="mx-auto max-w-480 px-6 py-16 sm:px-10 xl:px-16">
          <ScrollReveal className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-navy">This week&rsquo;s favourites</h2>
            <Link
              href="/shop"
              className="font-body text-sm font-medium text-brass hover:text-navy"
            >
              View all →
            </Link>
          </ScrollReveal>
          <ScrollReveal delayMs={150} className="mt-10">
            <FavouritesCarousel products={favourites} />
          </ScrollReveal>
        </section>
      )}
    </main>
  );
}
