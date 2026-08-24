import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const STATUS_LIST = [
  "pending_payment",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// "Today" is the business's local (India) calendar day, not the server's UTC day.
function istDayRange(now = new Date()) {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  const y = istNow.getUTCFullYear();
  const m = istNow.getUTCMonth();
  const d = istNow.getUTCDate();
  const startUtcMs = Date.UTC(y, m, d, 0, 0, 0) - IST_OFFSET_MS;
  return { start: new Date(startUtcMs), end: new Date(startUtcMs + 24 * 60 * 60 * 1000) };
}

const CARD_STYLES = {
  navy: { bg: "bg-navy/5", border: "border-navy/15", text: "text-navy" },
  brass: { bg: "bg-brass/10", border: "border-brass/25", text: "text-brass" },
  sage: { bg: "bg-sage/10", border: "border-sage/25", text: "text-sage" },
};

const STATUS_COLOR: Record<string, keyof typeof CARD_STYLES> = {
  pending_payment: "navy",
  paid: "sage",
  packed: "brass",
  shipped: "brass",
  delivered: "sage",
  cancelled: "navy",
  refunded: "navy",
};

function StatCard({ label, value, color }: { label: string; value: number; color: keyof typeof CARD_STYLES }) {
  const s = CARD_STYLES[color];
  return (
    <div className={`rounded-2xl border p-5 ${s.bg} ${s.border}`}>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</p>
      <p className={`mt-2 font-body text-3xl font-bold ${s.text}`}>{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [{ data: orders }, { data: lowStockVariants }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, customer_name, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("product_variants")
      .select("id, label, stock_qty, product_id, products ( id, name )")
      .eq("is_active", true)
      .lte("stock_qty", 5)
      .order("stock_qty", { ascending: true }),
  ]);

  const allOrders = orders ?? [];
  const { start, end } = istDayRange();
  const todaysOrders = allOrders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    return t >= start.getTime() && t < end.getTime();
  });

  const ordersToday = todaysOrders.length;
  const preparingToday = todaysOrders.filter((o) => o.status === "paid" || o.status === "packed").length;
  const completedToday = todaysOrders.filter((o) => o.status === "delivered").length;

  const statusCounts = Object.fromEntries(
    STATUS_LIST.map((s) => [s, allOrders.filter((o) => o.status === s).length]),
  );

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const stuckPayments = allOrders
    .filter((o) => o.status === "pending_payment" && now - new Date(o.created_at).getTime() > DAY_MS)
    .slice(0, 10);
  const awaitingPacking = allOrders
    .filter((o) => o.status === "paid" && now - new Date(o.created_at).getTime() > 2 * DAY_MS)
    .slice(0, 10);

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="Today and overall, at a glance" />
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <section>
            <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-navy/50">Today</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Orders placed" value={ordersToday} color="navy" />
              <StatCard label="Preparing" value={preparingToday} color="brass" />
              <StatCard label="Completed" value={completedToday} color="sage" />
            </div>
          </section>

          <section>
            <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-navy/50">Overall</h2>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total orders" value={allOrders.length} color="navy" />
              {STATUS_LIST.map((s) => (
                <StatCard key={s} label={STATUS_LABELS[s]} value={statusCounts[s]} color={STATUS_COLOR[s]} />
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-navy/10 bg-white p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/15 text-brass">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                    <path d="M10 2 18 17H2L10 2Z" strokeLinejoin="round" />
                    <path d="M10 8v4" strokeLinecap="round" />
                    <circle cx="10" cy="14.5" r="0.75" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <h2 className="font-body text-lg font-semibold text-navy">Needs attention</h2>
              </div>
              {stuckPayments.length === 0 && awaitingPacking.length === 0 ? (
                <p className="mt-3 font-body text-sm text-navy/50">Nothing waiting — all caught up.</p>
              ) : (
                <div className="mt-4 space-y-5">
                  {stuckPayments.length > 0 && (
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-wide text-brass">
                        Pending payment &gt; 24h
                      </p>
                      <ul className="mt-2 divide-y divide-navy/6">
                        {stuckPayments.map((o) => (
                          <li key={o.id} className="flex items-center justify-between py-2">
                            <Link
                              href={`/admin/orders/${o.id}`}
                              className="font-body text-sm font-semibold text-navy hover:text-brass"
                            >
                              {o.order_number}
                            </Link>
                            <span className="font-body text-xs text-navy/50">{o.customer_name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {awaitingPacking.length > 0 && (
                    <div>
                      <p className="font-body text-xs font-semibold uppercase tracking-wide text-brass">
                        Paid, not packed &gt; 48h
                      </p>
                      <ul className="mt-2 divide-y divide-navy/6">
                        {awaitingPacking.map((o) => (
                          <li key={o.id} className="flex items-center justify-between py-2">
                            <Link
                              href={`/admin/orders/${o.id}`}
                              className="font-body text-sm font-semibold text-navy hover:text-brass"
                            >
                              {o.order_number}
                            </Link>
                            <span className="font-body text-xs text-navy/50">{o.customer_name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-navy/10 bg-white p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/20 text-sage">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                    <path d="M4 8h12l-1 9H5L4 8Z" strokeLinejoin="round" />
                    <path d="M6.5 8V6a3.5 3.5 0 0 1 7 0v2" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-body text-lg font-semibold text-navy">Low stock</h2>
              </div>
              {!lowStockVariants || lowStockVariants.length === 0 ? (
                <p className="mt-3 font-body text-sm text-navy/50">Nothing running low.</p>
              ) : (
                <ul className="mt-4 divide-y divide-navy/6">
                  {lowStockVariants.map((v) => {
                    const product = v.products as unknown as { id: string; name: string } | { id: string; name: string }[] | null;
                    const p = Array.isArray(product) ? product[0] : product;
                    return (
                      <li key={v.id} className="flex items-center justify-between py-2">
                        <Link
                          href={p ? `/admin/products/${p.id}` : "/admin/products"}
                          className="font-body text-sm font-semibold text-navy hover:text-brass"
                        >
                          {p?.name ?? "—"} <span className="font-normal text-navy/50">({v.label})</span>
                        </Link>
                        <span className="font-body text-xs font-semibold text-brass">{v.stock_qty} left</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
