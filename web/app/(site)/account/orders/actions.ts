"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerSession } from "@/lib/customer-session";

export type MyOrder = {
  orderNumber: string;
  status: string;
  createdAt: string;
  totalInr: number;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  customerName: string;
  customerPhone: string;
  items: { name: string; variantLabel: string; quantity: number; imageUrl: string | null; lineTotalInr: number }[];
  deliveryAddress: {
    line1: string;
    line2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
};

export async function listMyOrders(): Promise<MyOrder[]> {
  const session = await getCustomerSession();
  if (!session) return [];

  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, created_at, courier_name, tracking_number, tracking_url, total_inr, customer_name, customer_phone, shipping_address"
    )
    .eq("customer_id", session.id)
    .order("created_at", { ascending: false });
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, name_snapshot, variant_label_snapshot, quantity, line_total_inr, product_id")
    .in("order_id", orderIds);

  const productIds = [...new Set((items ?? []).map((i) => i.product_id).filter((id): id is string => !!id))];
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

  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  return orders.map((order) => {
    const addr = order.shipping_address as {
      line1: string;
      line2: string;
      landmark: string;
      city: string;
      state: string;
      pincode: string;
    };

    return {
      orderNumber: order.order_number,
      status: order.status,
      createdAt: order.created_at,
      totalInr: order.total_inr,
      courierName: order.courier_name,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      items: (itemsByOrder.get(order.id) ?? []).map((item) => {
        const storagePath = item.product_id ? coverByProduct.get(item.product_id) : undefined;
        return {
          name: item.name_snapshot,
          variantLabel: item.variant_label_snapshot,
          quantity: item.quantity,
          lineTotalInr: item.line_total_inr,
          imageUrl: storagePath ? `${base}/storage/v1/object/public/product-images/${storagePath}` : null,
        };
      }),
      deliveryAddress: {
        line1: addr.line1,
        line2: addr.line2,
        landmark: addr.landmark,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      },
    };
  });
}
