"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A live, scaled-down preview of an OBS overlay. The overlay pages are
 * authored at 1920×1080 for broadcast; we render the real page in an iframe
 * and scale it to fit a 16:9 box so the streamer sees exactly what OBS will
 * show — updating live as the control room pushes changes.
 *
 * Scale is written straight to the iframe via a ResizeObserver in a ref
 * callback (React 19 cleanup return) — no render-state, so no value-effect.
 */
export function OverlayPreview({
  src,
  className,
  eager = false,
}: {
  src: string;
  className?: string;
  eager?: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const setup = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const apply = () => {
      const scale = node.clientWidth / 1920;
      const f = frameRef.current;
      if (f) f.style.transform = `scale(${scale})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={setup} className={cn("relative aspect-video w-full overflow-hidden bg-neutral-950", className)}>
      {/* Stream-style backdrop so transparent overlays composite like on air. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(247,97,3,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.12),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <iframe
        ref={frameRef}
        src={src}
        title="Overlay preview"
        loading={eager ? "eager" : "lazy"}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
        style={{ width: 1920, height: 1080 }}
      />
    </div>
  );
}
