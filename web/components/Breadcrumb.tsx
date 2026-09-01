import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

// Always starts from Home; pass the rest of the trail. The last item
// renders as plain (darker) text, not a link, since it's the current page.
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-body text-xs font-medium text-navy/50">
      <Link href="/" className="transition-colors hover:text-brass">
        Home
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label}>
            <span className="mx-1.5">/</span>
            {item.href && !isLast ? (
              <Link href={item.href} className="transition-colors hover:text-brass">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-navy/70" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
