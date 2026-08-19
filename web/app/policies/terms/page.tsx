import type { Metadata } from "next";
import { PolicyStub } from "@/components/PolicyStub";

export const metadata: Metadata = { title: "Terms & Conditions — Truly Susi's" };

export default function TermsPage() {
  return (
    <PolicyStub
      title="Terms & Conditions"
      note="This page is still being finalized. Full terms will be posted here before online checkout goes live."
    />
  );
}
