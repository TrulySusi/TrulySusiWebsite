"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-session";

export function AccountIcon() {
  // Default to the sign-in destination — if a signed-in customer somehow
  // clicks before this check resolves, /account/login itself detects the
  // existing session and immediately redirects onward, so nothing gets
  // stuck. The reverse (a guest landing on the orders page's "please
  // sign in" bounce) is the actual bug this component exists to avoid.
  const [href, setHref] = useState("/account/login?redirect=%2Faccount%2Forders");

  useEffect(() => {
    getCustomerSession().then((session) => {
      if (session) setHref("/account/orders");
    });
  }, []);

  return (
    <Link
      href={href}
      aria-label="Your account"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/45"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
