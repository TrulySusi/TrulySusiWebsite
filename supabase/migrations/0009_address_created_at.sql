-- The checkout page's saved-address loader has always ordered by
-- created_at, but the column never actually existed on this table —
-- meaning that query has been erroring out (silently, since its result
-- was never checked) and no saved address has ever successfully loaded.
alter table addresses
  add column if not exists created_at timestamptz not null default now();
