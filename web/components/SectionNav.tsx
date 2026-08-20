"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Section = { label: string; el: HTMLElement };

const GAP = 26;

// Discovers every [data-nav-section="Label"] element on the current page
// and renders a small fixed step-index for them on the right edge: click
// a step to jump there, hover to see its name. The step for whichever
// section is currently in view shows the Kuruvi icon instead of a plain
// dash, and re-plays its hop animation whenever the active step changes.
//
// Pages with fewer than two tagged sections render nothing — this is
// meant for pages built as a sequence of named sections (currently just
// the home page), not a universal scroll indicator.
export function SectionNav() {
  const pathname = usePathname();
  const [sections, setSections] = useState<Section[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hopKey, setHopKey] = useState(0);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-section]"),
    );
    setSections(els.map((el) => ({ label: el.dataset.navSection ?? "", el })));
    setActiveIndex(0);
  }, [pathname]);

  useEffect(() => {
    if (sections.length === 0) return;

    function updateActive() {
      const threshold = window.scrollY + window.innerHeight * 0.3;
      let idx = 0;
      sections.forEach((s, i) => {
        const top = s.el.getBoundingClientRect().top + window.scrollY;
        if (top <= threshold) idx = i;
      });
      setActiveIndex((prev) => {
        if (prev !== idx) setHopKey((k) => k + 1);
        return idx;
      });
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sections]);

  if (sections.length < 2) return null;

  const totalHeight = (sections.length - 1) * GAP;

  return (
    <div
      className="fixed right-2.5 top-1/2 z-60 -translate-y-1/2"
      style={{ height: totalHeight }}
    >
      {sections.map((s, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={s.label}
            type="button"
            onClick={() => s.el.scrollIntoView({ behavior: "smooth", block: "start" })}
            aria-label={`Go to ${s.label}`}
            className="group absolute right-0 flex -translate-y-1/2 items-center justify-end py-2"
            style={{ top: i * GAP }}
          >
            <span className="pointer-events-none mr-2.5 whitespace-nowrap rounded-md bg-navy px-2 py-1 font-body text-[11px] font-medium text-cream opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
              {s.label}
            </span>
            {isActive ? (
              <img
                key={hopKey}
                src="/brand/06_kuruvi.png"
                alt=""
                className="kuruvi-hop h-4 w-3.5 object-contain"
              />
            ) : (
              <span className="block h-[1.5px] w-2.5 rounded-full bg-brass/40 transition-colors group-hover:bg-brass/70" />
            )}
          </button>
        );
      })}
    </div>
  );
}
