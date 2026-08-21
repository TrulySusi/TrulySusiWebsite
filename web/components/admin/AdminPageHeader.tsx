import Link from "next/link";

export function AdminPageHeader({
  title,
  subtitle,
  action,
  backHref,
  backLabel = "Back",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="border-b border-navy/10 bg-navy px-8 py-6">
      {backHref && (
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 font-body text-xs font-semibold text-cream/60 hover:text-cream"
        >
          ← {backLabel}
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-cream">{title}</h1>
          {subtitle && <p className="mt-1 font-body text-sm text-cream/60">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
