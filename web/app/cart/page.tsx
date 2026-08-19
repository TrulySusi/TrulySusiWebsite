"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Same hydration-safety pattern as CartIcon — localStorage only reads
  // reliably after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center sm:px-10">
        <h1 className="font-display text-4xl text-navy">Your cart is empty</h1>
        <p className="mt-4 font-body text-navy/60">
          Nothing here yet — go find something sweet.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-navy px-7 py-3.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Explore the menu
        </Link>
      </main>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl text-navy">Your cart</h1>

      <div className="mt-8 divide-y divide-navy/10 border-y border-navy/10">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-4 py-5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${item.productSlug}`}
                className="font-display text-xl text-navy hover:text-coral"
              >
                {item.productName}
              </Link>
              <p className="mt-0.5 font-body text-sm text-navy/55">{item.variantLabel}</p>
            </div>

            <div className="flex items-center rounded-full bg-navy/6">
              <button
                type="button"
                onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="rounded-l-full px-3 py-2 font-body text-lg text-navy transition-colors hover:bg-navy/10"
              >
                −
              </button>
              <span className="min-w-8 text-center font-body text-sm tabular-nums text-navy">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                aria-label="Increase quantity"
                className="rounded-r-full px-3 py-2 font-body text-lg text-navy transition-colors hover:bg-navy/10"
              >
                +
              </button>
            </div>

            <span className="w-20 text-right font-display text-lg italic text-coral">
              &#8377;{(item.priceInr * item.quantity).toFixed(0)}
            </span>

            <button
              type="button"
              onClick={() => removeItem(item.variantId)}
              aria-label={`Remove ${item.productName} (${item.variantLabel}) from cart`}
              className="text-navy/40 transition-colors hover:text-coral"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M5 6h10m-8 0V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6m2 0-.6 9.6a1.5 1.5 0 0 1-1.5 1.4H7.1a1.5 1.5 0 0 1-1.5-1.4L5 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="font-body text-base text-navy/70">Subtotal</span>
        <span className="font-display text-2xl italic text-coral">
          &#8377;{subtotal.toFixed(0)}
        </span>
      </div>

      <button
        type="button"
        disabled
        title="Online checkout opens soon — for now, order on WhatsApp"
        className="mt-6 w-full cursor-not-allowed rounded-full bg-navy/15 px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-navy/40"
      >
        Checkout — coming soon
      </button>
    </main>
  );
}
