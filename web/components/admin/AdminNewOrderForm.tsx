"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createManualOrder, type ManualOrderItem } from "@/app/admin/orders/actions";
import { INDIA_STATES, lookupPincode } from "@/lib/india";

const fieldClass =
  "w-full rounded-lg border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="font-body text-xs font-medium text-navy/60">{label}</span>
      {children}
      {hint && <span className="font-body text-[11px] text-navy/40">{hint}</span>}
    </label>
  );
}

type Variant = { id: string; label: string; price_inr: number; is_active: boolean };
type Product = { id: string; name: string; product_variants: Variant[] };

type ItemRow = {
  productId: string;
  variantId: string;
  quantity: number;
  unitPriceInr: number;
};

export function AdminNewOrderForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState<ItemRow[]>([{ productId: "", variantId: "", quantity: 1, unitPriceInr: 0 }]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function variantsFor(productId: string) {
    return products.find((p) => p.id === productId)?.product_variants.filter((v) => v.is_active) ?? [];
  }

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: "", variantId: "", quantity: 1, unitPriceInr: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePincodeChange(value: string) {
    setPincode(value);
    if (/^\d{6}$/.test(value.trim())) {
      lookupPincode(value.trim()).then((result) => {
        if (result) {
          setCity(result.city);
          setState(result.state);
        }
      });
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPriceInr * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const orderItems: ManualOrderItem[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.product_variants.find((v) => v.id === item.variantId);
      if (!product || !variant || item.quantity < 1) continue;
      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        nameSnapshot: product.name,
        variantLabelSnapshot: variant.label,
        unitPriceInr: item.unitPriceInr,
        quantity: item.quantity,
      });
    }

    if (orderItems.length === 0) {
      setError("Add at least one valid item.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const orderId = await createManualOrder(formData, orderItems);
      router.push(`/admin/orders/${orderId}`);
    } catch {
      setError("Couldn't create the order. Check the required fields.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="font-body text-xl font-semibold text-navy">Customer &amp; delivery</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input name="first_name" required className={fieldClass} />
          </Field>
          <Field label="Last name">
            <input name="last_name" required className={fieldClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" inputMode="numeric" required className={fieldClass} />
          </Field>
          <Field label="Email (optional)">
            <input name="email" type="email" className={fieldClass} />
          </Field>
          <Field label="House / Flat / Building no." className="sm:col-span-2">
            <input name="line1" required className={fieldClass} />
          </Field>
          <Field label="Street / Area / Locality" className="sm:col-span-2">
            <input name="line2" required className={fieldClass} />
          </Field>
          <Field label="Landmark (optional)" className="sm:col-span-2">
            <input name="landmark" className={fieldClass} />
          </Field>
          <Field label="Pincode">
            <input
              name="pincode"
              inputMode="numeric"
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              required
              className={fieldClass}
            />
          </Field>
          <Field label="City">
            <input name="city" value={city} onChange={(e) => setCity(e.target.value)} required className={fieldClass} />
          </Field>
          <Field label="State" className="sm:col-span-2">
            <select
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className={`${fieldClass} ${state ? "text-navy" : "text-navy/40"}`}
            >
              <option value="" disabled>
                State
              </option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s} className="text-navy">
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Order channel">
            <select name="order_channel" defaultValue="whatsapp" className={fieldClass}>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="font-body text-xl font-semibold text-navy">Items</h2>
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => {
            const variants = variantsFor(item.productId);
            return (
              <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-navy/10 p-3 sm:grid-cols-5">
                <Field label="Product" className="sm:col-span-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, { productId: e.target.value, variantId: "", unitPriceInr: 0 })}
                    className={fieldClass}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Pack size">
                  <select
                    value={item.variantId}
                    onChange={(e) => {
                      const variant = variants.find((v) => v.id === e.target.value);
                      updateItem(index, { variantId: e.target.value, unitPriceInr: variant?.price_inr ?? 0 });
                    }}
                    disabled={!item.productId}
                    className={fieldClass}
                  >
                    <option value="">Select</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Qty">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                    className={fieldClass}
                  />
                </Field>
                <div className="flex items-end justify-between gap-2">
                  <Field label="Price (₹)">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPriceInr}
                      onChange={(e) => updateItem(index, { unitPriceInr: Number(e.target.value) })}
                      className={fieldClass}
                    />
                  </Field>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mb-1 shrink-0 font-body text-xs font-semibold text-brass hover:text-brass/80"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={addItem}
            className="self-start rounded-full border-2 border-dashed border-navy/25 px-4 py-2 font-body text-sm font-semibold text-navy hover:border-navy/40"
          >
            + Add item
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="font-body text-xl font-semibold text-navy">Payment</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Shipping fee (₹)">
            <input name="shipping_fee_inr" type="number" step="0.01" defaultValue={0} className={fieldClass} />
          </Field>
          <Field label="Discount (₹)">
            <input name="discount_inr" type="number" step="0.01" defaultValue={0} className={fieldClass} />
          </Field>
          <Field label="Payment method">
            <select name="payment_method" defaultValue="manual" className={fieldClass}>
              <option value="manual">Manual (bank transfer / UPI)</option>
              <option value="razorpay">Razorpay (payment link sent)</option>
            </select>
          </Field>
          <Field label="Payment status">
            <select name="payment_status" defaultValue="pending" className={fieldClass}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </Field>
        </div>
        <Field label="Internal notes (optional)" className="mt-4">
          <textarea name="notes" rows={2} className={`resize-none ${fieldClass}`} />
        </Field>

        <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-4">
          <span className="font-body text-sm text-navy/60">Subtotal</span>
          <span className="font-body text-lg font-bold text-navy">₹{subtotal.toFixed(0)}</span>
        </div>
      </section>

      {error && <p className="font-body text-sm text-brass">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-navy px-6 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create order"}
      </button>
    </form>
  );
}
