"use client";

import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { PatchIcon } from "@/components/patches/patch-icon";
import type { BadgeUnlock } from "@/lib/data/awards";

/**
 * OBS patch-unlock overlay. Shows the latest patch unlock and re-renders (via
 * RealtimeRefresh) whenever a new patch lands; keying on the unlock id replays
 * the reveal animation. Transparent bg so it composites over the stream.
 */
export function PatchUnlockWidget({ latest }: { latest: BadgeUnlock | null }) {
  return (
    <div className="flex min-h-screen items-end justify-center p-12">
      <RealtimeRefresh tables={["player_badges"]} channel="patch-unlock" />
      {latest && (
        <div
          key={latest.id}
          className="thl-hero-intro-in flex items-center gap-5 rounded-2xl border-2 border-thl-orange bg-black/85 px-8 py-6 backdrop-blur"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-thl-orange/15 text-thl-orange">
            <PatchIcon name={latest.icon} className="h-11 w-11" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-[0.3em] text-thl-orange uppercase">
              Patch unlocked · {latest.tier}
            </div>
            <div className="mt-1 text-4xl font-extrabold tracking-tight text-white">{latest.badgeName}</div>
            <div className="text-lg text-white/70">{latest.playerName}</div>
          </div>
        </div>
      )}
    </div>
  );
}
