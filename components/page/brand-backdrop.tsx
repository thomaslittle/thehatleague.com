"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Spotlight } from "@/components/landing/spotlight";

/**
 * Single persistent brand-glow layer for app pages. It lives outside route
 * transitions, but scrolls with the document so content cannot pass beneath a
 * fixed image layer.
 */
export function BrandBackdropLayer() {
  const pathname = usePathname();
  const imgRef = useRef<HTMLDivElement>(null);

  // Mouse + scroll parallax on the backdrop photo, matching the landing hero.
  // Set up in a ref callback (React 19 cleanup return) so there's no
  // useEffect; both inputs feed one rAF-batched transform write.
  const parallaxSetup = useCallback((node: HTMLDivElement | null) => {
    if (!node || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let mx = 0;
    let my = 0;
    let sc = 0;
    let ticking = false;
    const apply = () => {
      if (imgRef.current) {
        imgRef.current.style.transform = `scale(1.12) translate3d(${mx.toFixed(1)}px, ${(my + sc).toFixed(1)}px, 0)`;
      }
      ticking = false;
    };
    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    const onMove = (e: MouseEvent) => {
      mx = -(e.clientX / window.innerWidth - 0.5) * 28;
      my = -(e.clientY / window.innerHeight - 0.5) * 20;
      schedule();
    };
    const onScroll = () => {
      sc = Math.min(window.scrollY * 0.25, 48);
      schedule();
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={parallaxSetup}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-[110px] z-0 h-[720px] overflow-hidden transition-opacity duration-200 ease-out ${
        pathname === "/" ? "opacity-0" : "opacity-100"
      }`}
      style={{ viewTransitionName: "brand-backdrop" }}
    >
      <div
        ref={imgRef}
        className="absolute -inset-y-20 inset-x-0 transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
        style={{ transform: "scale(1.12)" }}
      >
        <Image
          src="/brand/thl-fennec.png"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-40 dark:opacity-45"
          style={{ objectPosition: "55% 30%" }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/25 dark:from-black/80 dark:via-black/45 dark:to-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white dark:to-black" />
      {/* Spotlight beams own the corner glow: orange left, blue right. */}
      <Spotlight />
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,1), transparent 90%)",
        }}
      />
    </div>
  );
}
