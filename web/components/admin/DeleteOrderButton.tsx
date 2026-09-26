"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder } from "@/app/admin/orders/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteOrder(orderId);
    router.push("/admin/orders");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={deleting}
        className="font-body text-xs font-semibold text-brass hover:text-brass/80 disabled:opacity-60"
      >
        {deleting ? "Deleting…" : "Delete order"}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this order?"
        description={`Permanently delete order ${orderNumber}? This can't be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
