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

    const tracked = new WeakSet<Element>();
    const observe = (el: Element) => {
      if (tracked.has(el)) return;
      tracked.add(el);
      io.observe(el);
    };
    targets.forEach(observe);

    // Pick up `.reveal` nodes added after initial mount (route nav, async
    // sections). MutationObserver only fires on actual DOM mutation, so
    // there's no idle polling cost like the prior setInterval had.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList.contains("reveal") && !node.classList.contains("in")) {
            observe(node);
          }
          node
            .querySelectorAll<HTMLElement>(".reveal:not(.in)")
            .forEach(observe);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
