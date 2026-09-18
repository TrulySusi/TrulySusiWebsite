"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { ProductSummary } from "@/lib/catalog-shared";

// Same breakpoint column counts as the shop grid (2/3/4/5) so a page of
// favourites always lines up with how many show per row there.
const CARD_WIDTH =
  "w-[calc((100%-1.5rem)/2)] sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)]";

export function FavouritesCarousel({ products }: { products: ProductSummary[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * scrollRef.current.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className={`shrink-0 snap-start ${CARD_WIDTH}`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {products.length > 5 && (
        <>
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Previous favourites"
            className="absolute left-0 top-[38%] hidden h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-navy/15 bg-white text-navy shadow-md transition-colors hover:bg-cream sm:flex"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              <path d="M12.5 5 7.5 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Next favourites"
            className="absolute right-0 top-[38%] hidden h-10 w-10 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-navy/15 bg-white text-navy shadow-md transition-colors hover:bg-cream sm:flex"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
