// Shared icon set — kept in one place so edit/delete affordances look
// identical everywhere they appear (site + admin), rather than each screen
// hand-rolling its own slightly different SVG.

export function EditIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        d="M13.5 3.5 16.5 6.5 7 16H4v-3L13.5 3.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 6h12" strokeLinecap="round" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 6.5 6 16a1.5 1.5 0 0 0 1.5 1.4h5a1.5 1.5 0 0 0 1.5-1.4l.5-9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.3 9.5v4.5M11.7 9.5v4.5" strokeLinecap="round" />
    </svg>
  );
}
