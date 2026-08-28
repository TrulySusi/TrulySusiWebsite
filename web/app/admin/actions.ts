"use server";

import { getAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminNotificationsWithUnseenCount, type AdminNotification } from "@/lib/admin-notifications";

export async function fetchAdminNotifications(): Promise<{
  notifications: AdminNotification[];
  unseenCount: number;
}> {
  const { admin } = await getAdminSession();
  if (!admin) return { notifications: [], unseenCount: 0 };

  return getAdminNotificationsWithUnseenCount(admin.id, 30);
}

export async function markNotificationsSeen(): Promise<void> {
  const { admin } = await getAdminSession();
  if (!admin) return;

  const supabase = createAdminClient();
  await supabase
    .from("admin_users")
    .update({ notifications_seen_at: new Date().toISOString() })
    .eq("id", admin.id);
}
