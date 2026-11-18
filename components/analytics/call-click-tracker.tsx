"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

// One delegated listener covers every tel: link on the public site (header, CTAs, footer, bottom nav).
export function CallClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href^='tel:']");
      if (link) trackEvent("call_click");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
