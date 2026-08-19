"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore, cartCount } from "@/lib/cart-store";

export function CartIcon() {
  const items = useCartStore((s) => s.items);
  // Avoid SSR/client hydration mismatch: localStorage is only readable
  // after mount, so render the zero-state until then.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/45"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
        <path d="M3 5h1.6L6 13.5a1.5 1.5 0 0 0 1.5 1.25h6a1.5 1.5 0 0 0 1.48-1.24L16 6.5H5.1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="17" r="1" fill="currentColor" stroke="none" />
        <circle cx="13.5" cy="17" r="1" fill="currentColor" stroke="none" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-coral px-1 font-body text-[10px] font-semibold text-cream">
          {count}
        </span>
      )}
    </Link>
  );
}
