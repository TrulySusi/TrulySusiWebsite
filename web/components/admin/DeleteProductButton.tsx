"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/products/actions";

export function DeleteProductButton({ productId, name }: { productId: string; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Permanently delete "${name}"? This can't be undone.`)) return;
    setDeleting(true);
    await deleteProduct(productId);
    router.push("/admin/products");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="font-body text-xs font-semibold text-brass hover:text-brass/80 disabled:opacity-60"
    >
      {deleting ? "Deleting…" : "Delete product"}
    </button>
  );
}
