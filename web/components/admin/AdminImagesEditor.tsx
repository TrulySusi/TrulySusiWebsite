"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { productImageUrl } from "@/lib/catalog-shared";
import { uploadProductImage, deleteProductImage, reorderProductImages } from "@/app/admin/products/actions";

const MAX_IMAGES = 6;

type ProductImageRow = {
  id: string;
  storage_path: string;
  variant_id: string | null;
  alt_text: string | null;
  sort_order: number;
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
  const [reordering, setReordering] = useState(false);

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
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

  async function applyOrder(newOrder: ProductImageRow[]) {
    setReordering(true);
    await reorderProductImages(
      productId,
      newOrder.map((img) => img.id),
    );
    setReordering(false);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    applyOrder(next);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...sorted];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    applyOrder(next);
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6">
      <h2 className="font-body text-xl font-semibold text-navy">Images</h2>
      <p className="mt-1 font-body text-xs text-navy/50">
        Up to {MAX_IMAGES}. The first image is the cover shown on the site. Leave "which pack
        size" unset for a general photo shown for every variant, or tag it to one variant (e.g. a
        250g box photo showing its actual piece count).
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sorted.map((img, index) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-navy/10">
            <div className="relative aspect-square bg-navy/4">
              <Image src={productImageUrl(img.storage_path)} alt={img.alt_text ?? ""} fill className="object-cover" />
            </div>

            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-brass px-2 py-0.5 font-body text-[10px] font-semibold text-navy">
                Cover
              </span>
            )}
            {index !== 0 && variantLabel(img.variant_id) && (
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

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-navy/70 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => moveImage(index, -1)}
                disabled={index === 0 || reordering}
                aria-label="Move left"
                className="flex h-5 w-5 items-center justify-center rounded text-cream disabled:opacity-30"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <path d="M12.5 5 7.5 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  disabled={reordering}
                  className="font-body text-[10px] font-semibold text-cream hover:text-brass disabled:opacity-30"
                >
                  Make cover
                </button>
              )}
              <button
                type="button"
                onClick={() => moveImage(index, 1)}
                disabled={index === sorted.length - 1 || reordering}
                aria-label="Move right"
                className="flex h-5 w-5 items-center justify-center rounded text-cream disabled:opacity-30"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length >= MAX_IMAGES ? (
        <p className="mt-4 font-body text-xs text-navy/50">
          Maximum of {MAX_IMAGES} images reached — delete one to add another.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg bg-cream p-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-[11px] font-medium text-navy/55">Photo file</span>
            <input ref={fileRef} type="file" accept="image/*" className="font-body text-xs" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-[11px] font-medium text-navy/55">Which pack size</span>
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
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-[11px] font-medium text-navy/55">Alt text (optional)</span>
            <input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="rounded-lg border border-navy/15 bg-white px-2.5 py-2 font-body text-xs text-navy placeholder:text-navy/40"
            />
          </label>
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
