import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  placeholderImageUrl,
} from "@/lib/catalog";
import { VariantSelector } from "@/components/VariantSelector";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Truly Susi's`,
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
        className="font-body text-xs font-medium uppercase tracking-[0.22em] text-navy/50 transition-colors hover:text-coral"
      >
        ← Back to menu
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden bg-navy/4">
          <Image
            src={placeholderImageUrl(slug, 1000, 1000)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        </div>

        <div>
          {product.categories?.name && (
            <span className="inline-block rounded-full bg-coral/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-coral">
              {product.categories.name}
            </span>
          )}
          <h1 className="mt-3 font-display text-5xl text-navy">{product.name}</h1>
          {product.short_description && (
            <p className="mt-4 max-w-[42ch] font-body text-base leading-relaxed text-navy/70">
              {product.short_description}
            </p>
          )}

          <div className="mt-8">
            <VariantSelector variants={product.product_variants} />
          </div>

          {(product.ingredients || product.shelf_life_days) && (
            <dl className="mt-10 space-y-3 border-t border-navy/10 pt-6">
              {product.ingredients && (
                <div className="flex gap-4 font-body text-sm">
                  <dt className="w-28 shrink-0 text-navy/50">Ingredients</dt>
                  <dd className="text-navy/80">{product.ingredients}</dd>
                </div>
              )}
              {product.allergen_info && (
                <div className="flex gap-4 font-body text-sm">
                  <dt className="w-28 shrink-0 text-navy/50">Allergens</dt>
                  <dd className="text-navy/80">{product.allergen_info}</dd>
                </div>
              )}
              {product.shelf_life_days && (
                <div className="flex gap-4 font-body text-sm">
                  <dt className="w-28 shrink-0 text-navy/50">Best before</dt>
                  <dd className="text-navy/80">
                    {product.shelf_life_days} days from packing, stored cool and dry
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>

      {product.description && (
        <p className="mt-20 max-w-3xl border-t border-navy/10 pt-12 font-display text-2xl italic leading-snug text-navy/85">
          {product.description}
        </p>
      )}

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
                  <td className="py-2 text-right tabular-nums text-navy">
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
