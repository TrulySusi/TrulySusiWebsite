import Image from "next/image";
import Link from "next/link";
import {
  placeholderImageUrl,
  startingPrice,
  type ProductSummary,
} from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductSummary }) {
  const price = startingPrice(product.product_variants);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-cream/6">
        <Image
          src={placeholderImageUrl(product.slug)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl text-cream">{product.name}</h3>
        {price !== null && (
          <span className="whitespace-nowrap font-display text-base italic text-coral">
            from &#8377;{price.toFixed(0)}
          </span>
        )}
      </div>
      {product.short_description && (
        <p className="mt-2 max-w-[38ch] font-body text-sm leading-relaxed text-cream/70">
          {product.short_description}
        </p>
      )}
    </Link>
  );
}
