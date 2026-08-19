"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Category, ProductSummary } from "@/lib/catalog-shared";

export function MenuGrid({
  categories,
  products,
}: {
  categories: Category[];
  products: ProductSummary[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? products.filter((p) => p.categories?.name === activeCategory)
    : products;

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-navy text-cream"
                : "bg-navy/6 text-navy hover:bg-navy/10"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.name)}
              className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-colors ${
                activeCategory === cat.name
                  ? "bg-navy text-cream"
                  : "bg-navy/6 text-navy hover:bg-navy/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-16 font-body text-navy/60">
          Nothing here yet -  check back shortly.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(220px,280px))] gap-x-8 gap-y-14">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
