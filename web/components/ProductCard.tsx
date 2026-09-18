import Image from "next/image";
import Link from "next/link";
import {
  productPhotoUrl,
  productCoverImage,
  photoScale,
  startingPrice,
  tamilName,
  type ProductSummary,
} from "@/lib/catalog-shared";

// A little wider than tall, rather than square — shows more of each photo
// at a glance across a row of cards.
const FRAME_RATIO = 4 / 3;

export function ProductCard({ product }: { product: ProductSummary }) {
  const price = startingPrice(product.product_variants);
  const tamil = tamilName(product.slug);
  const cover = productCoverImage(product);
  const scale = photoScale(cover?.zoom, cover?.width, cover?.height, FRAME_RATIO);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-navy/12 bg-white shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.1)] transition-shadow group-hover:shadow-[0_1px_2px_rgba(4,28,53,.06),0_12px_28px_-12px_rgba(4,28,53,.18)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy/4">
        <Image
          src={productPhotoUrl(product)}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
          className="product-photo"
          style={
            {
              objectFit: "contain",
              transformOrigin: `50% ${cover?.focal_y ?? 50}%`,
              "--photo-scale": scale,
            } as React.CSSProperties
          }
        />
      </div>
      <div className="flex flex-1 flex-col border-t border-navy/12 p-4">
        {product.categories?.name && (
          <span className="inline-block w-fit rounded-full bg-blush px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brass">
            {product.categories.name}
          </span>
        )}
        <h3 className="mt-2 font-display text-2xl text-navy">{product.name}</h3>
        {tamil && <p className="font-body text-xs text-sage">{tamil}</p>}
        {product.short_description && (
          <p className="mt-1.5 line-clamp-2 font-body text-sm leading-relaxed text-navy/60">
            {product.short_description}
          </p>
        )}
        {price !== null && (
          <p className="mt-auto whitespace-nowrap pt-3 font-body text-base font-bold text-navy">
            From &#8377;{price.toFixed(0)}
          </p>
        )}
      </div>
    </Link>
  );
}
