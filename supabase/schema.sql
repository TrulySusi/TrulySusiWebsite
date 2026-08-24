-- Truly Susi's — initial schema
-- Paste into the Supabase SQL editor (or run via `supabase db push`) once
-- the project exists. Matches Section 2 of truly-susi-website.md.
--
-- This file is the from-scratch baseline. Once a project has run it,
-- further changes ship as numbered files in migrations/ — this file's
-- table bodies are kept in sync with those so a fresh project only ever
-- needs this one file, but an existing project should run the migration
-- instead of re-running this whole script.

-- ---------- enums ----------
create type product_status as enum ('draft', 'active', 'archived');
create type order_channel as enum ('website', 'whatsapp', 'instagram');
create type order_status as enum ('pending_payment', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_method as enum ('razorpay', 'cod', 'manual');  -- 'manual' added in migrations/0007, for direct bank/UPI transfers on manually-entered orders
create type admin_role as enum ('owner', 'staff');

-- ---------- catalog ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references categories(id),
  name text not null,
  short_description text,
  description text,
  ingredients text,
  allergen_info text,
  shelf_life_days int,
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order int not null default 0,
  nutrition_per_100g jsonb,   -- lab panel, constant across box sizes; see migrations/0002
  serving_size_g int,         -- weight of one piece, e.g. 10
  created_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,                -- e.g. "250g box"
  weight_grams int not null,
  sku text unique not null,
  price_inr numeric(10,2) not null,
  compare_at_price_inr numeric(10,2),
  stock_qty int not null default 0,
  is_default boolean not null default false,
  is_active boolean not null default true
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,  -- see migrations/0006; null = shown for every variant
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  unique (product_id, storage_path)
);

-- ---------- customers ----------
create table customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  full_name text not null,       -- convenience display name, derived from first_name + last_name
  first_name text,
  last_name text,
  phone text not null,
  alternate_phone text,          -- see migrations/0004
  label text not null default 'Home',  -- Home / Work / Other, see migrations/0004
  line1 text not null,           -- house/flat/building no.
  line2 text,                    -- street/area/locality
  landmark text,                 -- see migrations/0004
  city text not null,
  state text not null,
  pincode text not null,
  notes text,                    -- delivery instructions, see migrations/0004
  is_default boolean not null default false
);

-- ---------- orders ----------
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,        -- e.g. TS-2026-000123
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  shipping_address jsonb not null,
  subtotal_inr numeric(10,2) not null,
  shipping_fee_inr numeric(10,2) not null default 0,
  discount_inr numeric(10,2) not null default 0,
  total_inr numeric(10,2) not null,
  payment_method payment_method not null default 'razorpay',
  order_channel order_channel not null default 'website',
  status order_status not null default 'pending_payment',
  payment_status payment_status not null default 'pending',
  razorpay_order_id text,
  gst_invoice_number text,
  zoho_deal_id text,
  courier_name text,             -- see migrations/0007
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  name_snapshot text not null,
  variant_label_snapshot text not null,
  unit_price_inr numeric(10,2) not null,
  quantity int not null,
  line_total_inr numeric(10,2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  razorpay_order_id text not null,
  razorpay_payment_id text unique not null,
  razorpay_signature text,
  amount_inr numeric(10,2) not null,
  status text not null,
  raw_payload jsonb,
  verified_at timestamptz
);

-- ---------- admin / ops ----------
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role admin_role not null default 'staff'
);

create table site_settings (
  key text primary key,
  value jsonb not null
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- see migrations/0005: open submission, moderated before showing publicly.
-- Not tied to a verified order yet — approve manually in Supabase Studio.
create table reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index on product_variants (product_id);
create index on product_images (product_id);
create index on product_images (variant_id);
create index on addresses (customer_id);
create index on orders (customer_id);
create index on orders (order_channel);
create index on orders (status);
create index on order_items (order_id);
create index on payments (order_id);

-- ---------- RLS ----------
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table admin_users enable row level security;
alter table site_settings enable row level security;
alter table contact_messages enable row level security;
alter table reviews enable row level security;

-- Public, read-only catalog access (anon + authenticated)
create policy "categories are publicly readable" on categories
  for select using (true);

create policy "active products are publicly readable" on products
  for select using (status = 'active');

create policy "variants of active products are publicly readable" on product_variants
  for select using (
    is_active and exists (
      select 1 from products p where p.id = product_variants.product_id and p.status = 'active'
    )
  );

create policy "images of active products are publicly readable" on product_images
  for select using (
    exists (
      select 1 from products p where p.id = product_images.product_id and p.status = 'active'
    )
  );

-- Customers/addresses: owner-only
create policy "customers manage their own row" on customers
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "customers manage their own addresses" on addresses
  for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

-- Reviews: anyone can submit one, but only as unapproved (can't self-publish);
-- only approved reviews are readable publicly. Approving/rejecting is done
-- directly in Supabase Studio (service role bypasses RLS), not from the app.
create policy "anyone can submit a review" on reviews
  for insert with check (approved = false);

create policy "approved reviews are publicly readable" on reviews
  for select using (approved = true);

-- orders/order_items/payments/admin_users/site_settings/contact_messages:
-- no public policies at all — every read/write goes through server-side
-- Route Handlers using the service-role key, or admin-authenticated queries.
-- (RLS enabled with zero policies = default-deny for anon/authenticated roles.)

-- ---------- functions ----------
-- see migrations/0008: atomic stock decrement after a payment is verified,
-- avoiding a read-then-write race under concurrent purchases.
create or replace function decrement_variant_stock(variant_id uuid, qty int)
returns void
language sql
as $$
  update product_variants
  set stock_qty = greatest(stock_qty - qty, 0)
  where id = variant_id;
$$;
