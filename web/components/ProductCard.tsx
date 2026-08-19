"use client";

import Image from "next/image";
import Link from "next/link";
import {
  defaultVariant,
  placeholderImageUrl,
  startingPrice,
  type ProductSummary,
} from "@/lib/catalog-shared";
import { useCartStore } from "@/lib/cart-store";

export function ProductCard({ product }: { product: ProductSummary }) {
  const price = startingPrice(product.product_variants);
  const variant = defaultVariant(product.product_variants);
  const addItem = useCartStore((s) => s.addItem);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    addItem({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      priceInr: variant.price_inr,
    });
  }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-navy/12 bg-white shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.1)] transition-shadow group-hover:shadow-[0_1px_2px_rgba(4,28,53,.06),0_12px_28px_-12px_rgba(4,28,53,.18)]"
    >
      <div className="relative aspect-square bg-navy/4">
        <Image
          src={placeholderImageUrl(product.slug)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="border-t border-navy/12 p-4">
        {product.categories?.name && (
          <span className="inline-block rounded-full bg-blush px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brass">
            {product.categories.name}
          </span>
        )}
        <h3 className="mt-2 font-display text-2xl text-navy">{product.name}</h3>
        {product.short_description && (
          <p className="mt-1.5 line-clamp-2 font-body text-sm leading-relaxed text-navy/60">
            {product.short_description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          {price !== null ? (
            <span className="whitespace-nowrap font-body text-base font-bold text-navy">
              From &#8377;{price.toFixed(0)}
            </span>
          ) : (
            <span />
          )}
          {variant && (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="rounded-full bg-brass/15 px-4 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
