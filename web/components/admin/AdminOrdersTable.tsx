"use client";

import { useState } from "react";
import Link from "next/link";
import { bulkMarkShipped } from "@/app/admin/orders/actions";

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-navy/10 text-navy/60",
  paid: "bg-sage/20 text-sage",
  packed: "bg-brass/15 text-brass",
  shipped: "bg-brass/25 text-brass",
  delivered: "bg-sage/30 text-sage",
  cancelled: "bg-brass/10 text-brass/70",
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [courierName, setCourierName] = useState("");
  const [applying, setApplying] = useState(false);

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
            disabled={applying}
            className="rounded-full bg-brass px-4 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:bg-brass/90 disabled:opacity-60"
          >
            {applying ? "Applying…" : "Mark as shipped"}
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
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Total
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Payment
              </th>
              <th className="px-3 py-3 font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center font-body text-sm text-navy/50">
                  No orders match.
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const itemCount = order.order_items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <tr key={order.id} className="border-b border-navy/6 last:border-0 hover:bg-navy/3">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggle(order.id)}
                      className="h-4 w-4 rounded border-navy/30"
                      aria-label={`Select order ${order.order_number}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-body text-sm font-semibold text-navy hover:text-brass"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-body text-sm text-navy">{order.customer_name}</td>
                  <td className="px-3 py-3 font-body text-xs text-navy/60">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 font-body text-xs text-navy/60">{itemCount}</td>
                  <td className="px-3 py-3 font-body text-sm font-bold text-navy">
                    ₹{order.total_inr.toFixed(0)}
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-body text-xs capitalize text-navy/60">
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
