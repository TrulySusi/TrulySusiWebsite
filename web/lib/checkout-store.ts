"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeliveryDetails = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
};

export const emptyDelivery: DeliveryDetails = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  pincode: "",
};

type CheckoutState = {
  delivery: DeliveryDetails;
  setDelivery: (delivery: DeliveryDetails) => void;
  clear: () => void;
};

// Survives the guest hop from /checkout/delivery to /checkout/payment.
// Not linked to the cart's own storage — cleared independently once an
// order actually completes (checkout isn't wired to real payment yet).
export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      delivery: emptyDelivery,
      setDelivery: (delivery) => set({ delivery }),
      clear: () => set({ delivery: emptyDelivery }),
    }),
    { name: "truly-susis-checkout" },
  ),
);
