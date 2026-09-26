"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/products/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function DeleteProductButton({ productId, name }: { productId: string; name: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteProduct(productId);
    router.push("/admin/products");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={deleting}
        className="font-body text-xs font-semibold text-brass hover:text-brass/80 disabled:opacity-60"
      >
        {deleting ? "Deleting…" : "Delete product"}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this product?"
        description={`Permanently delete "${name}"? This can't be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
