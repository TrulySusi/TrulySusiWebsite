import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getCategories } from "@/lib/catalog";
import { MenuGrid } from "@/components/MenuGrid";

export const metadata: Metadata = {
  title: "Products — Truly Susi's",
  description: "Homemade Tamil sweets, made fresh in Salem and shipped across India.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ShopPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [products, categories] = await Promise.all([
    getActiveProducts(q),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl text-navy">Our Products</h1>
        <p className="mt-3 font-body text-navy/60">
          Made in small batches, always fresh.
        </p>
      </div>

      {q?.trim() && (
        <p className="mt-8 font-body text-sm text-navy/60">
          {products.length > 0 ? "Results" : "No results"} for &ldquo;{q}&rdquo;
          {" · "}
          <Link href="/shop" className="text-coral hover:text-navy">
            Clear search
          </Link>
        </p>
      )}

      <div className="mt-10">
        <MenuGrid categories={categories} products={products} />
      </div>
    </main>
  );
}
