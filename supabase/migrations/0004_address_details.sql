-- Expands addresses for a proper Indian delivery form: split name,
-- alternate contact number, landmark, a Home/Work/Other label, and
-- delivery instructions. full_name/phone stay in place (still written
-- as a convenience "display name" derived from first+last) rather than
-- being dropped, since nothing depends on removing them.
alter table addresses
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists alternate_phone text,
  add column if not exists landmark text,
  add column if not exists label text not null default 'Home',
  add column if not exists notes text;
