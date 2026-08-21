"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { productImageUrl } from "@/lib/catalog-shared";
import { uploadProductImage, deleteProductImage } from "@/app/admin/products/actions";

const MAX_IMAGES = 6;

type ProductImageRow = {
  id: string;
  storage_path: string;
  variant_id: string | null;
  alt_text: string | null;
};

type Variant = { id: string; label: string };

export function AdminImagesEditor({
  productId,
  images,
  variants,
}: {
  productId: string;
  images: ProductImageRow[];
  variants: Variant[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [variantId, setVariantId] = useState("");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const variantLabel = (id: string | null) => variants.find((v) => v.id === id)?.label ?? null;

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.set("file", file);
    if (variantId) formData.set("variant_id", variantId);
    if (altText) formData.set("alt_text", altText);

    try {
      await uploadProductImage(productId, formData);
      if (fileRef.current) fileRef.current.value = "";
      setAltText("");
      setVariantId("");
    } catch {
      setError("Couldn't upload that image. Try a smaller file or a different format.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(image: ProductImageRow) {
    if (!confirm("Delete this image?")) return;
    setDeletingId(image.id);
    await deleteProductImage(productId, image.id, image.storage_path);
    setDeletingId(null);
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6">
      <h2 className="font-display text-xl text-navy">Images</h2>
      <p className="mt-1 font-body text-xs text-navy/50">
        Up to {MAX_IMAGES}. Leave "which pack size" unset for a general photo shown for every
        variant, or tag it to one variant (e.g. a 250g box photo showing its actual piece count).
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-navy/10">
            <div className="relative aspect-square bg-navy/4">
              <Image src={productImageUrl(img.storage_path)} alt={img.alt_text ?? ""} fill className="object-cover" />
            </div>
            {variantLabel(img.variant_id) && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-navy/80 px-2 py-0.5 font-body text-[10px] font-semibold text-cream">
                {variantLabel(img.variant_id)}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(img)}
              disabled={deletingId === img.id}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-brass opacity-0 shadow transition-opacity group-hover:opacity-100 disabled:opacity-60"
              aria-label="Delete image"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {images.length >= MAX_IMAGES ? (
        <p className="mt-4 font-body text-xs text-navy/50">
          Maximum of {MAX_IMAGES} images reached — delete one to add another.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-2 rounded-lg bg-cream p-3">
          <input ref={fileRef} type="file" accept="image/*" className="font-body text-xs" />
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="rounded-lg border border-navy/15 bg-white px-2.5 py-2 font-body text-xs text-navy"
          >
            <option value="">General (all variants)</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Alt text (optional)"
            className="rounded-lg border border-navy/15 bg-white px-2.5 py-2 font-body text-xs text-navy placeholder:text-navy/40"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-full bg-navy px-4 py-2 font-body text-xs font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 font-body text-xs text-brass">{error}</p>}
    </div>
  );
}
