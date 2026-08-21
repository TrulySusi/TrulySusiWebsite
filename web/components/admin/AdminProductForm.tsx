"use client";

import { useState } from "react";
import { updateProduct, NUTRITION_FIELDS } from "@/app/admin/products/actions";
import type { NutritionPer100g } from "@/lib/catalog-shared";

const fieldClass =
  "w-full rounded-lg border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

const NUTRITION_LABELS: Record<(typeof NUTRITION_FIELDS)[number], string> = {
  energy_kcal: "Energy (kcal)",
  protein_g: "Protein (g)",
  total_carb_g: "Total carbs (g)",
  total_fat_g: "Total fat (g)",
  saturated_fat_g: "Saturated fat (g)",
  trans_fat_g: "Trans fat (g)",
  mono_unsat_fat_g: "Monounsaturated fat (g)",
  poly_unsat_fat_g: "Polyunsaturated fat (g)",
  added_sugar_g: "Added sugar (g)",
  total_sugar_g: "Total sugar (g)",
  cholesterol_mg: "Cholesterol (mg)",
  dietary_fibre_g: "Dietary fibre (g)",
  sodium_mg: "Sodium (mg)",
};

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
  const [showNutrition, setShowNutrition] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await updateProduct(product.id, new FormData(e.currentTarget));
      setSaved(true);
    } catch {
      setError("Couldn't save. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-6"
    >
      <h2 className="font-display text-xl text-navy">Basic info</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" defaultValue={product.name} placeholder="Product name" required className={fieldClass} />
        <input name="slug" defaultValue={product.slug} placeholder="URL slug" className={fieldClass} />
        <select name="category_id" defaultValue={product.category_id ?? ""} className={fieldClass}>
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={product.status} className={fieldClass}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <input
          name="shelf_life_days"
          type="number"
          defaultValue={product.shelf_life_days ?? ""}
          placeholder="Shelf life (days)"
          className={fieldClass}
        />
        <input
          name="serving_size_g"
          type="number"
          defaultValue={product.serving_size_g ?? ""}
          placeholder="Weight of one piece (g)"
          className={fieldClass}
        />
      </div>

      <textarea
        name="short_description"
        defaultValue={product.short_description ?? ""}
        placeholder="Short description (shown on product cards)"
        rows={2}
        className={`resize-none ${fieldClass}`}
      />
      <textarea
        name="description"
        defaultValue={product.description ?? ""}
        placeholder="Full description"
        rows={4}
        className={`resize-none ${fieldClass}`}
      />
      <textarea
        name="ingredients"
        defaultValue={product.ingredients ?? ""}
        placeholder="Ingredients"
        rows={2}
        className={`resize-none ${fieldClass}`}
      />
      <textarea
        name="allergen_info"
        defaultValue={product.allergen_info ?? ""}
        placeholder="Allergen info"
        rows={2}
        className={`resize-none ${fieldClass}`}
      />

      <label className="flex items-center gap-2.5 font-body text-sm text-navy/70">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={product.is_featured}
          className="h-4 w-4 rounded border-navy/30 text-navy focus:ring-1 focus:ring-navy/20"
        />
        Featured on the home page
      </label>

      <button
        type="button"
        onClick={() => setShowNutrition((s) => !s)}
        className="self-start font-body text-xs font-semibold text-brass hover:text-navy"
      >
        {showNutrition ? "Hide nutrition panel" : "Edit nutrition panel (per 100g)"}
      </button>

      {showNutrition && (
        <div className="grid grid-cols-1 gap-3 rounded-lg bg-cream p-4 sm:grid-cols-3">
          {NUTRITION_FIELDS.map((key) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="font-body text-xs text-navy/60">{NUTRITION_LABELS[key]}</span>
              <input
                type="number"
                step="0.1"
                name={`nutrition_${key}`}
                defaultValue={product.nutrition_per_100g?.[key] ?? ""}
                className={fieldClass}
              />
            </label>
          ))}
        </div>
      )}

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
