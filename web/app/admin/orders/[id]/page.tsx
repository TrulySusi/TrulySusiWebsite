import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminOrderDetail } from "@/components/admin/AdminOrderDetail";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();

  const productIds = [...new Set((items ?? []).map((i) => i.product_id).filter((v): v is string => !!v))];
  const { data: images } = productIds.length
    ? await supabase
        .from("product_images")
        .select("product_id, storage_path, sort_order")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true })
    : { data: [] as { product_id: string; storage_path: string; sort_order: number }[] };

  const coverByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    if (!coverByProduct.has(img.product_id)) coverByProduct.set(img.product_id, img.storage_path);
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
  const itemsWithImages = (items ?? []).map((item) => {
    const storagePath = item.product_id ? coverByProduct.get(item.product_id) : undefined;
    return {
      ...item,
      imageUrl: storagePath ? `${base}/storage/v1/object/public/product-images/${storagePath}` : null,
    };
  });

  return (
    <div>
      <AdminPageHeader title={order.order_number} subtitle={order.customer_name} />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin/orders"
              className="font-body text-sm font-semibold text-navy/60 hover:text-navy"
            >
              ← Back to orders
            </Link>
            <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
          </div>
          <AdminOrderDetail order={order} items={itemsWithImages} />
        </div>
      </div>
    </div>
  );
}
