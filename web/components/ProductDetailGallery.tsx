"use client";

import { useState } from "react";
import Image from "next/image";
import {
  productImageUrl,
  photoZoomStyle,
  placeholderImageUrl,
  type ProductImage,
  type ProductVariant,
} from "@/lib/catalog-shared";
import { VariantSelector } from "@/components/VariantSelector";

const FRAME_RATIO = 4 / 5;

export function ProductDetailGallery({
  slug,
  productName,
  categoryName,
  tamil,
  images,
  variants,
}: {
  slug: string;
  productName: string;
  categoryName: string | null;
  tamil: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
}) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const active = variants.filter((v) => v.is_active);
  const initialVariant = active.find((v) => v.is_default) ?? active[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(initialVariant?.id ?? null);
  const [manualImageId, setManualImageId] = useState<string | null>(null);

  // A manually-clicked thumbnail wins until the shopper picks a different
  // pack size — that's a clearer signal of intent than whatever photo
  // happened to load first, so switching variants clears the override and
  // lets that variant's own tagged photo (or the cover) take over again.
  const variantImage = sorted.find((img) => img.variant_id === selectedVariantId);
  const manualImage = manualImageId ? sorted.find((img) => img.id === manualImageId) : undefined;
  const activeImage = manualImage ?? variantImage ?? sorted[0];
  const activeImageUrl = activeImage ? productImageUrl(activeImage.storage_path) : placeholderImageUrl(slug);

  function handleVariantChange(id: string) {
    setSelectedVariantId(id);
    setManualImageId(null);
  }

  function step(direction: -1 | 1) {
    if (sorted.length < 2 || !activeImage) return;
    const currentIndex = sorted.findIndex((img) => img.id === activeImage.id);
    const nextIndex = (currentIndex + direction + sorted.length) % sorted.length;
    setManualImageId(sorted[nextIndex].id);
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.12)]">
          <Image
            src={activeImageUrl}
            alt={productName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            style={
              activeImage
                ? photoZoomStyle(activeImage.focal_y, activeImage.zoom, activeImage.width, activeImage.height, FRAME_RATIO)
                : undefined
            }
          />

          {sorted.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-navy/15 bg-white text-navy shadow-md transition-colors hover:bg-cream"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                  <path d="M12.5 5 7.5 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-navy/15 bg-white text-navy shadow-md transition-colors hover:bg-cream"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                  <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {sorted.length > 1 && (
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
            {sorted.map((img) => {
              const isActive = img.id === activeImage?.id;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setManualImageId(img.id)}
                  aria-label={`Show photo ${img.sort_order + 1}`}
                  aria-pressed={isActive}
                  className={`relative aspect-4/5 h-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    isActive ? "border-navy" : "border-transparent hover:border-navy/25"
                  }`}
                >
                  <Image
                    src={productImageUrl(img.storage_path)}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        {categoryName && (
          <span className="inline-block rounded-full bg-blush px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brass">
            {categoryName}
          </span>
        )}
        <h1 className="mt-3 font-display text-5xl text-navy">{productName}</h1>
        {tamil && <p className="mt-0.5 font-body text-base text-sage">{tamil}</p>}

        <div className="mt-8">
          <VariantSelector
            variants={variants}
            productSlug={slug}
            productName={productName}
            imageUrl={activeImageUrl}
            selectedId={selectedVariantId}
            onSelectedChange={handleVariantChange}
          />
        </div>
      </div>
    </div>
  );
}
