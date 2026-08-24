-- Atomic stock decrement, called once per order_item after a payment is
-- verified. A plain read-then-write from application code would race under
-- concurrent purchases of the same variant; this does it in one statement.
create or replace function decrement_variant_stock(variant_id uuid, qty int)
returns void
language sql
as $$
  update product_variants
  set stock_qty = greatest(stock_qty - qty, 0)
  where id = variant_id;
$$;
