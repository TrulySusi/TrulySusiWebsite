"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartSubtotal, useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";

export default function PaymentPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const delivery = useCheckoutStore((s) => s.delivery);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    if (!delivery.firstName) {
      router.replace("/checkout/delivery");
    }
  }, [mounted, items.length, delivery.firstName, router]);

  if (!mounted || items.length === 0 || !delivery.firstName) return null;

  const subtotal = cartSubtotal(items);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/10 font-body text-xs font-semibold text-navy/50">
            ✓
          </span>
          <span className="font-body text-sm text-navy/50">Delivery</span>
        </div>
        <span className="h-px w-10 bg-navy/15" />
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-body text-xs font-semibold text-cream">
            2
          </span>
          <span className="font-body text-sm font-semibold text-navy">Payment</span>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-navy/10 bg-white p-7 text-center">
        <h1 className="font-display text-2xl text-navy">Online payment is almost here</h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-navy/60">
          We&rsquo;re finishing up secure payment for the site. Your delivery details are saved —
          checkout will open here as soon as payment is live.
        </p>

        <dl className="mt-6 space-y-2 border-y border-navy/10 py-5 text-left font-body text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">Delivering to</dt>
            <dd className="text-navy">
              {delivery.firstName} {delivery.lastName}, {delivery.city}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">Items</dt>
            <dd className="text-navy">{items.length}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt className="text-navy">Subtotal</dt>
            <dd className="text-navy">&#8377;{subtotal.toFixed(0)}</dd>
          </div>
        </dl>

        <button
          type="button"
          disabled
          title="Online payment opens soon"
          className="mt-6 w-full cursor-not-allowed rounded-full bg-navy/15 px-6 py-3.5 font-body text-sm font-semibold text-navy/40"
        >
          Payment — coming soon
        </button>
        <Link
          href="/checkout/delivery"
          className="mt-4 block font-body text-xs text-navy/50 hover:text-brass"
        >
          ← Edit delivery details
        </Link>
      </div>
    </main>
  );
}
