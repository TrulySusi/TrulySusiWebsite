import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-session";
import { listMyOrders } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Payment pending",
  paid: "Preparing",
  packed: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function statusClass(status: string) {
  if (status === "cancelled" || status === "refunded") return "bg-brass/10 text-brass";
  if (status === "delivered") return "bg-sage/20 text-sage";
  return "bg-navy/6 text-navy/70";
}

export default async function MyOrdersPage() {
  const session = await getCustomerSession();

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center sm:px-10">
        <h1 className="font-display text-4xl text-navy">My orders</h1>
        <p className="mt-3 font-body text-sm text-navy/60">
          Please sign in to see your order history.
        </p>
        <Link
          href="/checkout"
          className="mt-6 inline-block rounded-full bg-navy px-7 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const orders = await listMyOrders();

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 sm:px-10">
      <h1 className="text-center font-display text-4xl text-navy">My orders</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-center font-body text-sm text-navy/60">
          You haven&rsquo;t placed any orders yet.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.orderNumber}
              href={`/account/orders/${order.orderNumber}`}
              className="flex items-center justify-between rounded-2xl border border-navy/10 bg-white p-5 transition-colors hover:border-navy/20"
            >
              <div>
                <p className="font-body text-sm font-bold text-navy">{order.orderNumber}</p>
                <p className="mt-1 font-body text-xs text-navy/50">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  &middot; {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${statusClass(order.status)}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <span className="font-body text-sm font-bold text-navy">₹{order.totalInr.toFixed(0)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
