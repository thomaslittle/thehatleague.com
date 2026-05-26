"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "@/components/icons/brand";

interface HypeVideo {
  id: string;
  ytId: string;
  startSeconds?: number;
  title: string;
  eyebrow: string;
  blurb: string;
}

const VIDEOS: HypeVideo[] = [
  {
    id: "s3",
    ytId: "kWa6LEndXks",
    startSeconds: 1,
    title: "Season 3 Grand Finals Hype",
    eyebrow: "Season 03 · Most recent",
    blurb: "The most recent run. Stakes higher than ever.",
  },
  {
    id: "s2",
    ytId: "HUCRdWOfgvw",
    startSeconds: 7,
    title: "Season 2 Grand Finals Hype",
    eyebrow: "Season 02 · Grand Finals",
    blurb: "Bracket break. Two conferences, one trophy.",
  },
  {
    id: "s1",
    ytId: "KR7WLYHPZRA",
    startSeconds: 7,
    title: "Season 1 Grand Finals Hype",
    eyebrow: "Season 01 · The original run",
    blurb: "Where it all started. Dads with hats. Bo7s for keeps.",
  },
];

export function HypeReel() {
  return (
    <section
      id="hype-reel"
      className="relative border-t border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(247,97,3,0.16), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Hype tapes · Archive
            </div>
            <h2 className="reveal mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
              Roll the{" "}
              <span className="font-marker font-normal text-thl-orange">
                tape.
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
              The Grand Finals hype reels from previous seasons. Same dads,
              same hats, escalating stakes.
            </p>
          </div>
          <a
            href="https://www.youtube.com/@hatdadgaming"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-thl-orange underline-offset-4 hover:underline"
          >
            More on YouTube <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <ul className="reveal mt-10 grid gap-6 md:mt-14 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {VIDEOS.map((v) => (
            <li key={v.id}>
              <HypeCard video={v} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HypeCard({ video }: { video: HypeVideo }) {
  const [playing, setPlaying] = useState(false);
  const startParam = video.startSeconds ? `&start=${video.startSeconds}` : "";
  const embedSrc = `https://www.youtube-nocookie.com/embed/${video.ytId}?autoplay=1&rel=0${startParam}`;
  const thumbSrc = `https://i.ytimg.com/vi/${video.ytId}/hqdefault.jpg`;
  const watchHref = `https://www.youtube.com/watch?v=${video.ytId}${
    video.startSeconds ? `&t=${video.startSeconds}s` : ""
  }`;

  return (
    <figure className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] transition hover:border-thl-orange dark:border-neutral-800 dark:bg-black">
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {playing ? (
          <iframe
            src={embedSrc}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${video.title}`}
            className="group/play absolute inset-0 flex items-center justify-center"
          >
            <Image
              src={thumbSrc}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover/play:scale-[1.03]"
              unoptimized
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0"
            />
            <span
              aria-hidden
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-thl-orange text-black shadow-[0_20px_50px_-10px_rgba(247,97,3,0.6)] transition group-hover/play:scale-110"
            >
              <PlayGlyph className="ml-1 h-8 w-8" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-start justify-between gap-4 p-6">
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            {video.eyebrow}
          </div>
          <div className="mt-1.5 text-lg leading-tight font-bold tracking-tight">
            {video.title}
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {video.blurb}
          </p>
        </div>
        <a
          href={watchHref}
          target="_blank"
          rel="noopener"
          className="shrink-0 self-start rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-800"
        >
          YouTube ↗
        </a>
      </figcaption>
    </figure>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
