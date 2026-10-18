"use client";

import { useState } from "react";
import { VegMark } from "@/components/VegMark";
import { useReviewsWidget } from "@/components/ReviewsWidgetContext";
import type { NutritionPer100g } from "@/lib/catalog-shared";

const NUTRITION_ROWS: Array<[key: keyof NutritionPer100g, label: string, unit: string]> = [
  ["energy_kcal", "Energy", "Kcal"],
  ["protein_g", "Protein", "g"],
  ["total_carb_g", "Total Carbohydrate", "g"],
  ["total_fat_g", "Total Fat", "g"],
  ["saturated_fat_g", "Saturated Fat", "g"],
  ["trans_fat_g", "Trans Fat", "g"],
  ["mono_unsat_fat_g", "Mono Unsaturated Fat", "g"],
  ["poly_unsat_fat_g", "Poly Unsaturated Fat", "g"],
  // Added Sugar is a mandatory separate declaration under the FSS
  // (Labelling & Display) Regulations 2020 - it was stored but not shown.
  ["added_sugar_g", "Added Sugar", "g"],
  ["total_sugar_g", "Total Sugar", "g"],
  ["dietary_fibre_g", "Dietary Fibre", "g"],
  ["cholesterol_mg", "Cholesterol", "mg"],
  ["sodium_mg", "Sodium", "mg"],
];

/** The mandatory declarations an FSSAI food listing has to carry. */
export type Labelling = {
  isVegetarian: boolean;
  additives: string | null;
  netQuantities: string | null;
  manufacturedBy: string | null;
  address: string | null;
  countryOfOrigin: string | null;
  fssaiLicenceNo: string | null;
  customerCareEmail: string | null;
};

type Props = {
  ingredients: string | null;
  allergenInfo: string | null;
  shelfLifeDays: number | null;
  servingSizeG: number | null;
  nutritionPer100g: NutritionPer100g | null;
  labelling: Labelling;
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
  ingredients,
  allergenInfo,
  shelfLifeDays,
  servingSizeG,
  nutritionPer100g,
  labelling,
}: Props) {
  const { openReviews } = useReviewsWidget();
  // Only one section open at a time — opening a new one collapses whichever
  // was previously open, instead of everything stacking up independently.
  // The description used to lead here; it now sits under the product name.
  const [openTitle, setOpenTitle] = useState<string | null>("Ingredients");

  function toggle(title: string) {
    setOpenTitle((current) => (current === title ? null : title));
  }

  return (
    <div className="mt-16 max-w-2xl">
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

      <AccordionItem
        title="Product Information"
        open={openTitle === "Product Information"}
        onToggle={() => toggle("Product Information")}
      >
        <dl className="flex flex-col gap-2.5">
          <div className="flex gap-3">
            <dt className="w-40 shrink-0 text-navy/50">Veg / Non-veg</dt>
            <dd><VegMark isVegetarian={labelling.isVegetarian} withLabel className="h-4 w-4" /></dd>
          </div>
          {labelling.netQuantities && (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 text-navy/50">Net quantity</dt>
              <dd className="text-left!">{labelling.netQuantities}</dd>
            </div>
          )}
          {labelling.additives && (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 text-navy/50">Additives</dt>
              <dd className="text-left!">{labelling.additives}</dd>
            </div>
          )}
          {labelling.manufacturedBy && (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 text-navy/50">Manufactured by</dt>
              <dd className="text-left!">
                {labelling.manufacturedBy}
                {labelling.address && <><br />{labelling.address}</>}
              </dd>
            </div>
          )}
          {labelling.countryOfOrigin && (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 text-navy/50">Country of origin</dt>
              <dd className="text-left!">{labelling.countryOfOrigin}</dd>
            </div>
          )}
          {labelling.fssaiLicenceNo && (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 text-navy/50">FSSAI Licence No.</dt>
              <dd className="text-left! tabular-nums">{labelling.fssaiLicenceNo}</dd>
            </div>
          )}
          {labelling.customerCareEmail && (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 text-navy/50">Customer care</dt>
              <dd className="text-left!">
                <a href={`mailto:${labelling.customerCareEmail}`} className="text-brass hover:text-navy">
                  {labelling.customerCareEmail}
                </a>
              </dd>
            </div>
          )}
          <div className="flex gap-3">
            <dt className="w-40 shrink-0 text-navy/50">Price</dt>
            <dd className="text-left!">MRP inclusive of all taxes</dd>
          </div>
        </dl>
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
