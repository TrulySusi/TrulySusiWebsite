"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
          <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-6 font-display text-4xl text-navy">Order confirmed!</h1>
      {orderNumber && (
        <p className="mt-3 font-body text-sm text-navy/60">
          Order <span className="font-bold text-navy">{orderNumber}</span> is being prepared —
          you&rsquo;ll hear from us with delivery updates.
        </p>
      )}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-navy px-7 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Continue shopping
        </Link>
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
