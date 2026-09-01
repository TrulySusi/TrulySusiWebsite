import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  productPhotoUrl,
  tamilName,
} from "@/lib/catalog";
import { VariantSelector } from "@/components/VariantSelector";
import { ProductCard } from "@/components/ProductCard";
import { ProductAccordion } from "@/components/ProductAccordion";
import { Breadcrumb } from "@/components/Breadcrumb";

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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          ...(product.categories?.name ? [{ label: product.categories.name }] : []),
          { label: product.name },
        ]}
      />

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
            <p className="mt-0.5 font-body text-base text-sage">{tamilName(slug)}</p>
          )}

          <div className="mt-8">
            <VariantSelector
              variants={product.product_variants}
              productSlug={product.slug}
              productName={product.name}
              imageUrl={productPhotoUrl(product)}
            />
          </div>
        </div>
      </div>

      <ProductAccordion
        shortDescription={product.short_description}
        ingredients={product.ingredients}
        allergenInfo={product.allergen_info}
        shelfLifeDays={product.shelf_life_days}
        servingSizeG={product.serving_size_g}
        nutritionPer100g={product.nutrition_per_100g}
      />

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
