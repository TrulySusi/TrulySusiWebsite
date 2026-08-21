"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending_payment", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export function AdminOrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const status = searchParams.get("status") ?? "";

  function updateParams(next: { q?: string; status?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { q, status, ...next };
    if (merged.q) params.set("q", merged.q);
    else params.delete("q");
    if (merged.status) params.set("status", merged.status);
    else params.delete("status");
    startTransition(() => {
      router.push(`/admin/orders${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) updateParams({ q });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-5 flex flex-col gap-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by order #, customer name, or phone…"
        className="w-full max-w-sm rounded-lg border border-navy/15 bg-white px-3.5 py-2 font-body text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-1 focus:ring-navy/20"
      />
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateParams({ status: opt.value })}
            className={`rounded-full px-3.5 py-1.5 font-body text-xs font-semibold transition-colors ${
              status === opt.value ? "bg-navy text-cream" : "bg-navy/6 text-navy/70 hover:bg-navy/10"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
