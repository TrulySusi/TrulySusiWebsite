-- Lets a product image be tied to one specific variant (e.g. a photo of
-- the actual 250g box showing its piece count) instead of always being
-- shared across every pack size. Nullable — existing/general images
-- (lifestyle shots, ingredient close-ups) keep variant_id null and show
-- regardless of which variant is selected.
alter table product_images
  add column if not exists variant_id uuid references product_variants(id) on delete cascade;

create index if not exists product_images_variant_id_idx on product_images (variant_id);
