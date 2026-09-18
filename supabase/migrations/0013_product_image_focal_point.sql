-- Product photos are portrait (phone/camera shots) but every display slot
-- on the site is a square crop (object-fit: cover), so the top or bottom
-- of a photo can get cut off with no way to control it. focal_y lets an
-- admin pick which part of the photo stays visible: 0 = anchor to the top
-- of the photo, 50 = centered (previous, unadjustable default), 100 =
-- anchor to the bottom. Only vertical, since these crops are always at
-- least as wide as the source image, so no horizontal cropping happens.
alter table product_images add column if not exists focal_y smallint not null default 50
  check (focal_y between 0 and 100);
