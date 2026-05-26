"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Single persistent brand-glow layer for app pages. It lives outside route
 * transitions, but scrolls with the document so content cannot pass beneath a
 * fixed image layer.
 */
export function BrandBackdropLayer() {
  const pathname = usePathname();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-[110px] z-0 h-[720px] overflow-hidden transition-opacity duration-200 ease-out ${
        pathname === "/" ? "opacity-0" : "opacity-100"
      }`}
      style={{ viewTransitionName: "brand-backdrop" }}
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
      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/25 dark:from-black/80 dark:via-black/45 dark:to-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white dark:to-black" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 18% 10%, rgba(247,97,3,0.32), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(247,97,3,0.14), transparent 60%)",
        }}
      />
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
