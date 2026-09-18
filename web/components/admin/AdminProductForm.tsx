"use client";

import { useState } from "react";
import { updateProduct } from "@/app/admin/products/actions";
import type { NutritionPer100g } from "@/lib/catalog-shared";
import { ProductBasicFields } from "@/components/admin/ProductBasicFields";

type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  ingredients: string | null;
  allergen_info: string | null;
  shelf_life_days: number | null;
  serving_size_g: number | null;
  status: string;
  is_featured: boolean;
  nutrition_per_100g: NutritionPer100g | null;
};

export function AdminProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: { id: string; name: string }[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await updateProduct(product.id, new FormData(e.currentTarget));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6"
    >
      <h2 className="font-body text-xl font-semibold text-navy">Basic info</h2>

      <ProductBasicFields defaults={product} categories={categories} />

      {error && <p className="font-body text-sm text-brass">{error}</p>}
      {saved && <p className="font-body text-sm text-sage">Saved.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 self-start rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
