import type { Metadata } from "next";
import { getActiveProducts, getCategories } from "@/lib/catalog";
import { MenuGrid } from "@/components/MenuGrid";

export const metadata: Metadata = {
  title: "Shop — Truly Susi's",
  description: "Homemade Tamil sweets, made fresh in Salem and shipped across India.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl text-navy">Our menu</h1>
        <p className="mt-3 font-body text-navy/60">
          Made in small batches, always fresh.
        </p>
      </div>

      <div className="mt-10">
        <MenuGrid categories={categories} products={products} />
      </div>
    </main>
  );
}
