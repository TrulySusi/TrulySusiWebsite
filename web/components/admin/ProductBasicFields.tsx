"use client";

import { useState, type ReactNode } from "react";
import { NUTRITION_FIELDS, type NutritionPer100g } from "@/lib/catalog-shared";

export const fieldClass =
  "w-full rounded-lg border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

export function Field({
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

export type ProductBasicDefaults = {
  name?: string;
  slug?: string;
  category_id?: string | null;
  short_description?: string | null;
  description?: string | null;
  ingredients?: string | null;
  allergen_info?: string | null;
  shelf_life_days?: number | null;
  serving_size_g?: number | null;
  status?: string;
  is_featured?: boolean;
  nutrition_per_100g?: NutritionPer100g | null;
};

/**
 * The full basic-info field set, shared between the edit page's Basic info
 * tab (AdminProductForm) and the new-product wizard's first step
 * (AdminNewProductWizard) — same fields available at creation time as at
 * edit time, no more "fill in the rest later" second form.
 */
export function ProductBasicFields({
  defaults,
  categories,
}: {
  defaults?: ProductBasicDefaults;
  categories: { id: string; name: string }[];
}) {
  const [showNutrition, setShowNutrition] = useState(false);
  const d = defaults ?? {};

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Product name">
          <input name="name" defaultValue={d.name} required className={fieldClass} />
        </Field>
        <Field label="URL slug" hint="Optional: generated from the name if left blank">
          <input name="slug" defaultValue={d.slug} className={fieldClass} />
        </Field>
        <Field label="Category">
          <select name="category_id" defaultValue={d.category_id ?? ""} className={fieldClass}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" hint="Only Active products show on the live site">
          <select name="status" defaultValue={d.status ?? "draft"} className={fieldClass}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Shelf life (days)">
          <input
            name="shelf_life_days"
            type="number"
            defaultValue={d.shelf_life_days ?? ""}
            className={fieldClass}
          />
        </Field>
        <Field label="Weight of one piece (g)" hint="Used to show '≈ N pieces' per pack size">
          <input
            name="serving_size_g"
            type="number"
            defaultValue={d.serving_size_g ?? ""}
            className={fieldClass}
          />
        </Field>
      </div>

      <Field label="Short description" hint="Shown on product cards across the site">
        <textarea
          name="short_description"
          defaultValue={d.short_description ?? ""}
          rows={2}
          className={`resize-none ${fieldClass}`}
        />
      </Field>
      <Field label="Full description" hint="Shown on the product's own page">
        <textarea
          name="description"
          defaultValue={d.description ?? ""}
          rows={4}
          className={`resize-none ${fieldClass}`}
        />
      </Field>
      <Field label="Ingredients">
        <textarea
          name="ingredients"
          defaultValue={d.ingredients ?? ""}
          rows={2}
          className={`resize-none ${fieldClass}`}
        />
      </Field>
      <Field label="Allergen info">
        <textarea
          name="allergen_info"
          defaultValue={d.allergen_info ?? ""}
          rows={2}
          className={`resize-none ${fieldClass}`}
        />
      </Field>

      <label className="flex items-center gap-2.5 font-body text-sm text-navy/70">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={d.is_featured}
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
                defaultValue={d.nutrition_per_100g?.[key] ?? ""}
                className={fieldClass}
              />
            </Field>
          ))}
        </div>
      )}
    </>
  );
}
