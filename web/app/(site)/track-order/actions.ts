"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Order numbers are sequential (TS-2026-000123) and guessable, so looking
// one up also requires the phone number on file — otherwise anyone could
// enumerate every order and see other customers' names/addresses.
function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export type TrackedOrder = {
  orderNumber: string;
  status: string;
  createdAt: string;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  totalInr: number;
  items: { name: string; variantLabel: string; quantity: number; imageUrl: string | null }[];
  deliveryAddress: {
    line1: string;
    line2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
};

export async function lookupOrder(orderNumberInput: string, phoneInput: string): Promise<TrackedOrder | null> {
  const orderNumber = orderNumberInput.trim().toUpperCase();
  if (!orderNumber || !phoneInput.trim()) return null;

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at, courier_name, tracking_number, tracking_url, total_inr, customer_phone, shipping_address")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) return null;
  if (normalizePhone(order.customer_phone) !== normalizePhone(phoneInput)) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("name_snapshot, variant_label_snapshot, quantity, product_id")
    .eq("order_id", order.id);

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
    courierName: order.courier_name,
    trackingNumber: order.tracking_number,
    trackingUrl: order.tracking_url,
    totalInr: order.total_inr,
    items: (items ?? []).map((item) => {
      const storagePath = item.product_id ? coverByProduct.get(item.product_id) : undefined;
      return {
        name: item.name_snapshot,
        variantLabel: item.variant_label_snapshot,
        quantity: item.quantity,
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
}
