import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  productPhotoUrl,
  tamilName,
} from "@/lib/catalog";
import { VariantSelector } from "@/components/VariantSelector";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} · Truly Susi's`,
    description: product.short_description ?? undefined,
  };
}

const NUTRITION_ROWS: Array<[key: string, label: string, unit: string]> = [
  ["energy_kcal", "Energy", "Kcal"],
  ["protein_g", "Protein", "g"],
  ["total_carb_g", "Total Carbohydrate", "g"],
  ["total_fat_g", "Total Fat", "g"],
  ["saturated_fat_g", "Saturated Fat", "g"],
  ["trans_fat_g", "Trans Fat", "g"],
  ["total_sugar_g", "Total Sugar", "g"],
  ["dietary_fibre_g", "Dietary Fibre", "g"],
  ["cholesterol_mg", "Cholesterol", "mg"],
  ["sodium_mg", "Sodium", "mg"],
];

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <Link
        href="/shop"
        className="font-body text-xs font-medium uppercase tracking-[0.22em] text-navy/50 transition-colors hover:text-brass"
      >
        ← Back to products
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(4,28,53,.04),0_8px_24px_-12px_rgba(4,28,53,.12)]">
          <Image
            src={productPhotoUrl(product)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        </div>

        <div>
          {product.categories?.name && (
            <span className="inline-block rounded-full bg-blush px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brass">
              {product.categories.name}
            </span>
          )}
          <h1 className="mt-3 font-display text-5xl text-navy">{product.name}</h1>
          {tamilName(slug) && (
            <p className="mt-0.5 font-body text-base text-navy/45">{tamilName(slug)}</p>
          )}
          {product.short_description && (
            <p className="mt-4 max-w-[42ch] font-body text-base leading-relaxed text-navy/70">
              {product.short_description}
            </p>
          )}

          {product.ingredients && (
            <p className="mt-5 font-body text-sm text-navy/70">
              <span className="font-semibold text-navy">Contains: </span>
              {product.ingredients}
            </p>
          )}
          {product.allergen_info && (
            <p className="mt-1.5 font-body text-xs text-navy/50">{product.allergen_info}</p>
          )}

          <div className="mt-8">
            <VariantSelector
              variants={product.product_variants}
              productSlug={product.slug}
              productName={product.name}
              imageUrl={productPhotoUrl(product)}
            />
          </div>

          {product.shelf_life_days && (
            <p className="mt-2 font-body text-xs text-navy/45">
              Best before {product.shelf_life_days} days from packing, stored cool and dry.
            </p>
          )}
        </div>
      </div>

      {product.nutrition_per_100g && (
        <div className="mt-16 max-w-md">
          <h2 className="font-body text-xs font-medium uppercase tracking-[0.22em] text-navy/50">
            Nutrition, per 100g
            {product.serving_size_g ? ` · 1 piece = ${product.serving_size_g}g` : ""}
          </h2>
          <table className="mt-4 w-full border-collapse font-body text-sm">
            <tbody>
              {NUTRITION_ROWS.map(([key, label, unit]) => (
                <tr key={key} className="border-b border-navy/10">
                  <td className="py-2 text-navy/70">{label}</td>
                  <td className="py-2 text-right font-bold tabular-nums text-navy">
                    {product.nutrition_per_100g![key as keyof typeof product.nutrition_per_100g]}
                    {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-24 border-t border-navy/10 pt-16">
          <h2 className="font-display text-3xl text-navy">More from the kitchen</h2>
          <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(220px,280px))] gap-x-8 gap-y-14">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
