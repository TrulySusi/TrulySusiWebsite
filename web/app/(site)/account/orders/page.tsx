import Link from "next/link";
import Image from "next/image";
import { getCustomerSession } from "@/lib/customer-session";
import { listMyOrders } from "./actions";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { placeholderImageUrl } from "@/lib/catalog-shared";

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
          href="/account/login?redirect=%2Faccount%2Forders"
          className="mt-6 inline-block rounded-full bg-navy px-7 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const orders = await listMyOrders();

  return (
    <main className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
      <h1 className="text-center font-display text-4xl text-navy">My orders</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-center font-body text-sm text-navy/60">
          You haven&rsquo;t placed any orders yet.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.orderNumber} className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-body text-lg font-bold text-navy">{order.orderNumber}</p>
                <p className="font-body text-xs text-navy/50">
                  Placed{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
                <div>
                  <ul className="divide-y divide-navy/10">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-4 py-3 first:pt-0">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                          <Image
                            src={item.imageUrl ?? placeholderImageUrl(item.name)}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-sm font-medium text-navy">{item.name}</p>
                          <p className="font-body text-xs text-navy/50">
                            {item.variantLabel} &middot; Qty {item.quantity}
                          </p>
                        </div>
                        <span className="font-body text-sm font-bold text-navy">
                          ₹{item.lineTotalInr.toFixed(0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between border-t border-navy/10 pt-4 font-body text-sm font-bold text-navy">
                    <span>Total</span>
                    <span>₹{order.totalInr.toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 lg:border-l lg:border-navy/10 lg:pl-8">
                  <OrderStatusStepper status={order.status} />

                  {(order.courierName || order.trackingNumber) && (
                    <div className="rounded-lg bg-cream px-4 py-3 font-body text-sm text-navy">
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

                  <div>
                    <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy/50">
                      Deliver to
                    </p>
                    <p className="mt-2 font-body text-sm text-navy/70">
                      {order.customerName} &middot; {order.customerPhone}
                      <br />
                      {order.deliveryAddress.line1}
                      {order.deliveryAddress.line2 && <>, {order.deliveryAddress.line2}</>}
                      {order.deliveryAddress.landmark && <>, near {order.deliveryAddress.landmark}</>}
                      <br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state},{" "}
                      {order.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
