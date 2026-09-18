"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkDeleteOrders, bulkMarkShipped, deleteOrder } from "@/app/admin/orders/actions";

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-navy/10 text-navy/60",
  paid: "bg-sage/20 text-sage",
  packed: "bg-brass/15 text-brass",
  shipped: "bg-brass/25 text-brass",
  delivered: "bg-sage/30 text-sage",
  cancelled: "bg-brass/10 text-brass/70",
  refunded: "bg-navy/10 text-navy/50",
};

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-navy/10 text-navy/50",
  paid: "bg-sage/20 text-sage",
  failed: "bg-brass/15 text-brass",
  refunded: "bg-navy/10 text-navy/50",
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  created_at: string;
  total_inr: number;
  status: string;
  payment_status: string;
  order_items: { quantity: number }[];
};

export function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [courierName, setCourierName] = useState("");
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === orders.length ? new Set() : new Set(orders.map((o) => o.id))));
  }

  async function handleMarkShipped() {
    setApplying(true);
    await bulkMarkShipped([...selected], courierName);
    setApplying(false);
    setSelected(new Set());
    setCourierName("");
    router.refresh();
  }

  async function handleBulkDelete() {
    if (!confirm(`Permanently delete ${selected.size} order${selected.size === 1 ? "" : "s"}? This can't be undone.`))
      return;
    setDeleting(true);
    await bulkDeleteOrders([...selected]);
    setDeleting(false);
    setSelected(new Set());
    router.refresh();
  }

  async function handleRowDelete(e: React.MouseEvent, order: Order) {
    e.stopPropagation();
    if (!confirm(`Permanently delete order ${order.order_number}? This can't be undone.`)) return;
    setDeletingRowId(order.id);
    await deleteOrder(order.id);
    setDeletingRowId(null);
    router.refresh();
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-navy px-4 py-3">
          <span className="font-body text-sm text-cream">{selected.size} selected</span>
          <input
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            placeholder="Courier name (optional)"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 font-body text-xs text-white placeholder:text-white/50"
          />
          <button
            type="button"
            onClick={handleMarkShipped}
            disabled={applying || deleting}
            className="rounded-full bg-brass px-4 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:bg-brass/90 disabled:opacity-60"
          >
            {applying ? "Applying…" : "Mark as shipped"}
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={applying || deleting}
            className="rounded-full border border-brass/50 px-4 py-1.5 font-body text-xs font-semibold text-brass transition-colors hover:bg-brass/10 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete selected"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="font-body text-xs text-cream/60 hover:text-cream"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-navy/10">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selected.size === orders.length}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-navy/30"
                  aria-label="Select all orders"
                />
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Order
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Customer
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Date
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Items
              </th>
              <th className="px-3 py-3 text-right font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Total
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Payment
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Status
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center font-body text-sm text-navy/50">
                  No orders match.
                </td>
              </tr>
            )}
            {orders.map((order, i) => {
              const itemCount = order.order_items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                  className="animate-row-in cursor-pointer border-b border-navy/6 transition-colors last:border-0 hover:bg-navy/3"
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggle(order.id)}
                      className="h-4 w-4 rounded border-navy/30"
                      aria-label={`Select order ${order.order_number}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-body text-sm font-semibold text-navy hover:text-brass">
                      {order.order_number}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-body text-sm text-navy">{order.customer_name}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-body text-xs text-navy/60">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-3 font-body text-xs text-navy/60">{itemCount}</td>
                  <td className="px-3 py-3 text-right font-body text-sm font-bold text-navy">
                    ₹{order.total_inr.toFixed(0)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold capitalize ${PAYMENT_STYLES[order.payment_status] ?? "bg-navy/10 text-navy/60"}`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[order.status] ?? "bg-navy/10 text-navy/60"}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Edit order ${order.order_number}`}
                        title="Edit"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-navy/8 hover:text-navy"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                          <path
                            d="M13.5 3.5 16.5 6.5 7 16H4v-3L13.5 3.5Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleRowDelete(e, order)}
                        disabled={deletingRowId === order.id}
                        aria-label={`Delete order ${order.order_number}`}
                        title="Delete"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-brass/10 hover:text-brass disabled:opacity-60"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                          <path
                            d="M4 5.5h12M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M6 5.5 6.6 16a1 1 0 0 0 1 1h4.8a1 1 0 0 0 1-1l.6-10.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
