/**
 * The mandatory FSSAI vegetarian / non-vegetarian mark: a bordered square
 * with a filled circle inside — green for vegetarian, brown for
 * non-vegetarian. Required on every pre-packaged food listing under the FSS
 * (Labelling & Display) Regulations 2020, so it is deliberately a real
 * labelled graphic rather than a decorative icon.
 */
export function VegMark({
  isVegetarian,
  className = "h-5 w-5",
  withLabel = false,
}: {
  isVegetarian: boolean;
  className?: string;
  withLabel?: boolean;
}) {
  const colour = isVegetarian ? "#0A8F2C" : "#8B2E0F";
  const label = isVegetarian ? "Vegetarian" : "Non-vegetarian";

  const mark = (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label={label}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="none" stroke={colour} strokeWidth="2.5" />
      <circle cx="12" cy="12" r="5.5" fill={colour} />
    </svg>
  );

  if (!withLabel) return mark;

  return (
    <span className="inline-flex items-center gap-2">
      {mark}
      <span className="font-body text-xs font-semibold text-navy/70">{label}</span>
    </span>
  );
}
