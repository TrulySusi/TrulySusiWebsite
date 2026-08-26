import Image from "next/image";
import Link from "next/link";
import { productPhotoUrl, startingPrice, tamilName, type ProductSummary } from "@/lib/catalog-shared";

export function ProductCard({ product }: { product: ProductSummary }) {
  const price = startingPrice(product.product_variants);
  const tamil = tamilName(product.slug);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-navy/12 bg-white shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.1)] transition-shadow group-hover:shadow-[0_1px_2px_rgba(4,28,53,.06),0_12px_28px_-12px_rgba(4,28,53,.18)]"
    >
      <div className="relative aspect-square bg-navy/4">
        <Image
          src={productPhotoUrl(product)}
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
        {tamil && <p className="font-body text-xs text-sage">{tamil}</p>}
        {product.short_description && (
          <p className="mt-1.5 line-clamp-2 font-body text-sm leading-relaxed text-navy/60">
            {product.short_description}
          </p>
        )}
        {price !== null && (
          <p className="mt-3 whitespace-nowrap font-body text-base font-bold text-navy">
            From &#8377;{price.toFixed(0)}
          </p>
        )}
      </div>
    </Link>
  );
}
