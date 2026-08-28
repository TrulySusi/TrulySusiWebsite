-- Powers the admin notification bell + dashboard activity feed.
-- paid_at matches the existing shipped_at/delivered_at pattern (orders
-- table) so "new order" events have an accurate timestamp instead of
-- reusing created_at, which fires even for abandoned pending_payment
-- checkouts that never actually paid.
alter table orders add column if not exists paid_at timestamptz;

-- Per-admin "last checked notifications" marker, used to compute each
-- admin's own unread count for the bell badge.
alter table admin_users add column if not exists notifications_seen_at timestamptz;
