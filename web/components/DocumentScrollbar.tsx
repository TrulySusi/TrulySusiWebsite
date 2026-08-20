"use client";

import { useEffect, useRef, useState } from "react";
import { OverlayScrollbars } from "overlayscrollbars";

// Spacing between marks in the cluster, and how many plain dashes trail
// below the Kuruvi icon.
const DASH_SPACING = 14.5;
const TRAIL_DASHES = 4;
const CLUSTER_HEIGHT = DASH_SPACING * TRAIL_DASHES + 16; // + the bird's own height

// Applies the overlay scrollbar site-wide (mounted once here in the root
// layout, so every route gets it) and draws a small cluster of dash marks
// with a Kuruvi icon at the top, hopping between discrete steps as you
// scroll — a small moving group, not a rail of dashes spanning the whole
// page. The real OverlayScrollbars handle stays functional (drag,
// click-track, keyboard) but is fully transparent in globals.css.
//
// Deliberately NOT auto-hiding: a persistent, visible bit of brand
// delight, not a subtle utility scrollbar that hides itself.
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
      const travel = Math.max(0, window.innerHeight - CLUSTER_HEIGHT);
      const dashCount = Math.max(1, Math.floor(travel / DASH_SPACING));
      const dashIndex = Math.round(pct * dashCount);

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
      className="pointer-events-none fixed right-1.5 top-0 z-60 transition-[top] duration-200"
      style={{ top, transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      {/* Remounting on hopKey change re-triggers the CSS hop animation */}
      <img
        key={hopKey}
        src="/brand/06_kuruvi.png"
        alt=""
        className="kuruvi-hop h-4 w-3.5 object-contain"
      />
      <div className="mt-1.5 flex flex-col items-center gap-[9px]">
        {Array.from({ length: TRAIL_DASHES }).map((_, i) => (
          <span key={i} className="h-[1.5px] w-2 rounded-full bg-brass/45" />
        ))}
      </div>
    </div>
  );
}
