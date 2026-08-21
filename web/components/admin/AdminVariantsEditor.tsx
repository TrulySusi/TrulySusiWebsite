"use client";

import { useState } from "react";
import { createVariant, updateVariant, deleteVariant } from "@/app/admin/products/actions";

const fieldClass =
  "w-full rounded-lg border border-navy/15 bg-white px-2.5 py-2 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

type Variant = {
  id: string;
  label: string;
  weight_grams: number;
  sku: string;
  price_inr: number;
  compare_at_price_inr: number | null;
  stock_qty: number;
  is_default: boolean;
  is_active: boolean;
};

function VariantFields({
  variant,
  servingSizeG,
}: {
  variant?: Variant;
  servingSizeG: number | null;
}) {
  const pieces =
    servingSizeG && variant?.weight_grams ? Math.round(variant.weight_grams / servingSizeG) : null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <input name="label" defaultValue={variant?.label} placeholder="Label, e.g. 250g box" required className={`sm:col-span-2 ${fieldClass}`} />
      <div>
        <input
          name="weight_grams"
          type="number"
          defaultValue={variant?.weight_grams}
          placeholder="Weight (g)"
          required
          className={fieldClass}
        />
        {pieces !== null && <p className="mt-0.5 font-body text-[11px] text-navy/40">≈ {pieces} pieces</p>}
      </div>
      <input name="sku" defaultValue={variant?.sku} placeholder="SKU" required className={fieldClass} />
      <input name="price_inr" type="number" step="0.01" defaultValue={variant?.price_inr} placeholder="Price (₹)" required className={fieldClass} />
      <input
        name="compare_at_price_inr"
        type="number"
        step="0.01"
        defaultValue={variant?.compare_at_price_inr ?? ""}
        placeholder="Compare-at price (optional)"
        className={fieldClass}
      />
      <input name="stock_qty" type="number" defaultValue={variant?.stock_qty ?? 0} placeholder="Stock qty" className={fieldClass} />
      <div className="flex items-center gap-4 sm:col-span-2">
        <label className="flex items-center gap-1.5 font-body text-xs text-navy/70">
          <input type="checkbox" name="is_default" defaultChecked={variant?.is_default} className="h-3.5 w-3.5" />
          Default
        </label>
        <label className="flex items-center gap-1.5 font-body text-xs text-navy/70">
          <input type="checkbox" name="is_active" defaultChecked={variant?.is_active ?? true} className="h-3.5 w-3.5" />
          Active
        </label>
      </div>
    </div>
  );
}

function VariantRow({
  productId,
  variant,
  servingSizeG,
}: {
  productId: string;
  variant: Variant;
  servingSizeG: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateVariant(productId, variant.id, new FormData(e.currentTarget));
      setEditing(false);
    } catch {
      setError("Couldn't save.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${variant.label}"?`)) return;
    await deleteVariant(productId, variant.id);
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="rounded-lg border border-navy/15 p-3">
        <VariantFields variant={variant} servingSizeG={servingSizeG} />
        {error && <p className="mt-2 font-body text-xs text-brass">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={submitting} className="rounded-full bg-navy px-4 py-1.5 font-body text-xs font-semibold text-cream disabled:opacity-60">
            {submitting ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="font-body text-xs text-navy/50 hover:text-navy">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-navy/10 px-4 py-3">
      <div className="min-w-0">
        <p className="font-body text-sm font-semibold text-navy">
          {variant.label} {!variant.is_active && <span className="text-navy/40">(inactive)</span>}
          {variant.is_default && <span className="ml-1.5 text-[10px] font-semibold uppercase text-brass">default</span>}
        </p>
        <p className="font-body text-xs text-navy/50">
          {variant.weight_grams}g &middot; {variant.sku} &middot; ₹{variant.price_inr} &middot; stock {variant.stock_qty}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-navy/20 px-3 py-1.5 font-body text-xs font-semibold text-navy hover:bg-navy/6">
          Edit
        </button>
        <button type="button" onClick={handleDelete} className="rounded-full px-3 py-1.5 font-body text-xs font-semibold text-brass hover:bg-brass/10">
          Delete
        </button>
      </div>
    </div>
  );
}

function NewVariantForm({ productId, servingSizeG }: { productId: string; servingSizeG: number | null }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createVariant(productId, new FormData(e.currentTarget));
      e.currentTarget.reset();
      setOpen(false);
    } catch {
      setError("Couldn't add the variant. Check the fields (label/weight/SKU/price are required).");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-full border-2 border-dashed border-navy/25 px-4 py-2 font-body text-sm font-semibold text-navy hover:border-navy/40"
      >
        + Add variant
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-navy/15 p-3">
      <VariantFields servingSizeG={servingSizeG} />
      {error && <p className="mt-2 font-body text-xs text-brass">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-full bg-navy px-4 py-1.5 font-body text-xs font-semibold text-cream disabled:opacity-60">
          {submitting ? "Adding…" : "Add variant"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="font-body text-xs text-navy/50 hover:text-navy">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AdminVariantsEditor({
  productId,
  variants,
  servingSizeG,
}: {
  productId: string;
  variants: Variant[];
  servingSizeG: number | null;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6">
      <h2 className="font-display text-xl text-navy">Variants</h2>
      <p className="mt-1 font-body text-xs text-navy/50">
        Pack sizes customers can choose from — price, stock, and whether it&rsquo;s buyable.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {variants.map((v) => (
          <VariantRow key={v.id} productId={productId} variant={v} servingSizeG={servingSizeG} />
        ))}
        <div className="mt-2">
          <NewVariantForm productId={productId} servingSizeG={servingSizeG} />
        </div>
      </div>
    </div>
  );
}
