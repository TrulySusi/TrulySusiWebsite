import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationSeverity = "green" | "yellow" | "red";

export type AdminNotification = {
  id: string;
  type: "paid" | "shipped" | "delivered" | "stuck_payment" | "awaiting_packing";
  severity: NotificationSeverity;
  orderId: string;
  orderNumber: string;
  customerName: string;
  message: string;
  at: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_WINDOW = 200;

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
};

// Derived entirely from existing order timestamps/status — no separate
// notifications table to keep in sync. "Positive" lifecycle events (an
// order got paid, shipped, or delivered) are green; the two "needs
// attention" situations already tracked on the dashboard become yellow
// (pending payment too long — concerning but still recoverable) and red
// (paid but not packed too long — money's in hand, customer's waiting,
// most urgent).
function buildNotifications(orders: OrderRow[]): AdminNotification[] {
  const now = Date.now();
  const events: AdminNotification[] = [];

  for (const o of orders) {
    if (o.paid_at) {
      events.push({
        id: `${o.id}-paid`,
        type: "paid",
        severity: "green",
        orderId: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        message: `New order from ${o.customer_name}`,
        at: o.paid_at,
      });
    }
    if (o.shipped_at) {
      events.push({
        id: `${o.id}-shipped`,
        type: "shipped",
        severity: "green",
        orderId: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        message: `Shipped to ${o.customer_name}`,
        at: o.shipped_at,
      });
    }
    if (o.delivered_at) {
      events.push({
        id: `${o.id}-delivered`,
        type: "delivered",
        severity: "green",
        orderId: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        message: `Delivered to ${o.customer_name}`,
        at: o.delivered_at,
      });
    }
    if (o.status === "pending_payment" && now - new Date(o.created_at).getTime() > DAY_MS) {
      events.push({
        id: `${o.id}-stuck_payment`,
        type: "stuck_payment",
        severity: "yellow",
        orderId: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        message: `Still awaiting payment`,
        at: o.created_at,
      });
    }
    if (o.status === "paid" && o.paid_at && now - new Date(o.paid_at).getTime() > 2 * DAY_MS) {
      events.push({
        id: `${o.id}-awaiting_packing`,
        type: "awaiting_packing",
        severity: "red",
        orderId: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        message: `Paid but not packed yet`,
        at: o.paid_at,
      });
    }
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return events;
}

async function fetchRecentEvents(): Promise<AdminNotification[]> {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, status, created_at, paid_at, shipped_at, delivered_at")
    .order("created_at", { ascending: false })
    .limit(RECENT_WINDOW);

  return buildNotifications(orders ?? []);
}

export async function getAdminNotifications(limit = 30): Promise<AdminNotification[]> {
  return (await fetchRecentEvents()).slice(0, limit);
}

// Fetches the order data once and derives both the notification list and
// the unseen count from it, instead of querying twice for the same
// recent-orders window (this is polled every 60s by the bell, so the
// duplicate query wasn't just wasted work — it doubled on every poll).
export async function getAdminNotificationsWithUnseenCount(
  adminId: string,
  limit = 30,
): Promise<{ notifications: AdminNotification[]; unseenCount: number }> {
  const supabase = createAdminClient();
  const [{ data: admin }, events] = await Promise.all([
    supabase.from("admin_users").select("notifications_seen_at").eq("id", adminId).maybeSingle(),
    fetchRecentEvents(),
  ]);
  const seenAtMs = admin?.notifications_seen_at ? new Date(admin.notifications_seen_at).getTime() : 0;

  return {
    notifications: events.slice(0, limit),
    unseenCount: events.filter((e) => new Date(e.at).getTime() > seenAtMs).length,
  };
}
