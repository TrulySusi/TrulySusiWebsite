"use client";

import { useEffect, useState } from "react";
import type { ProductVariant } from "@/lib/catalog-shared";
import { useCartStore } from "@/lib/cart-store";

export function VariantSelector({
  variants,
  productSlug,
  productName,
}: {
  variants: ProductVariant[];
  productSlug: string;
  productName: string;
}) {
  const active = variants.filter((v) => v.is_active);
  const initial = active.find((v) => v.is_default) ?? active[0] ?? null;
  const [selectedId, setSelectedId] = useState(initial?.id ?? null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const selected = active.find((v) => v.id === selectedId) ?? null;
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(t);
  }, [justAdded]);

  function handleAddToCart() {
    if (!selected) return;
    addItem(
      {
        variantId: selected.id,
        productSlug,
        productName,
        variantLabel: selected.label,
        priceInr: selected.price_inr,
      },
      qty,
    );
    setJustAdded(true);
  }

  const lineTotal = selected ? selected.price_inr * qty : null;

  return (
    <div>
      <fieldset>
        <legend className="font-body text-xs font-medium uppercase tracking-[0.22em] text-navy/50">
          Quantity
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
                className={`rounded-full px-5 py-2.5 font-body text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-navy text-cream"
                    : "bg-navy/6 text-navy hover:bg-navy/10"
                }`}
              >
                {variant.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center rounded-full bg-navy/6">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-4 py-2.5 font-body text-lg text-navy transition-colors hover:bg-navy/10 rounded-l-full"
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
            className="px-4 py-2.5 font-body text-lg text-navy transition-colors hover:bg-navy/10 rounded-r-full"
          >
            +
          </button>
        </div>

        <span className="font-display text-2xl text-navy">
          {lineTotal !== null ? `₹${lineTotal.toFixed(0)}` : "—"}
        </span>

        {selected && selected.stock_qty <= 5 && selected.stock_qty > 0 && (
          <span className="font-body text-xs uppercase tracking-wide text-brass/80">
            Only {selected.stock_qty} left
          </span>
        )}
        {selected && selected.stock_qty === 0 && (
          <span className="font-body text-xs uppercase tracking-wide text-navy/50">
            Out of stock
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!selected || selected.stock_qty === 0}
        className="mt-6 w-full rounded-full bg-navy px-6 py-4 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:bg-navy/15 disabled:text-navy/40"
      >
        {justAdded
          ? "Added ✓"
          : lineTotal !== null
            ? `Add to cart — ₹${lineTotal.toFixed(0)}`
            : "Add to cart"}
      </button>

      <p className="mt-4 font-body text-xs text-navy/45">Packed fresh to order.</p>
    </div>
  );
}
