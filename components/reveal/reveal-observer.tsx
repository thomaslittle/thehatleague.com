"use client";

import { useEffect } from "react";

/**
 * Tiny IntersectionObserver that adds `.in` to every `.reveal` element
 * when it enters the viewport. Pure JS — works in all evergreen browsers.
 *
 * EFFECT JUSTIFICATION: managing DOM-level mutation observers is exactly
 * what useEffect is for. There's no reactive alternative, and the modern
 * CSS `animation-timeline: view()` we tried originally has inconsistent
 * support (notably Safari).
 */
export function RevealObserver() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".reveal");
    if (targets.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      // Older browsers — show everything immediately.
      targets.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
    );

    targets.forEach((el) => io.observe(el));

    // Re-scan on navigation since new sections may have mounted.
    const scanInterval = window.setInterval(() => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.in)")
        .forEach((el) => {
          if (!(el as HTMLElement & { __obs?: boolean }).__obs) {
            io.observe(el);
            (el as HTMLElement & { __obs?: boolean }).__obs = true;
          }
        });
    }, 1000);

    return () => {
      io.disconnect();
      window.clearInterval(scanInterval);
    };
  }, []);

  return null;
}
