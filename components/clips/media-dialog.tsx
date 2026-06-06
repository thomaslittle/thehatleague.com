"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ResolvedClip } from "@/lib/clips/embed";

/**
 * Wraps an arbitrary trigger element. Clicking opens a modal that plays the
 * resolved clip in-place — a <video> for direct files, an iframe for
 * YouTube/Twitch/Streamable, and a clean "open externally" fallback for
 * hosts we can't embed. Same visual language as the /clips dialog.
 */
export function MediaDialog({
  clip,
  title,
  children,
}: {
  clip: ResolvedClip;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} />
      <DialogContent
        showCloseButton={false}
        className="w-[min(96vw,1080px)] !max-w-none bg-neutral-950 p-0 ring-0"
      >
        <div className="overflow-hidden rounded-xl border border-neutral-800 shadow-[0_30px_80px_-20px_rgba(247,97,3,0.45)]">
          <MediaPlayer clip={clip} title={title} active={open} />
          <div className="flex items-start justify-between gap-3 px-5 py-4 text-white">
            <DialogTitle className="min-w-0 truncate text-base font-bold sm:text-lg">
              {title}
            </DialogTitle>
            <DialogClose
              aria-label="Close"
              className="-mt-1 -mr-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-300 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MediaPlayer({
  clip,
  title,
  active,
}: {
  clip: ResolvedClip;
  title: string;
  active: boolean;
}) {
  // Don't mount the player until the dialog opens (no autoplay on load).
  if (!active) return <div className="aspect-video w-full bg-black" />;

  if (clip.videoUrl) {
    return (
      <video
        controls
        autoPlay
        playsInline
        preload="metadata"
        src={clip.videoUrl}
        className="aspect-video w-full bg-black"
      />
    );
  }

  if (clip.embedUrl) {
    return (
      <iframe
        src={clip.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video w-full bg-black"
      />
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <p className="text-sm text-neutral-400">
        This clip lives on a host we can&apos;t embed inline.
      </p>
      <a
        href={clip.url}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-5 py-3 text-sm font-bold text-black transition hover:bg-thl-orange-deep"
      >
        Open clip ↗
      </a>
    </div>
  );
}
