"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { updateOrderFulfillment, updatePaymentStatus } from "@/app/admin/orders/actions";
import { placeholderImageUrl } from "@/lib/catalog-shared";

function SectionHeading({ icon, color, children }: { icon: ReactNode; color: "brass" | "sage"; children: ReactNode }) {
  const colorClass = color === "brass" ? "bg-brass/15 text-brass" : "bg-sage/20 text-sage";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>{icon}</div>
      <h2 className="font-body text-xl font-semibold text-navy">{children}</h2>
    </div>
  );
}

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

const STATUS_OPTIONS = [
  "pending_payment",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

type ShippingAddress = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  pincode?: string;
  city?: string;
  state?: string;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: ShippingAddress;
  subtotal_inr: number;
  shipping_fee_inr: number;
  discount_inr: number;
  total_inr: number;
  payment_method: string;
  payment_status: string;
  order_channel: string;
  status: string;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
};

type OrderItem = {
  id: string;
  name_snapshot: string;
  variant_label_snapshot: string;
  unit_price_inr: number;
  quantity: number;
  line_total_inr: number;
  imageUrl?: string | null;
};

export function AdminOrderDetail({ order, items }: { order: Order; items: OrderItem[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [autoAdvanced, setAutoAdvanced] = useState(false);

  // Entering a tracking number clearly means "this shipped" — advance the
  // status automatically instead of relying on the admin to also remember
  // to flip the dropdown (still visible and editable, just pre-filled).
  function handleTrackingNumberChange(value: string) {
    if (value.trim() && ["pending_payment", "paid", "packed"].includes(status)) {
      setStatus("shipped");
      setAutoAdvanced(true);
    }
  }

  const addr = order.shipping_address ?? {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await updateOrderFulfillment(order.id, new FormData(e.currentTarget));
      setSaved(true);
    } catch {
      setError("Couldn't save.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkPaid() {
    setMarkingPaid(true);
    await updatePaymentStatus(order.id, "paid");
    setMarkingPaid(false);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-navy/10 bg-white p-6">
          <SectionHeading
            color="brass"
            icon={
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                <path d="M5 7h10l-1 10H6L5 7Z" strokeLinejoin="round" />
                <path d="M7.5 7V5a2.5 2.5 0 0 1 5 0v2" strokeLinecap="round" />
              </svg>
            }
          >
            Items
          </SectionHeading>
          <div className="mt-4 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-navy/6 py-2 last:border-0">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <Image
                    src={item.imageUrl ?? placeholderImageUrl(item.name_snapshot)}
                    alt={item.name_snapshot}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium text-navy">{item.name_snapshot}</p>
                  <p className="font-body text-xs text-navy/50">
                    {item.variant_label_snapshot} &middot; qty {item.quantity} &middot; ₹{item.unit_price_inr} each
                  </p>
                </div>
                <span className="font-body text-sm font-bold text-navy">₹{item.line_total_inr.toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-navy/10 pt-4 font-body text-sm">
            <div className="flex justify-between text-navy/60">
              <span>Subtotal</span>
              <span>₹{order.subtotal_inr.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-navy/60">
              <span>Shipping</span>
              <span>₹{order.shipping_fee_inr.toFixed(0)}</span>
            </div>
            {order.discount_inr > 0 && (
              <div className="flex justify-between text-navy/60">
                <span>Discount</span>
                <span>-₹{order.discount_inr.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-navy/10 pt-1.5 font-bold text-navy">
              <span>Total</span>
              <span>₹{order.total_inr.toFixed(0)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-navy/10 bg-white p-6">
          <SectionHeading
            color="sage"
            icon={
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                <path d="M10 18s6-5.2 6-9.6A6 6 0 0 0 4 8.4C4 12.8 10 18 10 18Z" strokeLinejoin="round" />
                <circle cx="10" cy="8.4" r="2" />
              </svg>
            }
          >
            Customer &amp; delivery
          </SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 font-body text-sm text-navy/80 sm:grid-cols-2">
            <p>
              <span className="text-navy/50">Name: </span>
              {addr.firstName} {addr.lastName}
            </p>
            <p>
              <span className="text-navy/50">Phone: </span>
              {order.customer_phone}
            </p>
            {order.customer_email && (
              <p>
                <span className="text-navy/50">Email: </span>
                {order.customer_email}
              </p>
            )}
            <p>
              <span className="text-navy/50">Channel: </span>
              <span className="capitalize">{order.order_channel}</span>
            </p>
            <p className="sm:col-span-2">
              <span className="text-navy/50">Address: </span>
              {addr.line1}, {addr.line2}
              {addr.landmark ? `, near ${addr.landmark}` : ""}, {addr.city}, {addr.state} -{" "}
              {addr.pincode}
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-navy/10 bg-white p-6">
          <SectionHeading
            color="brass"
            icon={
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                <path d="M2 6h9v8H2V6Z" strokeLinejoin="round" />
                <path d="M11 9h4l3 3v2h-7V9Z" strokeLinejoin="round" />
                <circle cx="6" cy="15.5" r="1.5" />
                <circle cx="14.5" cy="15.5" r="1.5" />
              </svg>
            }
          >
            Fulfillment
          </SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Order status" hint={autoAdvanced ? "Advanced to Shipped since a tracking number was added — change it if that's not right." : undefined}>
              <select
                name="status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setAutoAdvanced(false);
                }}
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Courier name">
              <input name="courier_name" defaultValue={order.courier_name ?? ""} className={fieldClass} />
            </Field>
            <Field label="Tracking number">
              <input
                name="tracking_number"
                defaultValue={order.tracking_number ?? ""}
                onChange={(e) => handleTrackingNumberChange(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Tracking URL">
              <input name="tracking_url" defaultValue={order.tracking_url ?? ""} className={fieldClass} />
            </Field>
          </div>
          <Field label="Internal notes" className="mt-4">
            <textarea name="notes" defaultValue={order.notes ?? ""} rows={3} className={`resize-none ${fieldClass}`} />
          </Field>

          {error && <p className="mt-3 font-body text-sm text-brass">{error}</p>}
          {saved && <p className="mt-3 font-body text-sm text-sage">Saved.</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <SectionHeading
          color="sage"
          icon={
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
              <rect x="2" y="5" width="16" height="10" rx="1.5" />
              <path d="M2 8.5h16" />
            </svg>
          }
        >
          Payment
        </SectionHeading>
        <p className="mt-3 font-body text-sm text-navy/70">
          <span className="text-navy/50">Method: </span>
          <span className="capitalize">{order.payment_method}</span>
        </p>
        <p className="mt-1 font-body text-sm text-navy/70">
          <span className="text-navy/50">Status: </span>
          <span className="capitalize">{order.payment_status}</span>
        </p>
        {order.payment_status !== "paid" && (
          <button
            type="button"
            onClick={handleMarkPaid}
            disabled={markingPaid}
            className="mt-4 w-full rounded-full bg-sage px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-sage/90 disabled:opacity-60"
          >
            {markingPaid ? "Updating…" : "Mark as paid"}
          </button>
        )}
      </div>
    </div>
  );
}
