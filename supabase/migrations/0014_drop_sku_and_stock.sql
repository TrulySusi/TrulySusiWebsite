-- SKU and stock_qty were never actually used for anything: no inventory
-- system reads or decrements stock_qty (decrement_variant_stock, added in
-- migration 0008, was never called from application code), and the
-- required, unique sku field was actively blocking admins from adding new
-- variants (a blank or reused SKU hits "sku text unique not null"). Both
-- removed at the client's request.
alter table product_variants drop column if exists sku;
alter table product_variants drop column if exists stock_qty;

drop function if exists decrement_variant_stock(uuid, int);

-- Replaces the old sku-based upsert key so scripts/seed-catalog.mjs (and
-- any future reseed) still has a stable conflict target: two variants of
-- the same product shouldn't share a pack size anyway.
alter table product_variants add constraint product_variants_product_weight_unique unique (product_id, weight_grams);
