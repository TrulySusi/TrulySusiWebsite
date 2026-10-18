-- FSSAI (Labelling & Display) Regulations 2020 / E-commerce Guidelines Order
-- 19.03.2021: product listings must declare veg/non-veg status and any
-- additives. Client confirmed (2026-10-18) every current product is
-- vegetarian and contains no additives, hence the default of true.
alter table products add column if not exists is_vegetarian boolean not null default true;
alter table products add column if not exists additives text;

comment on column products.is_vegetarian is
  'Drives the mandatory green/brown FSSAI veg mark on the listing.';
comment on column products.additives is
  'Mandatory additives declaration shown on the listing. Holds the explicit
   "no additives" wording when none are used - never left to a code default,
   so the claim is always data the client has confirmed.';
