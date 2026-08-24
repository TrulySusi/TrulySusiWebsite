import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const ACCOUNTS_DOMAIN = process.env.ZOHO_ACCOUNTS_DOMAIN!;
const API_DOMAIN = process.env.ZOHO_API_DOMAIN!;
const ORG_ID = process.env.ZOHO_ORGANIZATION_ID!;

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${ACCOUNTS_DOMAIN}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token refresh failed: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

async function zohoFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const url = new URL(`${API_DOMAIN}${path}`);
  if (!url.searchParams.has("organization_id")) url.searchParams.set("organization_id", ORG_ID);

  const res = await fetch(url.toString(), {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Zoho API error (${path}): ${data.message}`);
  return data;
}

// Contacts are matched by email — Zoho only indexes the email that's set on
// a contact_person, not a flat top-level field, so it has to be nested here
// for the search-by-email lookup to ever find this contact again.
async function findOrCreateContact(params: { name: string; email: string; phone: string }): Promise<string> {
  const search = await zohoFetch(`/books/v3/contacts?email=${encodeURIComponent(params.email)}`);
  const existing = search.contacts?.[0];
  if (existing) return existing.contact_id as string;

  const created = await zohoFetch(`/books/v3/contacts`, {
    method: "POST",
    body: JSON.stringify({
      contact_name: params.name,
      contact_type: "customer",
      contact_persons: [{ first_name: params.name, email: params.email, phone: params.phone, is_primary_contact: true }],
    }),
  });
  return created.contact.contact_id as string;
}

export type ZohoOrderInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  paymentMethod: string; // 'razorpay' | 'cod' | 'manual'
  razorpayPaymentId: string | null;
  totalInr: number;
  shippingFeeInr: number;
  discountInr: number;
  items: { name: string; variantLabel: string; unitPriceInr: number; quantity: number }[];
};

async function createInvoiceAndRecordPayment(order: ZohoOrderInput): Promise<string> {
  // Zoho requires a real email on a contact; WhatsApp/Instagram manual
  // orders sometimes only have a phone number, so fall back to a
  // placeholder derived from it rather than skipping the sync entirely.
  const email = order.customerEmail || `${order.customerPhone.replace(/\D/g, "")}@no-email.trulysusi.in`;
  const contactId = await findOrCreateContact({ name: order.customerName, email, phone: order.customerPhone });

  const lineItems: { name: string; rate: number; quantity: number }[] = order.items.map((item) => ({
    name: `${item.name} - ${item.variantLabel}`,
    rate: item.unitPriceInr,
    quantity: item.quantity,
  }));
  if (order.shippingFeeInr > 0) {
    lineItems.push({ name: "Shipping", rate: order.shippingFeeInr, quantity: 1 });
  }
  if (order.discountInr > 0) {
    // A negative line item rather than Zoho's dedicated discount field —
    // unambiguous, and doesn't depend on a discount-field format we've
    // never exercised (the storefront doesn't have working discounts yet).
    lineItems.push({ name: "Discount", rate: -order.discountInr, quantity: 1 });
  }

  const invoiceRes = await zohoFetch(`/books/v3/invoices`, {
    method: "POST",
    body: JSON.stringify({
      customer_id: contactId,
      reference_number: order.orderNumber,
      line_items: lineItems,
    }),
  });
  const invoiceId = invoiceRes.invoice.invoice_id as string;

  const paymentMode = order.paymentMethod === "razorpay" ? "banktransfer" : "cash";
  await zohoFetch(`/books/v3/customerpayments`, {
    method: "POST",
    body: JSON.stringify({
      customer_id: contactId,
      payment_mode: paymentMode,
      amount: order.totalInr,
      date: new Date().toISOString().slice(0, 10),
      reference_number: order.razorpayPaymentId ?? order.orderNumber,
      invoices: [{ invoice_id: invoiceId, amount_applied: order.totalInr }],
    }),
  });

  return invoiceId;
}

// Called right after an order is marked paid — both from the Razorpay
// payment-verification callback and from the admin "Mark as paid" action.
// Never throws: a Zoho outage or misconfiguration should never block a
// customer's order confirmation or an admin's fulfillment update. Skips
// orders that already have a zoho_invoice_id, so a retried call (or the
// payment callback firing twice) can't create a duplicate invoice.
export async function syncOrderToZohoIfNeeded(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  try {
    const { data: order } = await supabase
      .from("orders")
      .select(
        "order_number, customer_name, customer_email, customer_phone, payment_method, total_inr, shipping_fee_inr, discount_inr, zoho_invoice_id, payments ( razorpay_payment_id )",
      )
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.zoho_invoice_id) return;

    const { data: items } = await supabase
      .from("order_items")
      .select("name_snapshot, variant_label_snapshot, unit_price_inr, quantity")
      .eq("order_id", orderId);

    const payment = order.payments as unknown as { razorpay_payment_id: string }[] | null;
    const invoiceId = await createInvoiceAndRecordPayment({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      paymentMethod: order.payment_method,
      razorpayPaymentId: payment?.[0]?.razorpay_payment_id ?? null,
      totalInr: order.total_inr,
      shippingFeeInr: order.shipping_fee_inr,
      discountInr: order.discount_inr,
      items: (items ?? []).map((i) => ({
        name: i.name_snapshot,
        variantLabel: i.variant_label_snapshot,
        unitPriceInr: i.unit_price_inr,
        quantity: i.quantity,
      })),
    });

    await supabase.from("orders").update({ zoho_invoice_id: invoiceId }).eq("id", orderId);
  } catch (err) {
    console.error(`Zoho Books sync failed for order ${orderId}:`, err instanceof Error ? err.message : err);
  }
}
