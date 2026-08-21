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
    <div className="flex items-center justify-between border-b border-navy/10 bg-navy px-8 py-6">
      <div>
        <h1 className="font-display text-3xl text-cream">{title}</h1>
        {subtitle && <p className="mt-1 font-body text-sm text-cream/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
