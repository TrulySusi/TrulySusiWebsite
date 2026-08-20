"use client";

import { useEffect, useRef, useState } from "react";
import { OverlayScrollbars } from "overlayscrollbars";

// Matches the dash spacing baked into the .os-scrollbar-track background
// pattern in globals.css — keep these in sync.
const DASH_SPACING = 14.5;

// Applies the overlay scrollbar site-wide (mounted once here in the root
// layout, so every route gets it) and layers a small Kuruvi icon on top
// that hops from dash to dash as you scroll, instead of gliding smoothly
// like a normal thumb. The real OverlayScrollbars handle stays functional
// (drag, click-track, keyboard) but is made fully transparent in
// globals.css — Kuruvi is the only thing you see move.
//
// Deliberately NOT auto-hiding: this is meant to be a persistent, visible
// bit of brand delight, not a subtle utility scrollbar that hides itself.
export function DocumentScrollbar() {
  const [top, setTop] = useState(0);
  const [hopKey, setHopKey] = useState(0);
  const lastDash = useRef(-1);

  useEffect(() => {
    const instance = OverlayScrollbars(document.body, {
      scrollbars: {
        theme: "os-theme-light os-theme-truly-susi",
        autoHide: "never",
      },
    });

    function updatePosition() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
      const dashCount = Math.max(1, Math.floor(window.innerHeight / DASH_SPACING));
      const dashIndex = Math.round(pct * (dashCount - 1));

      if (dashIndex !== lastDash.current) {
        lastDash.current = dashIndex;
        setHopKey((k) => k + 1);
      }
      setTop(dashIndex * DASH_SPACING);
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    return () => {
      instance.destroy();
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 z-60 h-4 w-3.5 transition-[top] duration-200"
      style={{ top, transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      {/* Remounting on hopKey change re-triggers the CSS hop animation */}
      <img
        key={hopKey}
        src="/brand/06_kuruvi.png"
        alt=""
        className="kuruvi-hop h-4 w-3.5 object-contain"
      />
    </div>
  );
}
