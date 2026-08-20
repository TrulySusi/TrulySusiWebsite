"use client";

import { useEffect } from "react";
import { OverlayScrollbars } from "overlayscrollbars";

// Applies the auto-hide overlay scrollbar to the whole page. No visual
// output of its own — just initializes on document.body once mounted.
export function DocumentScrollbar() {
  useEffect(() => {
    const instance = OverlayScrollbars(document.body, {
      scrollbars: {
        theme: "os-theme-light os-theme-truly-susi",
        autoHide: "leave",
        autoHideDelay: 400,
      },
    });
    return () => instance.destroy();
  }, []);

  return null;
}
