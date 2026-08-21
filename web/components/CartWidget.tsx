"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart-store";

export function CartWidget() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const count = mounted ? cartCount(items) : 0;
  const subtotal = cartSubtotal(items);

  function goTo(path: string) {
    setOpen(false);
    router.push(path);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
        className="fixed right-0 top-[calc(62%+130px)] z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-l-lg bg-sage text-navy shadow-lg transition-colors hover:bg-sage/90"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
          <path d="M3 5h1.6L6 13.5a1.5 1.5 0 0 0 1.5 1.25h6a1.5 1.5 0 0 0 1.48-1.24L16 6.5H5.1" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none" />
          <circle cx="13.5" cy="17" r="1" fill="currentColor" stroke="none" />
        </svg>
        {count > 0 && (
          <span className="absolute -left-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brass px-1 font-body text-[10px] font-semibold text-navy">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4 py-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shrink-0 border-b border-navy/10 px-6 pb-5 pt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 text-navy/40 transition-colors hover:text-navy"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                  <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
                </svg>
              </button>
              <h2 className="font-display text-2xl text-navy">Your cart</h2>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <p className="py-6 text-center font-body text-sm text-navy/50">
                  Your cart is empty.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-lg bg-navy/4">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <span className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-brass font-body text-[10px] font-bold text-navy shadow">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-body text-sm font-medium text-navy">
                          {item.productName}
                        </p>
                        <p className="font-body text-xs text-navy/50">
                          {item.variantLabel} &middot; Qty {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 font-body text-sm font-bold text-navy">
                        ₹{(item.priceInr * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="shrink-0 border-t border-navy/10 px-6 py-5">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-navy/70">Subtotal</span>
                  <span className="font-bold text-navy">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => goTo("/cart")}
                    className="flex-1 rounded-full border-2 border-navy px-5 py-3 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
                  >
                    View cart
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo("/checkout")}
                    className="flex-1 rounded-full bg-navy px-5 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
