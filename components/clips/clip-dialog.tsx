"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Clip } from "@/lib/discord/clips";

/**
 * Wraps an arbitrary trigger element. Clicking opens a modal that plays
 * the clip in-place — direct <video> for Discord-uploaded mp4s, an
 * iframe embed for YouTube/Twitch/Medal/GIFYourGame, and a graceful
 * "Open externally" fallback for sources we can't embed (X/Twitter).
 */
export function ClipDialog({
  clip,
  children,
}: {
  clip: Clip;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* base-ui's Trigger uses `render` instead of `asChild`. We hand it
          the card-shaped child so the whole card becomes the trigger. */}
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent
        showCloseButton={false}
        className="w-[min(96vw,1080px)] !max-w-none bg-neutral-950 p-0 ring-0"
      >
        <div className="overflow-hidden rounded-xl border border-neutral-800 shadow-[0_30px_80px_-20px_rgba(247,97,3,0.45)]">
          <ClipPlayer clip={clip} active={open} />
          <div className="flex items-start justify-between gap-3 px-5 py-4 text-white">
            <DialogTitle className="min-w-0 truncate text-base font-bold sm:text-lg">
              {clip.title}
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

function ClipPlayer({ clip, active }: { clip: Clip; active: boolean }) {
  // Skip rendering the iframe until the dialog opens so autoplay
  // doesn't fire on initial page load.
  if (!active) return <div className="aspect-video w-full bg-black" />;

  // Direct video URLs (Discord MP4s and resolved GIF Your Game clips)
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

  // Embeddable sources (YouTube, Twitch, Medal — these work in iframes)
  if (clip.embedUrl) {
    return (
      <iframe
        src={clip.embedUrl}
        title={clip.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video w-full bg-black"
      />
    );
  }

  // No embeddable source — present a clean fallback with the external
  // link instead of breaking. Looks intentional, not broken.
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
