import Image from "next/image";
import Link from "next/link";
import {
  productImageUrl,
  startingPrice,
  type ProductSummary,
} from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductSummary }) {
  const cover = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order,
  )[0];
  const price = startingPrice(product.product_variants);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-navy/[.04]">
        {cover ? (
          <Image
            src={productImageUrl(cover.storage_path)}
            alt={cover.alt_text ?? product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-sm italic text-navy/40">
            Photo soon
          </div>
        )}
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl text-navy">{product.name}</h3>
        {price !== null && (
          <span className="whitespace-nowrap font-display text-base italic text-coral">
            from &#8377;{price.toFixed(0)}
          </span>
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
