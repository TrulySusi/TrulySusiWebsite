import "server-only";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { completeOrderPayment } from "@/lib/order-payment";

// Fallback for when the browser never gets to call verifyRazorpayPayment
// (tab closed, network dropped, UPI app-switch didn't return) after Razorpay
// has actually captured the money. Razorpay retries this endpoint on
// failure, so every path below either completes the order or returns 200 —
// a stray 4xx/5xx just means Razorpay will hit us again with the same event.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  let signatureValid = false;
  try {
    signatureValid = Razorpay.validateWebhookSignature(rawBody, signature, secret);
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true });
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId: string | undefined = payment?.order_id;
  const razorpayPaymentId: string | undefined = payment?.id;
  if (!razorpayOrderId || !razorpayPaymentId) {
    return NextResponse.json({ error: "missing payment fields" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (!order) {
    return NextResponse.json({ ok: true });
  }

  try {
    await completeOrderPayment({
      dbOrderId: order.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: null,
      rawPayload: event,
    });
  } catch (err) {
    console.error("Razorpay webhook: failed to complete order payment:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
