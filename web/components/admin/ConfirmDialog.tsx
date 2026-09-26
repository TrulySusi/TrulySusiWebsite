"use client";

import { TrashIcon } from "@/components/icons";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="animate-modal-backdrop-in fixed inset-0 z-60 flex items-center justify-center bg-navy/55 px-4 py-8 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="animate-modal-card-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brass/12 text-brass">
          <TrashIcon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-center font-display text-lg text-navy">{title}</h2>
        <p className="mt-2 text-center font-body text-sm text-navy/60">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-full border border-navy/15 px-4 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-brass px-4 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-brass/90 disabled:opacity-60"
          >
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
