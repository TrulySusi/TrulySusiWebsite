-- Tracks which customer-facing emails have already gone out for an order,
-- so a retried callback (payment verification firing twice, an admin
-- re-saving the same fulfillment status) can't send a duplicate — same
-- idempotency pattern as zoho_invoice_id.
alter table orders
  add column if not exists order_confirmation_email_sent_at timestamptz,
  add column if not exists shipping_email_sent_at timestamptz,
  add column if not exists cancellation_email_sent_at timestamptz,
  add column if not exists refund_email_sent_at timestamptz;
