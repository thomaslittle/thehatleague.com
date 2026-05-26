import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Brand-glow backdrop used at the top of the dashboard, admin layout,
 * and anywhere else the page should feel like it's standing on the
 * league's hero photo without leaving the readable text behind.
 *
 * Renders three positioned layers behind its children:
 *   1. Fennec hero photo (40–45 % opacity) with a horizontal scrim
 *      that fades the right edge so headlines stay legible.
 *   2. Two brand-orange radial spotlights (top-left + top-right) for
 *      depth.
 *   3. A subtle diagonal grid pattern that fades out at the bottom.
 *
 * The actual page content goes inside as children; this component
 * wraps it in a `relative` container so children stack above the
 * backdrop.
 */
export function BrandBackdrop({
  children,
  className,
  /** Height of the backdrop band in pixels. Tweak when the page's
   *  top content is taller or shorter than the default. */
  height = 720,
}: {
  children: ReactNode;
  className?: string;
  height?: number;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
        style={{ height }}
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
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 opacity-80"
        style={{
          height,
          background:
            "radial-gradient(ellipse 60% 50% at 18% 10%, rgba(247,97,3,0.32), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 opacity-60"
        style={{
          height,
          background:
            "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(247,97,3,0.14), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 opacity-[0.08] dark:opacity-[0.05]"
        style={{
          height,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,1), transparent 90%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
