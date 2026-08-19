"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, cartSubtotal } from "@/lib/cart-store";
import { placeholderImageUrl } from "@/lib/catalog-shared";

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
          Explore the products
        </Link>
      </main>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl text-navy">Your cart</h1>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-navy/12 bg-white p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-navy/4">
                <Image
                  src={placeholderImageUrl(item.productSlug)}
                  alt={item.productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

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
                aria-label="Remove item"
                className="rounded-full p-2 text-navy/40 transition-colors hover:bg-coral/10 hover:text-coral"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M4 6h12" strokeLinecap="round" />
                  <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.5 6.5 6 16a1.5 1.5 0 0 0 1.5 1.4h5a1.5 1.5 0 0 0 1.5-1.4l.5-9.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.3 9.5v4.5M11.7 9.5v4.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="sticky top-24 rounded-xl border border-navy/12 bg-white p-6">
          <h2 className="font-display text-xl text-navy">Order summary</h2>
          <div className="mt-5 flex items-center justify-between font-body text-sm">
            <span className="text-navy/70">Subtotal</span>
            <span className="tabular-nums text-navy">&#8377;{subtotal.toFixed(0)}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between font-body text-sm">
            <span className="text-navy/70">Delivery</span>
            <span className="text-navy/50">Calculated at checkout</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-full bg-navy px-6 py-3.5 text-center font-body text-sm font-semibold uppercase tracking-[0.15em] text-cream transition-colors hover:bg-navy/90"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
