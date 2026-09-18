import type { InputHTMLAttributes, ReactNode } from "react";

export const MAIL_ICON = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
    <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
    <path d="m3 5.5 7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LOCK_ICON = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
    <rect x="4" y="9" width="12" height="8" rx="1.5" />
    <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" strokeLinecap="round" />
  </svg>
);

export function AuthInput({
  icon,
  error,
  className,
  ...props
}: { icon: ReactNode; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/35">{icon}</span>
        <input
          {...props}
          className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 font-body text-sm text-navy placeholder:text-navy/40 transition-shadow focus:outline-none focus:ring-2 ${
            error ? "border-brass focus:ring-brass/25" : "border-navy/15 focus:ring-navy/15"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 font-body text-xs text-brass">{error}</p>}
    </div>
  );
}
