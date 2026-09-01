"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchAdminNotifications, markNotificationsSeen } from "@/app/admin/actions";
import type { AdminNotification, NotificationSeverity } from "@/lib/admin-notifications";
import { formatRelativeTime } from "@/lib/format-relative-time";

const SEVERITY_STYLES: Record<NotificationSeverity, { dot: string }> = {
  green: { dot: "bg-sage" },
  yellow: { dot: "bg-amber-500" },
  red: { dot: "bg-red-500" },
};

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  async function load() {
    const result = await fetchAdminNotifications();
    setNotifications(result.notifications);
    setUnseenCount(result.unseenCount);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && unseenCount > 0) {
      setUnseenCount(0);
      await markNotificationsSeen();
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
          <path d="M5 8a5 5 0 0 1 10 0c0 3.5 1.2 4.8 1.2 4.8H3.8S5 11.5 5 8Z" strokeLinejoin="round" />
          <path d="M8.3 15.5a1.8 1.8 0 0 0 3.4 0" strokeLinecap="round" />
        </svg>
        {unseenCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brass px-1 font-body text-[10px] font-bold text-navy">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-navy/10 bg-white shadow-lg">
          <div className="border-b border-navy/10 px-4 py-3">
            <p className="font-body text-sm font-semibold text-navy">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center font-body text-sm text-navy/50">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-navy/6">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/admin/orders/${n.orderId}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-cream/60"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_STYLES[n.severity].dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-body text-sm text-navy">{n.message}</span>
                      <span className="mt-0.5 block font-body text-xs text-navy/50">
                        {n.orderNumber} &middot; {formatRelativeTime(n.at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
