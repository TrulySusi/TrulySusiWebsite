"use client";

import { useEffect, useRef, useState } from "react";

const CARD_STYLES = {
  navy: { bg: "bg-navy/5", border: "border-navy/15", text: "text-navy", shadow: "shadow-navy/10", iconBg: "bg-navy/10" },
  brass: { bg: "bg-brass/10", border: "border-brass/25", text: "text-brass", shadow: "shadow-brass/15", iconBg: "bg-brass/20" },
  sage: { bg: "bg-sage/10", border: "border-sage/25", text: "text-sage", shadow: "shadow-sage/15", iconBg: "bg-sage/20" },
} as const;

export type KpiColor = keyof typeof CARD_STYLES;

/** Counts up from 0 to the target once, on mount — skips straight to the value for prefers-reduced-motion. */
function useCountUp(target: number, decimals: number, durationMs = 700) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame: number;
    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const progress = Math.min(1, (now - startRef.current) / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(eased * target);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value.toFixed(decimals);
}

export function KpiCard({
  label,
  value,
  color,
  icon,
  decimals = 0,
}: {
  label: string;
  value: number;
  color: KpiColor;
  icon: React.ReactNode;
  /** e.g. 1 for an average rating like "4.2". */
  decimals?: number;
}) {
  const s = CARD_STYLES[color];
  const animated = useCountUp(value, decimals);

  return (
    <div
      className={`group rounded-3xl border p-5 shadow-lg transition-transform duration-300 ease-out hover:-translate-y-0.5 ${s.bg} ${s.border} ${s.shadow}`}
    >
      <div className="flex items-center justify-between">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</p>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${s.iconBg} ${s.text}`}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            {icon}
          </svg>
        </div>
      </div>
      <p className={`mt-2 font-body text-3xl font-bold tabular-nums ${s.text}`}>{animated}</p>
    </div>
  );
}
