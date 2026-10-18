"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Vertical placement for the two floating side tabs. The cart sits a fixed
 * distance below reviews, so the offset lives here rather than being repeated
 * as a magic number in each component.
 */
export const REVIEWS_TAB_TOP = "top-[48%]";
export const CART_TAB_TOP = "top-[calc(48%+130px)]";

/** The id the homepage hero carries so the tabs know what to clear. */
export const HERO_ID = "site-hero";

/**
 * True once the hero banner no longer covers where the floating tabs sit, so
 * they can stay out of the way of the homepage's opening image and fade in
 * afterwards. Pages with no hero (shop, cart, policies…) report true
 * immediately — there's nothing to clear.
 *
 * The negative top rootMargin shrinks the observed area to the lower half of
 * the viewport, which is roughly where the tabs are pinned, so they appear
 * exactly when the hero's bottom edge passes them rather than only once the
 * hero has fully scrolled away.
 */
export function useScrolledPastHero() {
  const pathname = usePathname();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(HERO_ID);
    if (!hero) {
      setPast(true);
      return;
    }

    setPast(false);
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-50% 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
    // Re-checked per route: the tabs live in the shared (site) layout, so a
    // client-side navigation back to the homepage has to re-find the hero.
  }, [pathname]);

  return past;
}
