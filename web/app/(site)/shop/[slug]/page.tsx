import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, tamilName, weightLabel } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { ProductDetailGallery } from "@/components/ProductDetailGallery";
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
  const settings = await getSiteSettings();

  // Net quantity has to appear on the listing; derive it from the active
  // pack sizes rather than storing it twice.
  const netQuantities =
    product.product_variants
      .filter((v) => v.is_active)
      .sort((a, b) => a.weight_grams - b.weight_grams)
      .map((v) => weightLabel(v.weight_grams).replace(" box", ""))
      .join(" · ") || null;

  const labelling = {
    isVegetarian: product.is_vegetarian ?? true,
    additives: product.additives ?? null,
    netQuantities,
    manufacturedBy: settings.manufacturedBy,
    address: settings.address,
    countryOfOrigin: settings.countryOfOrigin,
    fssaiLicenceNo: settings.fssaiLicenceNo,
    customerCareEmail: settings.customerCareEmail,
  };

  return (
    <main className="mx-auto max-w-350 px-6 py-16 sm:px-10">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          ...(product.categories?.name ? [{ label: product.categories.name }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-8">
        <ProductDetailGallery
          slug={product.slug}
          productName={product.name}
          categoryName={product.categories?.name ?? null}
          tamil={tamilName(slug)}
          description={product.description || product.short_description}
          isVegetarian={product.is_vegetarian ?? true}
          images={product.product_images}
          variants={product.product_variants}
        />
      </div>

      <ProductAccordion
        ingredients={product.ingredients}
        allergenInfo={product.allergen_info}
        shelfLifeDays={product.shelf_life_days}
        servingSizeG={product.serving_size_g}
        nutritionPer100g={product.nutrition_per_100g}
        labelling={labelling}
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
