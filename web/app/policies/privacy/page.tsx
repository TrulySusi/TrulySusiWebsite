import type { Metadata } from "next";
import { PolicyStub } from "@/components/PolicyStub";

export const metadata: Metadata = { title: "Privacy Policy · Truly Susi's" };

export default function PrivacyPage() {
  return (
    <PolicyStub
      title="Privacy Policy"
      note="This page is still being finalized. A full privacy policy, covering what's collected at checkout and how it's used, will be posted here before online checkout goes live."
    />
  );
}
