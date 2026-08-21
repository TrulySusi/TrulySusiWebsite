"use client";

import { useState, type ReactNode } from "react";
import { updateProduct, NUTRITION_FIELDS } from "@/app/admin/products/actions";
import type { NutritionPer100g } from "@/lib/catalog-shared";

const fieldClass =
  "w-full rounded-lg border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="font-body text-xs font-medium text-navy/60">{label}</span>
      {children}
      {hint && <span className="font-body text-[11px] text-navy/40">{hint}</span>}
    </label>
  );
}

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
      className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6"
    >
      <h2 className="font-display text-xl text-navy">Basic info</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Product name">
          <input name="name" defaultValue={product.name} required className={fieldClass} />
        </Field>
        <Field label="URL slug" hint="Used in the product's web address: /shop/your-slug">
          <input name="slug" defaultValue={product.slug} className={fieldClass} />
        </Field>
        <Field label="Category">
          <select name="category_id" defaultValue={product.category_id ?? ""} className={fieldClass}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" hint="Only Active products show on the live site">
          <select name="status" defaultValue={product.status} className={fieldClass}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Shelf life (days)">
          <input
            name="shelf_life_days"
            type="number"
            defaultValue={product.shelf_life_days ?? ""}
            className={fieldClass}
          />
        </Field>
        <Field label="Weight of one piece (g)" hint="Used to show '≈ N pieces' per pack size">
          <input
            name="serving_size_g"
            type="number"
            defaultValue={product.serving_size_g ?? ""}
            className={fieldClass}
          />
        </Field>
      </div>

      <Field label="Short description" hint="Shown on product cards across the site">
        <textarea
          name="short_description"
          defaultValue={product.short_description ?? ""}
          rows={2}
          className={`resize-none ${fieldClass}`}
        />
      </Field>
      <Field label="Full description" hint="Shown on the product's own page">
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={4}
          className={`resize-none ${fieldClass}`}
        />
      </Field>
      <Field label="Ingredients">
        <textarea
          name="ingredients"
          defaultValue={product.ingredients ?? ""}
          rows={2}
          className={`resize-none ${fieldClass}`}
        />
      </Field>
      <Field label="Allergen info">
        <textarea
          name="allergen_info"
          defaultValue={product.allergen_info ?? ""}
          rows={2}
          className={`resize-none ${fieldClass}`}
        />
      </Field>

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
            <Field key={key} label={NUTRITION_LABELS[key]}>
              <input
                type="number"
                step="0.1"
                name={`nutrition_${key}`}
                defaultValue={product.nutrition_per_100g?.[key] ?? ""}
                className={fieldClass}
              />
            </Field>
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
