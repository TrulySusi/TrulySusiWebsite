import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Reads the highest order_number that has ever existed for this year, not
// a row count — count-based generation breaks permanently the moment any
// order is ever deleted (admin's "delete order" button, cleanup of a
// mistaken entry, etc.): count drops, but the deleted row's number was
// already used, so count+1 can land on a number some *other*, still-
// existing order already has. Zero-padded to a fixed width, so the
// six-digit sequence sorts identically as a string or a number.
async function highestOrderNumber(
  supabase: ReturnType<typeof createAdminClient>,
  yearPrefix: string,
): Promise<number> {
  const { data } = await supabase
    .from("orders")
    .select("order_number")
    .like("order_number", `${yearPrefix}-%`)
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return 0;
  return Number(data.order_number.slice(yearPrefix.length + 1)) || 0;
}

async function generateOrderNumber(supabase: ReturnType<typeof createAdminClient>) {
  const yearPrefix = `TS-${new Date().getFullYear()}`;
  const next = (await highestOrderNumber(supabase, yearPrefix)) + 1;
  return `${yearPrefix}-${String(next).padStart(6, "0")}`;
}

const MAX_ATTEMPTS = 5;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Two order inserts landing close together (a double-click on "Pay now",
// two checkouts finishing near-simultaneously) can both read the same
// "next" number and race for it, hitting the orders_order_number_key
// unique constraint. Retrying with a freshly recomputed number resolves
// it once one side has actually succeeded and moved the highest number
// forward; a small random delay before each retry keeps two calls that
// started at the same instant from staying in lockstep. Any other error
// (or the constraint still colliding after several tries) is thrown
// immediately, not retried.
export async function insertOrderWithUniqueNumber<T>(
  supabase: ReturnType<typeof createAdminClient>,
  buildRow: (orderNumber: string) => Record<string, unknown>,
  select = "id",
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(50 + Math.random() * 150);

    const orderNumber = await generateOrderNumber(supabase);
    const { data, error } = await supabase
      .from("orders")
      .insert(buildRow(orderNumber))
      .select(select)
      .single();

    if (!error) return data as T;

    const isOrderNumberCollision = error.code === "23505" && error.message.includes("orders_order_number_key");
    if (!isOrderNumberCollision || attempt === MAX_ATTEMPTS) throw new Error(error.message);
  }
  throw new Error("Couldn't generate a unique order number after several attempts.");
}
