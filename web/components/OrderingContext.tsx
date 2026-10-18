"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ORDERING_CLOSED, type Ordering } from "@/lib/ordering";

const OrderingContext = createContext<Ordering>(ORDERING_CLOSED);

/**
 * Carries the pre-launch ordering switch from the server layout (which reads
 * it from `site_settings`) down to the Client Components that have to react to
 * it — the header cart icon, the floating cart tab and the add-to-cart block.
 * A context rather than props so SiteHeader doesn't have to forward a value it
 * has no use for itself.
 */
export function OrderingProvider({ value, children }: { value: Ordering; children: ReactNode }) {
  return <OrderingContext.Provider value={value}>{children}</OrderingContext.Provider>;
}

/** Defaults to closed, so a component rendered outside the provider can never accidentally offer checkout. */
export function useOrdering() {
  return useContext(OrderingContext);
}
