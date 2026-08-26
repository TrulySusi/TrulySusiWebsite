import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { productImageUrl } from "@/lib/catalog-shared";
import { getZohoAccessToken } from "@/lib/zoho";

const FROM_ADDRESS = "Truly Susi's <orders@trulysusi.in>";
const SUPPORT_EMAIL = "support@trulysusi.in";

const ZOHO_API_DOMAIN = process.env.ZOHO_API_DOMAIN!;
const ZOHO_ORG_ID = process.env.ZOHO_ORGANIZATION_ID!;

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

type ShippingAddress = {
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

function addressBlock(addr: ShippingAddress) {
  return `
    <p style="margin:0;line-height:1.6;">
      ${addr.firstName} ${addr.lastName}<br>
      ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}${addr.landmark ? `, near ${addr.landmark}` : ""}<br>
      ${addr.city}, ${addr.state} &mdash; ${addr.pincode}<br>
      ${addr.phone}
    </p>`;
}

function emailShell(previewText: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf3e9;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf3e9;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#1c2b4a;padding:28px 32px;text-align:center;">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#faf3e9;">Truly Susi&rsquo;s</span>
</td></tr>
<tr><td style="padding:32px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c2b4a;font-size:14px;">
${bodyHtml}
</td></tr>
<tr><td style="background:#faf3e9;padding:20px 32px;text-align:center;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#1c2b4a99;">
Questions? Write to <a href="mailto:${SUPPORT_EMAIL}" style="color:#c98a2f;">${SUPPORT_EMAIL}</a><br>
Truly Susi&rsquo;s &middot; Salem, Tamil Nadu
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

async function fetchZohoInvoicePdf(invoiceId: string): Promise<Buffer | null> {
  try {
    const token = await getZohoAccessToken();
    const pdfRes = await fetch(`${ZOHO_API_DOMAIN}/books/v3/invoices/${invoiceId}?organization_id=${ZOHO_ORG_ID}&accept=pdf`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    if (!pdfRes.ok) return null;
    return Buffer.from(await pdfRes.arrayBuffer());
  } catch (err) {
    console.error("Couldn't fetch Zoho invoice PDF:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ---------- Order confirmation ----------

export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  try {
    const { data: order } = await supabase
      .from("orders")
      .select(
        "order_number, customer_name, customer_email, shipping_address, subtotal_inr, shipping_fee_inr, discount_inr, total_inr, payment_method, zoho_invoice_id, order_confirmation_email_sent_at, created_at",
      )
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.order_confirmation_email_sent_at || !order.customer_email) return;

    const { data: items } = await supabase
      .from("order_items")
      .select("name_snapshot, variant_label_snapshot, quantity, unit_price_inr, line_total_inr, product_id")
      .eq("order_id", orderId);

    const productIds = [...new Set((items ?? []).map((i) => i.product_id).filter((id): id is string => !!id))];
    const { data: products } = productIds.length
      ? await supabase.from("products").select("id, shelf_life_days, product_images ( storage_path, sort_order )").in("id", productIds)
      : { data: [] as { id: string; shelf_life_days: number | null; product_images: { storage_path: string; sort_order: number }[] }[] };

    const productById = new Map((products ?? []).map((p) => [p.id, p]));

    const itemRows = (items ?? [])
      .map((item) => {
        const product = item.product_id ? productById.get(item.product_id) : undefined;
        const cover = product?.product_images ? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0] : undefined;
        const imgSrc = cover ? productImageUrl(cover.storage_path) : "";
        return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1c2b4a1a;" width="56">
            ${imgSrc ? `<img src="${imgSrc}" width="48" height="48" style="border-radius:8px;object-fit:cover;display:block;" alt="">` : ""}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #1c2b4a1a;">
            <div style="font-weight:600;">${item.name_snapshot}</div>
            <div style="color:#1c2b4a99;font-size:12px;">${item.variant_label_snapshot} &middot; Qty ${item.quantity}${product?.shelf_life_days ? ` &middot; Best before ${product.shelf_life_days} days` : ""}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1c2b4a1a;text-align:right;font-weight:600;white-space:nowrap;">
            ${formatInr(item.line_total_inr)}
          </td>
        </tr>`;
      })
      .join("");

    const addr = order.shipping_address as ShippingAddress;

    const body = `
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 8px;">Thank you for your order!</h1>
      <p style="margin:0 0 24px;color:#1c2b4a99;">Hi ${addr.firstName}, we've received your order and it's being prepared.</p>
      <p style="margin:0 0 4px;font-size:12px;color:#1c2b4a99;text-transform:uppercase;letter-spacing:0.05em;">Order</p>
      <p style="margin:0 0 24px;font-weight:600;">${order.order_number} &middot; ${formatDate(order.created_at)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <tr><td style="padding:2px 0;color:#1c2b4a99;">Subtotal</td><td style="padding:2px 0;text-align:right;">${formatInr(order.subtotal_inr)}</td></tr>
        <tr><td style="padding:2px 0;color:#1c2b4a99;">Shipping</td><td style="padding:2px 0;text-align:right;">${order.shipping_fee_inr === 0 ? "Free" : formatInr(order.shipping_fee_inr)}</td></tr>
        ${order.discount_inr > 0 ? `<tr><td style="padding:2px 0;color:#1c2b4a99;">Discount</td><td style="padding:2px 0;text-align:right;">&minus;${formatInr(order.discount_inr)}</td></tr>` : ""}
        <tr><td style="padding:10px 0 0;font-weight:700;border-top:1px solid #1c2b4a1a;">Total paid</td><td style="padding:10px 0 0;text-align:right;font-weight:700;border-top:1px solid #1c2b4a1a;">${formatInr(order.total_inr)}</td></tr>
      </table>
      <p style="margin:28px 0 4px;font-size:12px;color:#1c2b4a99;text-transform:uppercase;letter-spacing:0.05em;">Delivering to</p>
      ${addressBlock(addr)}
      ${order.zoho_invoice_id ? `<p style="margin:24px 0 0;color:#1c2b4a99;font-size:12px;">Your invoice is attached to this email.</p>` : ""}
    `;

    const attachments: { filename: string; content: Buffer }[] = [];
    if (order.zoho_invoice_id) {
      const pdf = await fetchZohoInvoicePdf(order.zoho_invoice_id);
      if (pdf) attachments.push({ filename: `${order.order_number}-invoice.pdf`, content: pdf });
    }

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: `Order confirmed: ${order.order_number}`,
      html: emailShell(`Your order ${order.order_number} is confirmed.`, body),
      attachments: attachments.length ? attachments : undefined,
    });
    if (error) throw new Error(error.message);

    await supabase.from("orders").update({ order_confirmation_email_sent_at: new Date().toISOString() }).eq("id", orderId);
  } catch (err) {
    console.error(`Order confirmation email failed for order ${orderId}:`, err instanceof Error ? err.message : err);
  }
}

// ---------- Shipping notification ----------

export async function sendShippingNotificationEmail(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("order_number, customer_email, shipping_address, courier_name, tracking_number, tracking_url, shipping_email_sent_at")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.shipping_email_sent_at || !order.customer_email) return;

    const { data: items } = await supabase.from("order_items").select("name_snapshot, quantity").eq("order_id", orderId);
    const addr = order.shipping_address as ShippingAddress;
    const itemsSummary = (items ?? []).map((i) => `${i.name_snapshot} &times;${i.quantity}`).join(", ");

    const body = `
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 8px;">Your sweets are on the way!</h1>
      <p style="margin:0 0 24px;color:#1c2b4a99;">Order ${order.order_number} has shipped.</p>
      ${
        order.courier_name || order.tracking_number
          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf3e9;border-radius:8px;margin-bottom:24px;">
        <tr><td style="padding:16px 20px;">
          ${order.courier_name ? `<p style="margin:0 0 4px;"><strong>Courier:</strong> ${order.courier_name}</p>` : ""}
          ${order.tracking_number ? `<p style="margin:0;"><strong>Tracking number:</strong> ${order.tracking_number}</p>` : ""}
          ${order.tracking_url ? `<p style="margin:12px 0 0;"><a href="${order.tracking_url}" style="color:#c98a2f;font-weight:600;">Track your shipment &rarr;</a></p>` : ""}
        </td></tr>
      </table>`
          : ""
      }
      <p style="margin:0 0 4px;font-size:12px;color:#1c2b4a99;text-transform:uppercase;letter-spacing:0.05em;">Items</p>
      <p style="margin:0 0 24px;">${itemsSummary}</p>
      <p style="margin:0 0 4px;font-size:12px;color:#1c2b4a99;text-transform:uppercase;letter-spacing:0.05em;">Delivering to</p>
      ${addressBlock(addr)}
    `;

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: `Your order has shipped: ${order.order_number}`,
      html: emailShell(`Order ${order.order_number} has shipped.`, body),
    });
    if (error) throw new Error(error.message);

    await supabase.from("orders").update({ shipping_email_sent_at: new Date().toISOString() }).eq("id", orderId);
  } catch (err) {
    console.error(`Shipping email failed for order ${orderId}:`, err instanceof Error ? err.message : err);
  }
}

// ---------- Cancellation / refund ----------

async function sendStatusChangeEmail(params: {
  orderId: string;
  kind: "cancelled" | "refunded";
}): Promise<void> {
  const supabase = createAdminClient();
  const flagColumn = params.kind === "cancelled" ? "cancellation_email_sent_at" : "refund_email_sent_at";
  try {
    const { data: order } = await supabase
      .from("orders")
      .select(`order_number, customer_email, total_inr, ${flagColumn}`)
      .eq("id", params.orderId)
      .maybeSingle();
    if (!order || (order as Record<string, unknown>)[flagColumn] || !order.customer_email) return;

    const body =
      params.kind === "cancelled"
        ? `
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 8px;">Order cancelled</h1>
      <p style="margin:0 0 24px;color:#1c2b4a99;">Your order ${order.order_number} has been cancelled.</p>
      <p style="margin:0;">If you were charged, a refund of ${formatInr(order.total_inr)} will be initiated. Banks typically take 5&ndash;7 business days to reflect it once processed.</p>
    `
        : `
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 8px;">Your refund has been processed</h1>
      <p style="margin:0 0 24px;color:#1c2b4a99;">Order ${order.order_number}</p>
      <p style="margin:0;">We've processed a refund of ${formatInr(order.total_inr)}. Depending on your bank, it typically takes 5&ndash;7 business days to reflect in your account.</p>
    `;

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      replyTo: SUPPORT_EMAIL,
      subject: params.kind === "cancelled" ? `Order cancelled: ${order.order_number}` : `Refund processed: ${order.order_number}`,
      html: emailShell(params.kind === "cancelled" ? "Your order has been cancelled." : "Your refund has been processed.", body),
    });
    if (error) throw new Error(error.message);

    await supabase.from("orders").update({ [flagColumn]: new Date().toISOString() }).eq("id", params.orderId);
  } catch (err) {
    console.error(`${params.kind} email failed for order ${params.orderId}:`, err instanceof Error ? err.message : err);
  }
}

export async function sendCancellationEmail(orderId: string): Promise<void> {
  await sendStatusChangeEmail({ orderId, kind: "cancelled" });
}

export async function sendRefundEmail(orderId: string): Promise<void> {
  await sendStatusChangeEmail({ orderId, kind: "refunded" });
}
