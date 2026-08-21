import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOrdersFilters } from "@/components/admin/AdminOrdersFilters";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, created_at, total_inr, status, payment_status, order_items ( quantity )",
    )
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    const term = q.trim();
    query = query.or(
      `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`,
    );
  }
  if (status?.trim()) query = query.eq("status", status.trim());

  const { data } = await query;

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        action={
          <Link
            href="/admin/orders/new"
            className="rounded-full bg-brass px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-brass/90"
          >
            + New order
          </Link>
        }
      />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={null}>
            <AdminOrdersFilters />
          </Suspense>
          <AdminOrdersTable orders={data ?? []} />
        </div>
      </div>
    </div>
  );
}
