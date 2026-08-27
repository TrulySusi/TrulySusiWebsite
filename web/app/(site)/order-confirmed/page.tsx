"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { placeholderImageUrl } from "@/lib/catalog-shared";
import { getOrderSummary, type OrderSummary } from "../checkout/actions";
import { getCustomerSession } from "@/lib/customer-session";

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const addressNotSaved = searchParams.get("addressNotSaved") === "1";
  const [summary, setSummary] = useState<OrderSummary | null | undefined>(undefined);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    getOrderSummary(orderNumber).then(setSummary);
  }, [orderNumber]);

  useEffect(() => {
    getCustomerSession().then((session) => setSignedIn(!!session));
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 sm:px-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
            <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-4xl text-navy">Order confirmed!</h1>
        {orderNumber && (
          <p className="mt-3 font-body text-sm text-navy/60">
            Order <span className="font-bold text-navy">{orderNumber}</span> is being prepared -
            you&rsquo;ll hear from us with delivery updates.
          </p>
        )}
      </div>

      {addressNotSaved && (
        <div className="mt-8 rounded-xl bg-brass/10 px-5 py-4 text-center font-body text-sm text-brass">
          You were signed out partway through checkout, so we couldn&rsquo;t save this delivery
          address to your account — your order itself is unaffected. Sign in again next time to
          keep your addresses on file.
        </div>
      )}

      {summary && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg text-navy">Your order</h2>
            <ul className="mt-4 divide-y divide-navy/10">
              {summary.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <Image
                      src={item.imageUrl ?? placeholderImageUrl(item.nameSnapshot)}
                      alt={item.nameSnapshot}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-medium text-navy">{item.nameSnapshot}</p>
                    <p className="font-body text-xs text-navy/50">
                      {item.variantLabelSnapshot} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-body text-sm font-medium text-navy">{formatInr(item.lineTotalInr)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1.5 border-t border-navy/10 pt-4 font-body text-sm">
              <div className="flex justify-between text-navy/60">
                <span>Subtotal</span>
                <span>{formatInr(summary.subtotalInr)}</span>
              </div>
              <div className="flex justify-between text-navy/60">
                <span>Shipping</span>
                <span>{summary.shippingFeeInr === 0 ? "Free" : formatInr(summary.shippingFeeInr)}</span>
              </div>
              {summary.discountInr > 0 && (
                <div className="flex justify-between text-navy/60">
                  <span>Discount</span>
                  <span>−{formatInr(summary.discountInr)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 text-base font-semibold text-navy">
                <span>Total paid</span>
                <span>{formatInr(summary.totalInr)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg text-navy">Delivering to</h2>
            <p className="mt-2 font-body text-sm text-navy/70">
              {summary.customerName}
              <br />
              {summary.deliveryAddress.line1}
              {summary.deliveryAddress.line2 && <>, {summary.deliveryAddress.line2}</>}
              {summary.deliveryAddress.landmark && <>, {summary.deliveryAddress.landmark}</>}
              <br />
              {summary.deliveryAddress.city}, {summary.deliveryAddress.state} — {summary.deliveryAddress.pincode}
              <br />
              {summary.deliveryAddress.phone}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-navy px-7 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Continue shopping
        </Link>
        {signedIn && (
          <Link href="/account/orders" className="font-body text-sm text-navy/50 hover:text-brass">
            View my orders
          </Link>
        )}
        <Link href="/" className="font-body text-sm text-navy/50 hover:text-brass">
          Back to home
        </Link>
      </div>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmedContent />
    </Suspense>
  );
}
