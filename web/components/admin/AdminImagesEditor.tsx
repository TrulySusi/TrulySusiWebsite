"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { photoZoomStyle, productImageUrl } from "@/lib/catalog-shared";
import {
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
  updateImageFocalPoint,
  updateImageZoom,
} from "@/app/admin/products/actions";

const MAX_IMAGES = 6;

type ProductImageRow = {
  id: string;
  storage_path: string;
  variant_id: string | null;
  alt_text: string | null;
  sort_order: number;
  focal_y: number;
  zoom: number;
  width: number | null;
  height: number | null;
};

/** Reads a picked file's real pixel dimensions before it's uploaded. */
function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [focalDrafts, setFocalDrafts] = useState<Record<string, number>>(
    () => Object.fromEntries(images.map((img) => [img.id, img.focal_y])),
  );
  const [zoomDrafts, setZoomDrafts] = useState<Record<string, number>>(
    () => Object.fromEntries(images.map((img) => [img.id, img.zoom])),
  );
  const focalSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const zoomSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const variantLabel = (id: string | null) => variants.find((v) => v.id === id)?.label ?? null;

  function handleFocalChange(imageId: string, focalY: number) {
    setFocalDrafts((prev) => ({ ...prev, [imageId]: focalY }));
    clearTimeout(focalSaveTimers.current[imageId]);
    focalSaveTimers.current[imageId] = setTimeout(() => {
      updateImageFocalPoint(productId, imageId, focalY).catch(() =>
        setError("Couldn't save that position. Try again."),
      );
    }, 400);
  }

  function handleZoomChange(imageId: string, zoom: number) {
    setZoomDrafts((prev) => ({ ...prev, [imageId]: zoom }));
    clearTimeout(zoomSaveTimers.current[imageId]);
    zoomSaveTimers.current[imageId] = setTimeout(() => {
      updateImageZoom(productId, imageId, zoom).catch(() =>
        setError("Couldn't save that zoom level. Try again."),
      );
    }, 400);
  }

  function pickFile(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("That's not an image file.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Choose a file first.");
      return;
    }
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.set("file", selectedFile);
    if (variantId) formData.set("variant_id", variantId);
    if (altText) formData.set("alt_text", altText);
    const dimensions = await readImageDimensions(selectedFile);
    if (dimensions) {
      formData.set("width", String(dimensions.width));
      formData.set("height", String(dimensions.height));
    }

    try {
      await uploadProductImage(productId, formData);
      if (fileRef.current) fileRef.current.value = "";
      pickFile(null);
      setAltText("");
      setVariantId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload that image. Try again.");
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
        250g box photo showing its actual piece count). New uploads default to showing the whole
        photo, uncropped. Use "Zoom" if you want to crop in tighter (0 = whole photo, 200 = tightly
        cropped) and "Pos" to choose which part stays in frame once zoomed in.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sorted.map((img, index) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-navy/10">
            <div className="relative aspect-square overflow-hidden bg-navy/4">
              <Image
                src={productImageUrl(img.storage_path)}
                alt={img.alt_text ?? ""}
                fill
                style={photoZoomStyle(focalDrafts[img.id], zoomDrafts[img.id], img.width, img.height)}
              />

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

            <div className="flex flex-col gap-1.5 border-t border-navy/10 bg-cream px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-9 shrink-0 font-body text-[9px] uppercase tracking-wide text-navy/40">Zoom</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={zoomDrafts[img.id] ?? 0}
                  onChange={(e) => handleZoomChange(img.id, Number(e.target.value))}
                  aria-label="Zoom in or out — 0 shows the whole photo (default), 200 is tightly cropped"
                  className="h-1 flex-1 accent-navy"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-9 shrink-0 font-body text-[9px] uppercase tracking-wide text-navy/40">Pos</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={focalDrafts[img.id] ?? 50}
                  onChange={(e) => handleFocalChange(img.id, Number(e.target.value))}
                  aria-label="Adjust which part of the photo shows once zoomed in"
                  className="h-1 flex-1 accent-navy"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length >= MAX_IMAGES ? (
        <p className="mt-4 font-body text-xs text-navy/50">
          Maximum of {MAX_IMAGES} images reached. Delete one to add another.
        </p>
      ) : (
        <div className="mt-4 rounded-2xl bg-cream p-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />

          {selectedFile && previewUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-navy/15 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-medium text-navy">{selectedFile.name}</p>
                <p className="font-body text-xs text-navy/45">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (fileRef.current) fileRef.current.value = "";
                  pickFile(null);
                }}
                aria-label="Remove selected photo"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-navy/6 hover:text-brass"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragActive ? "border-brass bg-brass/5" : "border-navy/20 bg-white hover:border-navy/35"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-navy/35">
                <path d="M12 15V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="font-body text-sm font-medium text-navy">
                <span className="text-brass">Click to upload</span> or drag and drop
              </p>
              <p className="font-body text-xs text-navy/45">PNG or JPG, up to 15MB</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-end gap-3">
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
              disabled={uploading || !selectedFile}
              className="rounded-full bg-navy px-4 py-2 font-body text-xs font-semibold text-cream transition-colors hover:bg-navy/90 disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 font-body text-xs text-brass">{error}</p>}
    </div>
  );
}
