-- Lets the seed script upsert product_images idempotently instead of
-- duplicating a row every re-run.
alter table product_images
  add constraint product_images_product_path_uniq unique (product_id, storage_path);
