-- Customer reviews: open submission (not tied to a verified order yet),
-- moderated before showing publicly. Approve/reject rows directly in
-- Supabase Studio's table editor by flipping `approved` — no admin UI
-- for this yet.
create table reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

-- Anyone can submit a review, but only as unapproved — a client can't
-- self-publish by inserting approved = true.
create policy "anyone can submit a review" on reviews
  for insert with check (approved = false);

create policy "approved reviews are publicly readable" on reviews
  for select using (approved = true);
