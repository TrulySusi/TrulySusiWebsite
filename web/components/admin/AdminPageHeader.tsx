import Image from "next/image";

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
    <div className="relative overflow-hidden border-b border-navy/10 bg-navy">
      <div className="absolute inset-0">
        <Image src="/brand/05_sweet_making.png" alt="" fill sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-navy/88" />
      </div>
      <div className="relative flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <div className="min-w-0">
          <h1 className="truncate font-body text-2xl font-semibold text-cream sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 font-body text-sm text-cream/60">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
