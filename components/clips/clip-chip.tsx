"use client";

import { Play } from "lucide-react";
import { resolveClip } from "@/lib/clips/embed";
import { MediaDialog } from "@/components/clips/media-dialog";

/**
 * Compact clip pill. Embeddable links open an on-site player dialog;
 * everything else links out. Used in the combine profile recap.
 */
export function ClipChip({ url, index }: { url: string; index?: number }) {
  const clip = resolveClip(url);
  const title = `${clip.label} clip${index != null ? ` ${index + 1}` : ""}`;
  const inner = (
    <>
      <Play className="h-3.5 w-3.5" aria-hidden /> {clip.label}
    </>
  );

  if (clip.playable) {
    return (
      <MediaDialog clip={clip} title={title}>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-thl-orange transition hover:border-thl-orange dark:border-neutral-800"
        >
          {inner}
        </button>
      </MediaDialog>
    );
  }

  return (
    <a
      href={clip.url}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-600 underline-offset-4 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-800 dark:text-neutral-300"
    >
      {inner} ↗
    </a>
  );
}
