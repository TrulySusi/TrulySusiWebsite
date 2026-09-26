-- Signup now collects first/last name so the site can greet a customer by
-- name instead of falling back to their email's local part or waiting until
-- they've saved a delivery address.
alter table customers add column if not exists first_name text;
alter table customers add column if not exists last_name text;
