"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, listVariants } from "@/app/admin/products/actions";
import { ProductBasicFields } from "@/components/admin/ProductBasicFields";
import { AdminVariantsEditor } from "@/components/admin/AdminVariantsEditor";
import { AdminImagesEditor } from "@/components/admin/AdminImagesEditor";

const STEPS = ["Basic info", "Variants", "Images"] as const;

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-xs font-semibold ${
              i < step ? "bg-sage text-white" : i === step ? "bg-navy text-cream" : "bg-navy/10 text-navy/40"
            }`}
          >
            {i < step ? (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span className={`font-body text-sm font-medium ${i === step ? "text-navy" : "text-navy/40"}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div className="mx-1 h-px w-8 bg-navy/15 sm:w-14" />}
        </div>
      ))}
    </div>
  );
}

export function AdminNewProductWizard({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [servingSizeG, setServingSizeG] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<{ id: string; label: string }[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  async function handleBasicSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const id = await createProduct(formData);
      setProductId(id);
      setProductName(String(formData.get("name") ?? ""));
      const ss = String(formData.get("serving_size_g") ?? "").trim();
      setServingSizeG(ss ? Number(ss) : null);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the product. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function goToImages() {
    if (!productId) return;
    setLoadingVariants(true);
    try {
      setVariants(await listVariants(productId));
      setStep(2);
    } finally {
      setLoadingVariants(false);
    }
  }

  function finish() {
    if (productId) router.push(`/admin/products/${productId}`);
  }

  return (
    <div>
      <Stepper step={step} />

      {step === 0 && (
        <form
          onSubmit={handleBasicSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6"
        >
          <h2 className="font-body text-xl font-semibold text-navy">Basic info</h2>
          <ProductBasicFields categories={categories} />
          {error && <p className="font-body text-sm text-brass">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 self-start rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Next: Variants →"}
          </button>
        </form>
      )}

      {step === 1 && productId && (
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-navy/50">
            Add at least one pack size for <span className="font-semibold text-navy">{productName}</span>.
          </p>
          <AdminVariantsEditor productId={productId} variants={[]} servingSizeG={servingSizeG} />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="font-body text-sm font-semibold text-navy/60 hover:text-navy"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={goToImages}
              disabled={loadingVariants}
              className="rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
            >
              {loadingVariants ? "Loading…" : "Next: Images →"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && productId && (
        <div className="flex flex-col gap-4">
          <AdminImagesEditor productId={productId} images={[]} variants={variants} />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="font-body text-sm font-semibold text-navy/60 hover:text-navy"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-brass px-6 py-3 font-body text-sm font-semibold text-navy transition-colors hover:bg-brass/90"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
