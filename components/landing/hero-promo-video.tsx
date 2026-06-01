"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const POSTER = "/brand/videos/season_4_discussion-poster.jpg";
const VIDEO = "/brand/videos/season_4_discussion.mp4";

/**
 * The hero card's feature slot: a branded thumbnail for Hat Dad's Season 4
 * rundown. Clicking opens the full ~17-min overview in a large modal player
 * (better than cramming a long-form video into the small hero card). The
 * poster is a frame pulled from the video, dimmed behind a brand gradient so
 * the play button and copy read clearly.
 */
export function HeroPromoVideo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Play the Season 4 rundown with Hat Dad"
            className="group relative aspect-video w-full max-w-[440px] overflow-hidden rounded-2xl bg-neutral-900 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5 hover:ring-thl-orange/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thl-orange"
          />
        }
      >
        <Image
          src={POSTER}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 440px, (min-width: 640px) 45vw, 90vw"
          className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-90"
        />
        {/* Brand wash so the screenshot recedes behind the copy + button. */}
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
        <span
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(247,97,3,0.28), transparent 65%)",
          }}
        />

        {/* New badge */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-thl-orange px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-black uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          New · Watch
        </span>

        {/* Play button */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-thl-orange text-black shadow-[0_10px_30px_-6px_rgba(247,97,3,0.7)] transition group-hover:scale-110">
            <span className="absolute inset-0 animate-ping rounded-full bg-thl-orange/50 motion-reduce:hidden" />
            <Play className="relative ml-0.5 h-7 w-7 fill-current" aria-hidden />
          </span>
        </span>

        {/* Caption */}
        <span className="absolute inset-x-0 bottom-0 p-4 text-left">
          <span className="block font-marker text-xl leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            The Season 4 rundown
          </span>
          <span className="mt-1.5 block text-[11px] font-bold tracking-[0.14em] text-white/75 uppercase">
            Presented by Hat Dad · How the league works &amp; how to get in
          </span>
        </span>
      </DialogTrigger>

      <DialogContent className="w-[min(95vw,960px)] !max-w-none bg-black p-0 ring-1 ring-white/15">
        <DialogTitle className="sr-only">
          The Season 4 rundown, presented by Hat Dad
        </DialogTitle>
        {/* Only mount the <video> while open so the 110 MB file never loads
            until someone actually hits play. */}
        {open && (
          <video
            src={VIDEO}
            poster={POSTER}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full rounded-xl bg-black"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
