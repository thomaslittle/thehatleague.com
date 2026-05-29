import { useState } from "react";

export function CopyLinkButton({
  text,
  path,
  label = "Copy link",
}: {
  /** Full URL to copy. Use this when you already have an absolute string. */
  text?: string;
  /** Path-only — origin is resolved at click time so SSR can render the
   *  button before window.location is available. Preferred over `text` for
   *  same-origin links. */
  path?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const value =
      text ??
      (path
        ? `${typeof window !== "undefined" ? window.location.origin : ""}${path}`
        : "");
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail under permission errors or older browsers;
      // silently no-op rather than throwing a runtime error.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition " +
        (copied
          ? "border-thl-orange bg-thl-orange text-black"
          : "border-neutral-300 text-neutral-600 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300")
      }
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
