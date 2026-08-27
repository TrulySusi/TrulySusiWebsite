import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncOrderToZohoIfNeeded } from "@/lib/zoho";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Shared by both the client-side verification call (checkout/actions.ts,
// fired by the browser right after Razorpay's checkout succeeds) and the
// Razorpay webhook (app/api/webhooks/razorpay/route.ts, which is the
// fallback for when that browser call never happens — tab closed, network
// dropped, UPI app-switch didn't return). Both paths land here so an order
// only ever gets marked paid, synced to Zoho, and emailed once.
export async function completeOrderPayment(params: {
  dbOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string | null;
  rawPayload?: unknown;
}): Promise<{ alreadyPaid: boolean }> {
  const { dbOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, rawPayload } = params;
  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, razorpay_order_id, status, total_inr")
    .eq("id", dbOrderId)
    .maybeSingle();
  if (fetchError) throw new Error(fetchError.message);
  if (!order || order.razorpay_order_id !== razorpayOrderId) {
    throw new Error("Order mismatch.");
  }
  // Idempotent — whichever path (browser callback or webhook) gets here
  // first wins; the other is a no-op instead of double-processing.
  if (order.status === "paid") {
    return { alreadyPaid: true };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid", payment_status: "paid" })
    .eq("id", dbOrderId);
  if (updateError) throw new Error(updateError.message);

  const { error: paymentError } = await supabase.from("payments").insert({
    order_id: dbOrderId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    amount_inr: order.total_inr,
    status: "captured",
    raw_payload: rawPayload ?? null,
    verified_at: new Date().toISOString(),
  });
  if (paymentError && paymentError.code !== "23505") {
    // 23505 = duplicate razorpay_payment_id: this exact payment was already
    // recorded by the other path racing this one. The order is genuinely
    // paid either way — treat as success rather than surfacing a raw
    // Postgrest error object (which can't serialize cleanly across the
    // server/client boundary and would show an opaque failure for money
    // that already went through).
    throw new Error(paymentError.message);
  }

  await syncOrderToZohoIfNeeded(dbOrderId);
  await sendOrderConfirmationEmail(dbOrderId);

  return { alreadyPaid: false };
}
