"use server";

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayClient } from "@/lib/razorpay";
import { getCustomerSession } from "@/lib/customer-session";
import { completeOrderPayment } from "@/lib/order-payment";

// Same dummy figures as /policies/shipping and the checkout page's own
// display copy — kept in one place so the server-computed total can
// never drift from what the customer was shown.
const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_FEE = 79;

export type CartItemInput = {
  variantId: string;
  quantity: number;
};

export type DeliveryInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  notes: string;
};

async function generateOrderNumber(supabase: ReturnType<typeof createAdminClient>) {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .like("order_number", `TS-${year}-%`);
  const seq = String((count ?? 0) + 1).padStart(6, "0");
  return `TS-${year}-${seq}`;
}

export async function createRazorpayOrder(cartItems: CartItemInput[], delivery: DeliveryInput) {
  if (cartItems.length === 0) throw new Error("Your cart is empty.");

  const supabase = createAdminClient();

  // Re-fetch real price/stock/active state for every item — the amount
  // charged is computed from this, never from anything the client sent.
  const variantIds = cartItems.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, label, price_inr, is_active, product_id, products ( name )")
    .in("id", variantIds);
  if (variantsError) throw new Error(variantsError.message);

  const orderItems: {
    product_id: string;
    variant_id: string;
    name_snapshot: string;
    variant_label_snapshot: string;
    unit_price_inr: number;
    quantity: number;
    line_total_inr: number;
  }[] = [];

  for (const item of cartItems) {
    const variant = variants?.find((v) => v.id === item.variantId);
    if (!variant || !variant.is_active) {
      throw new Error("One of the items in your cart is no longer available.");
    }
    if (item.quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }
    const product = variant.products as unknown as { name: string } | { name: string }[] | null;
    const productName = Array.isArray(product) ? product[0]?.name : product?.name;

    orderItems.push({
      product_id: variant.product_id,
      variant_id: variant.id,
      name_snapshot: productName ?? "",
      variant_label_snapshot: variant.label,
      unit_price_inr: variant.price_inr,
      quantity: item.quantity,
      line_total_inr: variant.price_inr * item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.line_total_inr, 0);
  const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  // Attach to the signed-in customer if there is one; guests (and admins
  // shopping the storefront themselves) get null.
  const customerSession = await getCustomerSession();

  const shippingAddress = {
    firstName: delivery.firstName,
    lastName: delivery.lastName,
    phone: delivery.phone,
    alternatePhone: "",
    label: "Home",
    line1: delivery.line1,
    line2: delivery.line2,
    landmark: delivery.landmark,
    pincode: delivery.pincode,
    city: delivery.city,
    state: delivery.state,
    notes: delivery.notes,
  };

  const orderNumber = await generateOrderNumber(supabase);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerSession?.id ?? null,
      customer_name: `${delivery.firstName} ${delivery.lastName}`.trim(),
      customer_email: delivery.email,
      customer_phone: delivery.phone,
      shipping_address: shippingAddress,
      subtotal_inr: subtotal,
      shipping_fee_inr: shippingFee,
      discount_inr: 0,
      total_inr: total,
      payment_method: "razorpay",
      order_channel: "website",
      status: "pending_payment",
      payment_status: "pending",
    })
    .select("id")
    .single();
  if (orderError) throw new Error(orderError.message);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
  if (itemsError) throw new Error(itemsError.message);

  const razorpay = createRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100),
    currency: "INR",
    receipt: orderNumber,
    notes: { order_id: order.id },
  });

  await supabase.from("orders").update({ razorpay_order_id: razorpayOrder.id }).eq("id", order.id);

  return {
    dbOrderId: order.id as string,
    orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: Number(razorpayOrder.amount),
    currency: String(razorpayOrder.currency),
  };
}

export type OrderSummaryItem = {
  nameSnapshot: string;
  variantLabelSnapshot: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
  imageUrl: string | null;
};

export type OrderSummary = {
  orderNumber: string;
  customerName: string;
  deliveryAddress: {
    line1: string;
    line2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: OrderSummaryItem[];
  subtotalInr: number;
  shippingFeeInr: number;
  discountInr: number;
  totalInr: number;
};

export async function getOrderSummary(orderNumber: string): Promise<OrderSummary | null> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, shipping_address, subtotal_inr, shipping_fee_inr, discount_inr, total_inr")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("name_snapshot, variant_label_snapshot, quantity, unit_price_inr, line_total_inr, product_id")
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
  const address = order.shipping_address as {
    line1: string;
    line2: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };

  return {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    deliveryAddress: {
      line1: address.line1,
      line2: address.line2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
    },
    items: (items ?? []).map((item) => {
      const storagePath = item.product_id ? coverByProduct.get(item.product_id) : undefined;
      return {
        nameSnapshot: item.name_snapshot,
        variantLabelSnapshot: item.variant_label_snapshot,
        quantity: item.quantity,
        unitPriceInr: item.unit_price_inr,
        lineTotalInr: item.line_total_inr,
        imageUrl: storagePath ? `${base}/storage/v1/object/public/product-images/${storagePath}` : null,
      };
    }),
    subtotalInr: order.subtotal_inr,
    shippingFeeInr: order.shipping_fee_inr,
    discountInr: order.discount_inr,
    totalInr: order.total_inr,
  };
}

export async function verifyRazorpayPayment(params: {
  dbOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { dbOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(razorpaySignature);
  const signatureValid =
    expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  if (!signatureValid) {
    throw new Error("Payment verification failed.");
  }

  await completeOrderPayment({ dbOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature });
  return { dbOrderId };
}
