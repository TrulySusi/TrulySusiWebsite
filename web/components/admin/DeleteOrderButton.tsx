"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder } from "@/app/admin/orders/actions";

export function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Permanently delete order ${orderNumber}? This can't be undone.`)) return;
    setDeleting(true);
    await deleteOrder(orderId);
    router.push("/admin/orders");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="font-body text-xs font-semibold text-brass hover:text-brass/80 disabled:opacity-60"
    >
      {deleting ? "Deleting…" : "Delete order"}
    </button>
  );
}
