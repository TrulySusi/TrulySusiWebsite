"use client";

import { useState } from "react";
import Image from "next/image";
import { lookupOrder, type TrackedOrder } from "./actions";
import { placeholderImageUrl } from "@/lib/catalog-shared";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<TrackedOrder | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    setSubmitting(true);
    const order = await lookupOrder(orderNumber, phone);
    setResult(order);
    setSearched(true);
    setSubmitting(false);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-24 sm:px-10">
      <h1 className="text-center font-display text-4xl text-navy">Track your order</h1>
      <p className="mt-3 text-center font-body text-sm text-navy/60">
        Enter your order number and the phone number used at checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order number, e.g. TS-2026-000123"
          className="flex-1 rounded-full border border-navy/15 bg-white px-5 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="rounded-full border border-navy/15 bg-white px-5 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none sm:w-44"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-navy px-7 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
        >
          {submitting ? "Searching…" : "Search"}
        </button>
      </form>

      {searched && !result && (
        <p className="mt-8 text-center font-body text-sm text-navy/60">
          We couldn&rsquo;t find a matching order. Double-check the order number and phone number, or
          write to{" "}
          <a href="mailto:support@trulysusi.in" className="text-brass hover:text-navy">
            support@trulysusi.in
          </a>
          .
        </p>
      )}

      {result && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy/50">Order</p>
            <p className="mt-1 font-body text-lg font-bold text-navy">{result.orderNumber}</p>
            <div className="mt-6">
              <OrderStatusStepper status={result.status} />
            </div>

            {(result.courierName || result.trackingNumber) && (
              <div className="mt-6 rounded-lg bg-cream px-4 py-3 font-body text-sm text-navy">
                {result.courierName && (
                  <p>
                    <span className="text-navy/50">Courier: </span>
                    {result.courierName}
                  </p>
                )}
                {result.trackingNumber && (
                  <p className="mt-1">
                    <span className="text-navy/50">Tracking number: </span>
                    {result.trackingNumber}
                  </p>
                )}
                {result.trackingUrl && (
                  <a
                    href={result.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-semibold text-brass hover:text-navy"
                  >
                    Track shipment →
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h2 className="font-body text-lg font-semibold text-navy">Items</h2>
            <ul className="mt-4 divide-y divide-navy/10">
              {result.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <Image
                      src={item.imageUrl ?? placeholderImageUrl(item.name)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-body text-sm font-medium text-navy">{item.name}</p>
                    <p className="font-body text-xs text-navy/50">
                      {item.variantLabel} &middot; Qty {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h2 className="font-body text-lg font-semibold text-navy">Delivering to</h2>
            <p className="mt-2 text-left font-body text-sm text-navy/70">
              {result.deliveryAddress.line1}
              {result.deliveryAddress.line2 && <>, {result.deliveryAddress.line2}</>}
              {result.deliveryAddress.landmark && <>, near {result.deliveryAddress.landmark}</>}
              <br />
              {result.deliveryAddress.city}, {result.deliveryAddress.state} &mdash; {result.deliveryAddress.pincode}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
