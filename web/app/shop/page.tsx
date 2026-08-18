import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Shop — Truly Susi's",
  description: "Homemade Tamil sweets, made fresh in Salem and shipped across India.",
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <main className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <div className="max-w-2xl">
        <span className="mb-6 inline-block font-body text-xs font-medium uppercase tracking-[0.32em] text-coral">
          The Sweets
        </span>
        <h1 className="font-display text-5xl text-cream sm:text-6xl">
          Made fresh in Salem.
          <br />
          Shipped across India.
        </h1>
      </div>

      {products.length === 0 ? (
        <p className="mt-16 font-body text-cream/60">
          Nothing&rsquo;s live yet — check back shortly.
        </p>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
