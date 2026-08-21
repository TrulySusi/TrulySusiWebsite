import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOrderDetail } from "@/components/admin/AdminOrderDetail";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();

  return (
    <div>
      <AdminPageHeader title={order.order_number} subtitle={order.customer_name} />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin/orders"
            className="mb-6 inline-block font-body text-sm font-semibold text-navy/60 hover:text-navy"
          >
            ← Back to orders
          </Link>
          <AdminOrderDetail order={order} items={items ?? []} />
        </div>
      </div>
    </div>
  );
}
