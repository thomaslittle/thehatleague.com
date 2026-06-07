"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A clean, branded collapsible card for the settings page: a full-width header
 * (orange kicker + description + chevron) that expands a smooth, height-animated
 * body. CSS-only animation via the grid-rows 0fr↔1fr trick.
 */
export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50 md:px-8 dark:hover:bg-neutral-900/60"
      >
        <span className="min-w-0">
          <span className="block text-xs font-bold tracking-[0.18em] text-thl-orange uppercase">
            {title}
          </span>
          {description && (
            <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </span>
          )}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-500 transition-colors group-hover:border-thl-orange/50 group-hover:text-thl-orange dark:border-neutral-800 dark:text-neutral-400">
          <ChevronDown
            className={`size-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-200 px-6 py-6 md:px-8 md:py-8 dark:border-neutral-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
