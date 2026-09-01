import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOrdersFilters } from "@/components/admin/AdminOrdersFilters";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, created_at, total_inr, status, payment_status, order_items ( quantity )",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    const term = q.trim();
    query = query.or(
      `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`,
    );
  }
  if (status?.trim()) query = query.eq("status", status.trim());

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q?.trim()) params.set("q", q.trim());
    if (status?.trim()) params.set("status", status.trim());
    if (p > 1) params.set("page", String(p));
    return `/admin/orders${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div>
      <AdminPageHeader title="Orders" />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex justify-end">
            <Link
              href="/admin/orders/new"
              className="rounded-full bg-brass px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-brass/90"
            >
              + New order
            </Link>
          </div>
          <Suspense fallback={null}>
            <AdminOrdersFilters />
          </Suspense>
          <AdminOrdersTable orders={data ?? []} />

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between font-body text-sm text-navy/60">
              <span>
                Page {page} of {totalPages} &middot; {count} order{count === 1 ? "" : "s"}
              </span>
              <div className="flex gap-2">
                <Link
                  href={pageHref(page - 1)}
                  aria-disabled={page <= 1}
                  className={`rounded-full border border-navy/15 px-4 py-1.5 font-semibold transition-colors ${
                    page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-navy/5"
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={pageHref(page + 1)}
                  aria-disabled={page >= totalPages}
                  className={`rounded-full border border-navy/15 px-4 py-1.5 font-semibold transition-colors ${
                    page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-navy/5"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
