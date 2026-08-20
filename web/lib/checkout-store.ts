"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AddressLabel = "Home" | "Work" | "Other";

export type DeliveryDetails = {
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
