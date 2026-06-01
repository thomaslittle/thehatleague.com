"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { RankBadge } from "@/components/ranks/rank-badge";
import type { DraftPerson } from "@/lib/data/draft";

export interface PickRevealData {
  overall: number;
  round: number;
  player: DraftPerson | null;
  teamName: string;
  teamColor: string | null;
  autoPicked?: boolean;
}

/**
 * The signature "THE PICK IS IN" coin-flip reveal. Plays
 * `public/brand/videos/draft_pick.mp4` once (autoplay/muted/playsInline), then
 * resolves into the drafted player's card. Reuses the robust one-shot-video
 * lifecycle from `hero-logo-intro` (events drive phases, no visibility effect).
 *
 * - `sound`: when true, plays `public/brand/sounds/draft_sound.mp3` alongside
 *   the clip — only safe where audio autoplay is allowed (OBS overlay, or a
 *   streamer-initiated reveal). The public board passes it false by default.
 * - Respects `prefers-reduced-motion`: skips the clip + sound, animates the card.
 * - `onDone` fires after the card has held for `holdMs`, so the host can clear it.
 */
export function PickReveal({
  pick,
  sound = false,
  holdMs = 6000,
  onDone,
}: {
  pick: PickRevealData;
  sound?: boolean;
  holdMs?: number;
  onDone?: () => void;
}) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [phase, setPhase] = useState<"video" | "card">(reduceMotion ? "card" : "video");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Card mount → start the hold timer that calls onDone. Ref-callback so we
  // don't need an effect; cleanup clears the timer if it unmounts early.
  const holdRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const id = setTimeout(() => onDone?.(), holdMs);
      return () => clearTimeout(id);
    },
    [holdMs, onDone],
  );

  const toCard = () => setPhase((p) => (p === "video" ? "card" : p));
  const { player } = pick;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {sound && (
        <audio ref={audioRef} src="/brand/sounds/draft_sound.mp3" preload="auto" />
      )}

      {phase === "video" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {/* The video is ALWAYS muted so the browser allows autoplay — the
              coin-flip visual must always play. Sound (when enabled) comes from
              the separate <audio> element below, which OBS / a user-initiated
              reveal is allowed to autoplay. An unmuted <video> would be blocked
              and skip straight to the card. */}
          <video
            className="h-full w-full object-cover"
            src="/brand/videos/draft_pick.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={toCard}
            onError={toCard}
            onCanPlay={(e) => {
              if (sound) void audioRef.current?.play().catch(() => {});
              void e.currentTarget.play().catch(toCard);
            }}
          />
        </div>
      ) : (
        <div
          ref={holdRef}
          className="thl-hero-intro-in relative flex flex-col items-center px-6 text-center"
          style={
            pick.teamColor
              ? { ["--team-color" as string]: pick.teamColor }
              : undefined
          }
        >
          <div className="text-xs font-bold tracking-[0.3em] text-thl-orange uppercase md:text-sm">
            Round {pick.round} · Pick #{pick.overall}
            {pick.autoPicked ? " · Auto" : ""}
          </div>

          <div className="mt-5 h-28 w-28 overflow-hidden rounded-full border-4 border-thl-orange md:h-36 md:w-36">
            {player?.avatarUrl ? (
              <Image
                src={player.avatarUrl}
                alt=""
                width={144}
                height={144}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-4xl font-bold text-white">
                {(player?.name ?? "?").slice(0, 1)}
              </div>
            )}
          </div>

          <div className="mt-5 font-marker text-4xl leading-none text-white md:text-6xl">
            {player?.name ?? "Player"}
          </div>

          <div className="mt-3 text-lg font-bold text-white/80 md:text-2xl">
            to <span style={{ color: pick.teamColor ?? "var(--color-thl-orange)" }}>{pick.teamName}</span>
          </div>

          {player && (
            <div className="mt-5 flex items-center gap-3">
              <RankPill label="Peak" value={player.peakRank} />
              <RankPill label="3v3" value={player.rank3v3} />
              <RankPill label="2v2" value={player.rank2v2} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RankPill({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
      <span className="text-[10px] font-bold tracking-[0.18em] text-white/50 uppercase">
        {label}
      </span>
      <RankBadge value={value} size={18} abbreviate textClassName="text-sm font-bold text-white" />
    </div>
  );
}
