-- Companion to focal_y (migration 0013): lets an admin control how much of
-- a photo is visible in its square frame, not just which part. 0 = whole
-- photo visible (letterboxed), 100 = today's default fill (matches how
-- every photo looks right now, so nothing changes until adjusted), 200 =
-- zoomed in tight. See lib/catalog-shared.ts (photoZoomStyle) for the math.
alter table product_images add column if not exists zoom smallint not null default 100
  check (zoom between 0 and 200);
