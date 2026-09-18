"use client";

import { useEffect, useState } from "react";

/**
 * Types text out character by character, then leaves a blinking cursor.
 * The full text is always in the DOM via aria-label on the wrapping
 * element (see usage) — this span itself is aria-hidden, so screen
 * readers get the real text immediately instead of narrating letters
 * one at a time. Skips straight to the full text for
 * prefers-reduced-motion.
 */
export function TypewriterText({
  text,
  className,
  speedMs = 65,
  startDelayMs = 300,
}: {
  text: string;
  className?: string;
  speedMs?: number;
  startDelayMs?: number;
}) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      setDone(true);
      return;
    }
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speedMs);
    }, startDelayMs);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs]);

  return (
    <span className={className} aria-hidden="true">
      {shown}
      <span
        className={`ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] bg-current align-middle ${done ? "animate-caret-blink" : "opacity-100"}`}
      />
    </span>
  );
}
