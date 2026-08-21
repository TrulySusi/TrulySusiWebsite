-- Courier/tracking details, added for the admin Orders section — nothing
-- in the schema tracked how a shipment actually went out before this.
alter table orders
  add column if not exists courier_name text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;

-- Manually-entered orders (WhatsApp/Instagram) sometimes get paid via a
-- Razorpay payment link (still 'razorpay') and sometimes via a direct bank
-- transfer/UPI the admin confirms by hand — 'manual' covers the latter.
-- 'cod' stays in the enum (harmless, just unused) since Postgres enum
-- values can't be cheaply dropped.
alter type payment_method add value if not exists 'manual';
