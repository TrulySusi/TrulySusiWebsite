"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AddressLabel = "Home" | "Work" | "Other";

export type DeliveryDetails = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  alternatePhone: string;
  label: AddressLabel;
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  notes: string;
};

export const emptyDelivery: DeliveryDetails = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  alternatePhone: "",
  label: "Home",
  line1: "",
  line2: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
  notes: "",
};

type CheckoutState = {
  delivery: DeliveryDetails;
  setDelivery: (delivery: DeliveryDetails) => void;
  clear: () => void;
};

// Persists the in-progress checkout draft (contact + delivery) across the
// single checkout page's own state resets — e.g. a page refresh mid-fill.
// Not linked to the cart's own storage — cleared independently once an
// order actually completes (checkout isn't wired to real payment yet).
export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      delivery: emptyDelivery,
      setDelivery: (delivery) => set({ delivery }),
      clear: () => set({ delivery: emptyDelivery }),
    }),
    {
      name: "truly-susis-checkout",
      // v2 added `email` to DeliveryDetails — old persisted drafts predate
      // it, and Zustand's default merge replaces `delivery` wholesale
      // rather than deep-merging, so without this an old draft would
      // rehydrate with `email: undefined` and crash on `.trim()`.
      version: 2,
      migrate: (state) => {
        const s = state as CheckoutState;
        return { ...s, delivery: { ...emptyDelivery, ...s.delivery } };
      },
    },
  ),
);
