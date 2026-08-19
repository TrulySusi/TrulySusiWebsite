import type { Metadata } from "next";
import { PolicyStub } from "@/components/PolicyStub";

export const metadata: Metadata = { title: "Shipping & Delivery — Truly Susi's" };

export default function ShippingPage() {
  return (
    <PolicyStub
      title="Shipping & Delivery"
      note="Orders are currently confirmed within an hour and shipped within the week, coordinated directly over WhatsApp or email. A full shipping policy will be posted here before online checkout goes live."
    />
  );
}
