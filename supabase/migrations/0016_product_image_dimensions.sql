-- Real photos vary in aspect ratio (checked: landscape 1536x1024, portrait
-- 768x1024, 1080x1920, etc.) — the zoom feature (migration 0015) originally
-- assumed every photo was 9:16, which broke badly for anything else (a
-- wrong assumed scale can crop into a blank/plain part of the photo).
-- Storing the real pixel size lets photoZoomStyle() compute the correct
-- "fills the frame" scale per photo instead of guessing.
alter table product_images add column if not exists width int;
alter table product_images add column if not exists height int;
