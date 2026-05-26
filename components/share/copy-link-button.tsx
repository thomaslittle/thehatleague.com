"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";

export function CopyLinkButton({
  text,
  label = "Copy share link",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function onClick() {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        // Some browsers block clipboard without HTTPS — fall back to selection.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          // Last resort — open the link in a new tab so user can copy manually.
          window.open(text, "_blank", "noopener");
        }
        document.body.removeChild(ta);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
        copied
          ? "border-thl-orange bg-thl-orange text-black"
          : "border-neutral-300 text-neutral-700 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300",
        className,
      )}
      aria-live="polite"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
