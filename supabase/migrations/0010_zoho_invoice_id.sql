-- Tracks whether an order has already been synced to Zoho Books, so a
-- retried sync (or the payment-verification callback firing twice) can't
-- create a duplicate invoice for the same order.
alter table orders
  add column if not exists zoho_invoice_id text;
