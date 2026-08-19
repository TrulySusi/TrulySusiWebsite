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
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.12)] transition-shadow group-hover:shadow-[0_1px_2px_rgba(4,28,53,.06),0_12px_28px_-12px_rgba(4,28,53,.2)]">
        <Image
          src={placeholderImageUrl(product.slug)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4">
        {product.categories?.name && (
          <span className="inline-block rounded-full bg-coral/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-coral">
            {product.categories.name}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-display text-2xl text-navy">{product.name}</h3>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        {price !== null ? (
          <span className="whitespace-nowrap font-display text-base italic text-coral">
            from &#8377;{price.toFixed(0)}
          </span>
        ) : (
          <span />
        )}
        {variant && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="rounded-full bg-navy/8 px-4 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
          >
            Add
          </button>
        )}
      </div>
      {product.short_description && (
        <p className="mt-2 max-w-[38ch] font-body text-sm leading-relaxed text-navy/70">
          {product.short_description}
        </p>
      )}
    </Link>
  );
}
