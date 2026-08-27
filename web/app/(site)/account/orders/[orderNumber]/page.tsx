import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { getMyOrderDetail } from "../actions";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { placeholderImageUrl } from "@/lib/catalog-shared";

export default async function MyOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await getCustomerSession();

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center sm:px-10">
        <h1 className="font-display text-4xl text-navy">Order details</h1>
        <p className="mt-3 font-body text-sm text-navy/60">Please sign in to see this order.</p>
        <Link
          href="/checkout"
          className="mt-6 inline-block rounded-full bg-navy px-7 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const order = await getMyOrderDetail(orderNumber);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-24 sm:px-10">
      <Link href="/account/orders" className="font-body text-sm text-navy/50 hover:text-navy">
        ← My orders
      </Link>

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-6">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy/50">Order</p>
          <p className="mt-1 font-body text-lg font-bold text-navy">{order.orderNumber}</p>
          <p className="mt-1 font-body text-xs text-navy/50">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <div className="mt-6">
            <OrderStatusStepper status={order.status} />
          </div>

          {(order.courierName || order.trackingNumber) && (
            <div className="mt-6 rounded-lg bg-cream px-4 py-3 font-body text-sm text-navy">
              {order.courierName && (
                <p>
                  <span className="text-navy/50">Courier: </span>
                  {order.courierName}
                </p>
              )}
              {order.trackingNumber && (
                <p className="mt-1">
                  <span className="text-navy/50">Tracking number: </span>
                  {order.trackingNumber}
                </p>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-semibold text-brass hover:text-navy"
                >
                  Track shipment →
                </a>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6">
          <h2 className="font-body text-lg font-semibold text-navy">Items</h2>
          <ul className="mt-4 divide-y divide-navy/10">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <Image
                    src={item.imageUrl ?? placeholderImageUrl(item.name)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate font-body text-sm font-medium text-navy">{item.name}</p>
                  <p className="font-body text-xs text-navy/50">
                    {item.variantLabel} &middot; Qty {item.quantity}
                  </p>
                </div>
                <span className="font-body text-sm font-bold text-navy">₹{item.lineTotalInr.toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-navy/10 pt-4 font-body text-sm font-bold text-navy">
            <span>Total</span>
            <span>₹{order.totalInr.toFixed(0)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6">
          <h2 className="font-body text-lg font-semibold text-navy">Delivering to</h2>
          <p className="mt-2 text-left font-body text-sm text-navy/70">
            {order.deliveryAddress.line1}
            {order.deliveryAddress.line2 && <>, {order.deliveryAddress.line2}</>}
            {order.deliveryAddress.landmark && <>, near {order.deliveryAddress.landmark}</>}
            <br />
            {order.deliveryAddress.city}, {order.deliveryAddress.state} &mdash; {order.deliveryAddress.pincode}
          </p>
        </div>
      </div>
    </main>
  );
}
