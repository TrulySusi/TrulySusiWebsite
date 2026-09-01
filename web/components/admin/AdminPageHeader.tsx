import Image from "next/image";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative border-b border-navy/10 bg-navy">
      {/* overflow-hidden lives on this inner wrapper, not the outer
          header — the header also holds the notification dropdown,
          which needs to be able to extend past the header's own edges. */}
      <div className="absolute inset-0 overflow-hidden">
        <Image src="/brand/05_sweet_making.png" alt="" fill sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-navy/88" />
      </div>
      <div className="relative flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4">
        <div className="min-w-0">
          <h1 className="truncate font-body text-xl font-semibold text-cream sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 font-body text-sm text-cream/60">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {action}
          <AdminNotificationBell />
        </div>
      </div>
    </div>
  );
}
