/**
 * Thin strip above the header while website checkout is switched off, so a
 * first-time visitor understands we are open for business before they go
 * looking for a cart that isn't there. Sits above the sticky header, so it
 * scrolls away normally once read.
 *
 * Wording comes from `site_settings.ordering.notice` rather than from here —
 * it can be reworded without a deploy, and the whole strip disappears when
 * ordering is switched back on.
 */
export function OrderingNotice({ notice }: { notice: string | null }) {
  if (!notice) return null;
  return (
    <div className="bg-brass text-navy">
      <p className="mx-auto max-w-7xl px-6 py-2 text-center! font-body text-xs font-medium sm:px-10 sm:text-[13px]">
        {notice}
      </p>
    </div>
  );
}
