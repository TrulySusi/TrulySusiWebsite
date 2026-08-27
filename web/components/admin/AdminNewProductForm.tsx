"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/admin/products/actions";

const fieldClass =
  "w-full rounded-lg border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-body text-xs font-medium text-navy/60">{label}</span>
      {children}
      {hint && <span className="font-body text-[11px] text-navy/40">{hint}</span>}
    </label>
  );
}

export function AdminNewProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const id = await createProduct(new FormData(e.currentTarget));
      router.push(`/admin/products/${id}`);
    } catch {
      setError("Couldn't create the product. Check the name/slug and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6">
      <Field label="Product name">
        <input name="name" required className={fieldClass} />
      </Field>
      <Field label="URL slug" hint="Optional: generated from the name if left blank">
        <input name="slug" className={fieldClass} />
      </Field>
      <Field label="Category">
        <select name="category_id" defaultValue="" className={fieldClass}>
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Short description" hint="Shown on product cards across the site">
        <textarea name="short_description" rows={2} className={`resize-none ${fieldClass}`} />
      </Field>

      {error && <p className="font-body text-sm text-brass">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create product"}
      </button>
    </form>
  );
}
