"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function RouteViewTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition
      key={pathname}
      name="thl-route-content"
      share="thl-route"
      enter="thl-route"
      exit="thl-route"
      default="none"
    >
      <div
        data-route-transition-shell
        className="relative z-10 min-h-[calc(100vh+1px)] w-full"
      >
        {children}
      </div>
    </ViewTransition>
  );
}
