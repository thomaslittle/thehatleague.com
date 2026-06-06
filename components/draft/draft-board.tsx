"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useDraftLive, useAvailablePool } from "@/lib/draft/use-draft-live";
import { rankWeight } from "@/lib/data/rank-sort";
import { RankBadge } from "@/components/ranks/rank-badge";
import { Button } from "@/components/ui/button";
import { DraftClock } from "@/components/draft/draft-clock";
import { PickReveal, type PickRevealData } from "@/components/draft/pick-reveal";
import type { DraftSnapshot, DraftPerson, DraftTeam } from "@/lib/data/draft";

/**
 * The public, real-time draft board. Big NFL-broadcast feel: on-the-clock
 * panel + live timer, the round-by-round grid, a recent-picks feed, and the
 * best-available table. New picks fire the signature `<PickReveal>` overlay —
 * always SILENT here, since the OBS overlay source owns the reveal audio (a
 * viewer with the site + stream both open should never hear it twice).
 */
export function DraftBoard({
  seasonId,
  initialSnapshot,
  initialPool,
}: {
  seasonId: string;
  initialSnapshot: DraftSnapshot;
  initialPool: DraftPerson[];
}) {
  const snapshot = useDraftLive(seasonId, initialSnapshot);
  const pool = useAvailablePool(seasonId, initialPool);
  const { state, teams, picks, pickSeconds, picksPerTeam } = snapshot;

  const teamById = useMemo(() => {
    const m = new Map<string, DraftTeam>();
    for (const t of teams) m.set(t.id, t);
    return m;
  }, [teams]);

  const onClockTeam = state?.onClockTeamId ? teamById.get(state.onClockTeamId) : undefined;

  // The reveal is pure derived state: show the current last pick unless it was
  // dismissed (seeded with the initial last pick so a fresh mount never replays
  // the previous pick). Closing / finishing marks it dismissed — no effect.
  const [dismissedId, setDismissedId] = useState<string | null>(
    initialSnapshot.state?.lastPickId ?? null,
  );

  const currentPickId = state?.lastPickId ?? null;
  const reveal: PickRevealData | null = useMemo(() => {
    if (!currentPickId || currentPickId === dismissedId) return null;
    const pick = picks.find((p) => p.id === currentPickId);
    if (!pick) return null;
    const team = teamById.get(pick.teamId);
    return {
      overall: pick.overall,
      round: pick.round,
      player: pick.player,
      teamName: team?.name ?? "—",
      teamColor: team?.color ?? null,
      autoPicked: pick.autoPicked,
    };
  }, [currentPickId, dismissedId, picks, teamById]);

  const dismissReveal = () => setDismissedId(currentPickId);

  const recent = useMemo(() => [...picks].reverse().slice(0, 8), [picks]);
  const bestAvailable = useMemo(
    () => [...pool].sort((a, b) => rankWeight(b.peakRank) - rankWeight(a.peakRank)).slice(0, 10),
    [pool],
  );

  const isComplete = state?.status === "complete";

  return (
    <div className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
      {/* Reveal overlay */}
      {reveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <Button
            onClick={dismissReveal}
            aria-label="Dismiss"
            className="absolute top-5 right-5 rounded-full border-0 bg-white/10 text-white hover:bg-white/20"
          >
            Close
          </Button>
          <div className="h-[70vh] w-full max-w-3xl">
            {/* Always silent on the public board — the OBS overlay source owns
                the reveal audio, so a viewer with both open never hears it twice. */}
            <PickReveal pick={reveal} sound={false} onDone={dismissReveal} />
          </div>
        </div>
      )}

      {/* On the clock */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-black p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background: onClockTeam?.color
                ? `radial-gradient(ellipse at 0% 0%, ${onClockTeam.color}33, transparent 60%)`
                : "radial-gradient(ellipse at 0% 0%, rgba(247,97,3,0.2), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.3em] text-thl-orange uppercase">
                {isComplete ? "Draft complete" : "On the clock"}
              </span>
              {!isComplete && state && (
                <span className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
                  Round {state.currentRound} · Pick #{state.currentOverall}
                </span>
              )}
            </div>

            {isComplete ? (
              <div className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                That&apos;s a wrap. Rosters are set.
              </div>
            ) : onClockTeam ? (
              <>
                <div className="mt-6 flex items-center gap-4">
                  <TeamAvatar team={onClockTeam} size={64} />
                  <div className="min-w-0">
                    <div className="truncate text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                      {onClockTeam.name}
                    </div>
                    {onClockTeam.captain && (
                      <div className="truncate text-sm text-white/60">
                        Captain {onClockTeam.captain.name}
                      </div>
                    )}
                  </div>
                </div>
                <DraftClock
                  endsAt={state?.pickEndsAt ?? null}
                  paused={state?.isPaused ?? false}
                  pausedRemainingMs={state?.pausedRemainingMs ?? null}
                  totalSeconds={pickSeconds}
                  className="mt-8 text-7xl md:text-8xl"
                />
                {state?.isPaused && (
                  <div className="mt-3 text-sm font-bold tracking-[0.2em] text-amber-400 uppercase">
                    Paused
                  </div>
                )}
              </>
            ) : (
              <div className="mt-6 text-3xl font-bold text-white/70">Standby…</div>
            )}
          </div>
        </div>

        {/* Recent picks */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h3 className="text-lg font-bold tracking-tight">Recent picks</h3>
          <ul className="mt-4 space-y-2">
            {recent.length === 0 && (
              <li className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                No picks yet.
              </li>
            )}
            {recent.map((p) => {
              const team = teamById.get(p.teamId);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <span className="w-9 shrink-0 text-center text-lg font-bold text-thl-orange tabular-nums">
                    {p.overall}
                  </span>
                  <Avatar person={p.player} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{p.player?.name ?? "—"}</div>
                    <div className="truncate text-xs text-neutral-500">{team?.name ?? "—"}</div>
                  </div>
                  <RankBadge value={p.player?.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Pick grid */}
      <DraftGrid teams={teams} picks={picks} picksPerTeam={picksPerTeam} />

      {/* Best available */}
      <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-lg font-bold tracking-tight">Best available</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {bestAvailable.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
            >
              <span className="w-6 text-center text-sm font-bold text-neutral-400">{i + 1}</span>
              <Avatar person={p} size={32} />
              <div className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</div>
              <RankBadge value={p.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
            </li>
          ))}
          {bestAvailable.length === 0 && (
            <li className="text-sm text-neutral-500">Pool is empty.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function DraftGrid({
  teams,
  picks,
  picksPerTeam,
}: {
  teams: DraftTeam[];
  picks: DraftSnapshot["picks"];
  picksPerTeam: number;
}) {
  const rounds = Math.max(picksPerTeam, 1);
  // pick by team → round
  const byTeamRound = useMemo(() => {
    const m = new Map<string, Map<number, DraftSnapshot["picks"][number]>>();
    for (const p of picks) {
      if (!m.has(p.teamId)) m.set(p.teamId, new Map());
      m.get(p.teamId)!.set(p.round, p);
    }
    return m;
  }, [picks]);

  if (teams.length === 0) return null;

  return (
    <div className="mt-10 overflow-x-auto rounded-3xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <table className="w-full min-w-[640px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="w-12" />
            {teams.map((t) => (
              <th key={t.id} className="px-2 pb-2 text-left">
                <div className="flex items-center gap-2">
                  <TeamAvatar team={t} size={28} />
                  <span className="truncate text-xs font-bold">{t.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rounds }, (_, r) => r + 1).map((round) => (
            <tr key={round}>
              <td className="text-center text-sm font-bold text-neutral-400 tabular-nums">R{round}</td>
              {teams.map((t) => {
                const pick = byTeamRound.get(t.id)?.get(round);
                return (
                  <td
                    key={t.id}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 align-top dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {pick?.player ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar person={pick.player} size={20} />
                        <span className="truncate text-[11px] font-semibold">
                          {pick.player.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Avatar({ person, size }: { person: DraftPerson | null; size: number }) {
  if (person?.avatarUrl) {
    return (
      <Image
        src={person.avatarUrl}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="shrink-0 rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-neutral-300 text-[10px] font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
      style={{ width: size, height: size }}
    >
      {(person?.name ?? "?").slice(0, 1)}
    </div>
  );
}

function TeamAvatar({ team, size }: { team: DraftTeam; size: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: team.color ?? "var(--color-thl-orange)",
        fontSize: size * 0.4,
      }}
    >
      {team.name.slice(0, 1)}
    </div>
  );
}
