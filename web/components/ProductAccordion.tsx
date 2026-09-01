"use client";

import { useState } from "react";
import { useReviewsWidget } from "@/components/ReviewsWidgetContext";
import type { NutritionPer100g } from "@/lib/catalog-shared";

const NUTRITION_ROWS: Array<[key: keyof NutritionPer100g, label: string, unit: string]> = [
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

type Props = {
  shortDescription: string | null;
  ingredients: string | null;
  allergenInfo: string | null;
  shelfLifeDays: number | null;
  servingSizeG: number | null;
  nutritionPer100g: NutritionPer100g | null;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionItem({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-navy/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-body text-sm font-semibold text-navy">{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="pb-5 font-body text-sm leading-relaxed text-navy/70">{children}</div>}
    </div>
  );
}

export function ProductAccordion({
  shortDescription,
  ingredients,
  allergenInfo,
  shelfLifeDays,
  servingSizeG,
  nutritionPer100g,
}: Props) {
  const { openReviews } = useReviewsWidget();
  // Only one section open at a time — opening a new one collapses whichever
  // was previously open, instead of everything stacking up independently.
  const [openTitle, setOpenTitle] = useState<string | null>("Product Description");

  function toggle(title: string) {
    setOpenTitle((current) => (current === title ? null : title));
  }

  return (
    <div className="mt-16 max-w-2xl">
      {shortDescription && (
        <AccordionItem title="Product Description" open={openTitle === "Product Description"} onToggle={() => toggle("Product Description")}>
          <p>{shortDescription}</p>
        </AccordionItem>
      )}

      {(ingredients || allergenInfo) && (
        <AccordionItem title="Ingredients" open={openTitle === "Ingredients"} onToggle={() => toggle("Ingredients")}>
          {ingredients && <p>{ingredients}</p>}
          {allergenInfo && <p className={ingredients ? "mt-2 text-navy/50" : "text-navy/50"}>{allergenInfo}</p>}
        </AccordionItem>
      )}

      {nutritionPer100g && (
        <AccordionItem
          title="Nutrition Information"
          open={openTitle === "Nutrition Information"}
          onToggle={() => toggle("Nutrition Information")}
        >
          <p className="mb-3 text-xs uppercase tracking-wide text-navy/45">
            Per 100g{servingSizeG ? ` · 1 piece = ${servingSizeG}g` : ""}
          </p>
          <table className="w-full border-collapse">
            <tbody>
              {NUTRITION_ROWS.map(([key, label, unit]) => (
                <tr key={key} className="border-b border-navy/10">
                  <td className="py-2 text-navy/70">{label}</td>
                  <td className="py-2 text-right font-bold tabular-nums text-navy">
                    {nutritionPer100g[key]}
                    {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AccordionItem>
      )}

      <AccordionItem
        title="Storage & Shelf Life"
        open={openTitle === "Storage & Shelf Life"}
        onToggle={() => toggle("Storage & Shelf Life")}
      >
        <p>
          {shelfLifeDays
            ? `Best before ${shelfLifeDays} days from packing, stored cool and dry, away from direct sunlight.`
            : "Store cool and dry, away from direct sunlight. Best enjoyed fresh."}
        </p>
      </AccordionItem>

      <AccordionItem title="Customer Reviews" open={openTitle === "Customer Reviews"} onToggle={() => toggle("Customer Reviews")}>
        <p>
          Real reviews from real customers.{" "}
          <button type="button" onClick={openReviews} className="font-semibold text-brass hover:text-navy">
            See what people are saying →
          </button>
        </p>
      </AccordionItem>
    </div>
  );
}
