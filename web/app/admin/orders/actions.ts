"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncOrderToZohoIfNeeded } from "@/lib/zoho";
import {
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendCancellationEmail,
  sendRefundEmail,
} from "@/lib/email";

async function requireAdmin() {
  const { admin } = await getAdminSession();
  if (!admin) throw new Error("Not authorized");
}

async function generateOrderNumber(supabase: ReturnType<typeof createAdminClient>) {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .like("order_number", `TS-${year}-%`);
  const seq = String((count ?? 0) + 1).padStart(6, "0");
  return `TS-${year}-${seq}`;
}

export type ManualOrderItem = {
  productId: string;
  variantId: string;
  nameSnapshot: string;
  variantLabelSnapshot: string;
  unitPriceInr: number;
  quantity: number;
};

export async function createManualOrder(formData: FormData, items: ManualOrderItem[]) {
  await requireAdmin();
  if (items.length === 0) throw new Error("Add at least one item");
  const supabase = createAdminClient();

  const shippingFee = Number(formData.get("shipping_fee_inr") ?? 0);
  const discount = Number(formData.get("discount_inr") ?? 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPriceInr * i.quantity, 0);
  const total = subtotal + shippingFee - discount;

  const paymentStatus = String(formData.get("payment_status") ?? "pending");
  const orderNumber = await generateOrderNumber(supabase);

  const shippingAddress = {
    firstName: String(formData.get("first_name") ?? ""),
    lastName: String(formData.get("last_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    alternatePhone: "",
    label: "Home",
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    landmark: String(formData.get("landmark") ?? ""),
    pincode: String(formData.get("pincode") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    notes: "",
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
      customer_email: String(formData.get("email") ?? "") || null,
      customer_phone: shippingAddress.phone,
      shipping_address: shippingAddress,
      subtotal_inr: subtotal,
      shipping_fee_inr: shippingFee,
      discount_inr: discount,
      total_inr: total,
      payment_method: String(formData.get("payment_method") ?? "manual"),
      order_channel: String(formData.get("order_channel") ?? "whatsapp"),
      status: paymentStatus === "paid" ? "paid" : "pending_payment",
      payment_status: paymentStatus,
      notes: String(formData.get("notes") ?? "") || null,
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      name_snapshot: item.nameSnapshot,
      variant_label_snapshot: item.variantLabelSnapshot,
      unit_price_inr: item.unitPriceInr,
      quantity: item.quantity,
      line_total_inr: item.unitPriceInr * item.quantity,
    })),
  );
  if (itemsError) throw itemsError;

  if (paymentStatus === "paid") {
    await syncOrderToZohoIfNeeded(order.id);
    await sendOrderConfirmationEmail(order.id);
  }

  revalidatePath("/admin/orders");
  return order.id as string;
}

export async function updateOrderFulfillment(orderId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const status = String(formData.get("status") ?? "");
  const update: Record<string, unknown> = {
    status,
    courier_name: String(formData.get("courier_name") ?? "") || null,
    tracking_number: String(formData.get("tracking_number") ?? "") || null,
    tracking_url: String(formData.get("tracking_url") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  };

  if (status === "shipped") update.shipped_at = new Date().toISOString();
  if (status === "delivered") update.delivered_at = new Date().toISOString();

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) throw error;

  if (status === "shipped") await sendShippingNotificationEmail(orderId);
  if (status === "cancelled") await sendCancellationEmail(orderId);
  if (status === "refunded") await sendRefundEmail(orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);
  if (error) throw error;

  if (paymentStatus === "paid") await syncOrderToZohoIfNeeded(orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  // payments has no cascade FK to orders, unlike order_items — clear it first.
  await supabase.from("payments").delete().eq("order_id", orderId);
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) throw error;

  revalidatePath("/admin/orders");
}

export async function bulkDeleteOrders(orderIds: string[]) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("payments").delete().in("order_id", orderIds);
  const { error } = await supabase.from("orders").delete().in("id", orderIds);
  if (error) throw error;

  revalidatePath("/admin/orders");
}

export async function bulkMarkShipped(orderIds: string[], courierName: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      shipped_at: new Date().toISOString(),
      courier_name: courierName || null,
    })
    .in("id", orderIds);
  if (error) throw error;

  revalidatePath("/admin/orders");
}
