"use client";

import { useState } from "react";
import type { ProductVariant } from "@/lib/catalog";

export function VariantSelector({ variants }: { variants: ProductVariant[] }) {
  const active = variants.filter((v) => v.is_active);
  const initial = active.find((v) => v.is_default) ?? active[0] ?? null;
  const [selectedId, setSelectedId] = useState(initial?.id ?? null);
  const [qty, setQty] = useState(1);
  const selected = active.find((v) => v.id === selectedId) ?? null;

  return (
    <div>
      <fieldset>
        <legend className="font-body text-xs font-medium uppercase tracking-[0.22em] text-navy/50">
          Size
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {active.map((variant) => {
            const isSelected = variant.id === selectedId;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedId(variant.id)}
                aria-pressed={isSelected}
                className={`border px-4 py-2.5 font-body text-sm transition-colors ${
                  isSelected
                    ? "border-navy bg-navy text-cream"
                    : "border-navy/25 text-navy hover:border-navy"
                }`}
              >
                {variant.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex items-baseline gap-4">
        <span className="font-display text-3xl italic text-coral">
          {selected ? `₹${selected.price_inr.toFixed(0)}` : "—"}
        </span>
        {selected && selected.stock_qty <= 5 && selected.stock_qty > 0 && (
          <span className="font-body text-xs uppercase tracking-wide text-coral/80">
            Only {selected.stock_qty} left
          </span>
        )}
        {selected && selected.stock_qty === 0 && (
          <span className="font-body text-xs uppercase tracking-wide text-navy/50">
            Out of stock
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center border border-navy/25">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-3.5 py-2 font-body text-lg text-navy transition-colors hover:bg-navy/5"
          >
            −
          </button>
          <span className="min-w-10 text-center font-body text-sm tabular-nums text-navy">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="px-3.5 py-2 font-body text-lg text-navy transition-colors hover:bg-navy/5"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled
          title="Online ordering opens soon — for now, order on WhatsApp"
          className="flex-1 cursor-not-allowed bg-navy/30 px-6 py-3 font-body text-xs font-medium uppercase tracking-[0.2em] text-cream/80"
        >
          Add to cart — coming soon
        </button>
      </div>
    </div>
  );
}
