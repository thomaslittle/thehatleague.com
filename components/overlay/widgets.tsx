"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useDraftLive, useAvailablePool } from "@/lib/draft/use-draft-live";
import { useOverlayLive } from "@/lib/draft/use-overlay-live";
import { rankWeight } from "@/lib/data/rank-sort";
import { teamForOverall, overallToSlot } from "@/lib/draft/order";
import { RankBadge } from "@/components/ranks/rank-badge";
import { DraftClock } from "@/components/draft/draft-clock";
import { PickReveal, type PickRevealData } from "@/components/draft/pick-reveal";
import {
  Stage,
  Panel,
  BrandMark,
  RankNum,
  TeamDot,
  OVL_ORANGE,
} from "@/components/overlay/chrome";
import type { DraftSnapshot, DraftPerson, DraftTeam } from "@/lib/data/draft";
import type { OverlaySettingsView } from "@/lib/data/overlay";

export interface WidgetProps {
  seasonId: string;
  snapshot: DraftSnapshot;
  settings: OverlaySettingsView;
  pool: DraftPerson[];
}

function useLive(props: WidgetProps) {
  const snapshot = useDraftLive(props.seasonId, props.snapshot);
  const settings = useOverlayLive(props.seasonId, props.settings);
  const teamById = useMemo(
    () => new Map(snapshot.teams.map((t) => [t.id, t])),
    [snapshot.teams],
  );
  return { snapshot, settings, teamById };
}

// ---------- on-clock -----------------------------------------------------

export function OnClockWidget(props: WidgetProps) {
  const { snapshot, settings, teamById } = useLive(props);
  const { state } = snapshot;
  const team = state?.onClockTeamId ? teamById.get(state.onClockTeamId) : undefined;
  const accent = settings.accent ?? team?.color ?? OVL_ORANGE;
  const complete = state?.status === "complete";

  // The next teams in the (snake-aware) order, shown while the current team picks.
  const upNext = useMemo<DraftTeam[]>(() => {
    if (!settings.showOnDeck || !state || complete) return [];
    const out: DraftTeam[] = [];
    for (let i = 1; i <= 2; i += 1) {
      const id = teamForOverall(state.currentOverall + i, snapshot.order, snapshot.draftType);
      if (!id) break;
      const t = teamById.get(id);
      if (t) out.push(t);
    }
    return out;
  }, [settings.showOnDeck, state, complete, snapshot.order, snapshot.draftType, teamById]);

  if (!state || state.status === "setup") return <Standby label="Standby" />;

  return (
    <Stage place="top">
      <Panel
        accent={accent}
        kicker={complete ? "Draft Complete" : "On the Clock"}
        meta={!complete && `Round ${state.currentRound} · Pick #${state.currentOverall}`}
        className="w-full max-w-3xl"
      >
        {team ? (
          <>
            <div className="mt-7 flex items-center gap-6">
              <TeamBadge team={team} size={108} accent={accent} />
              <div className="min-w-0">
                <div className="font-marker text-[3.4rem] leading-[1.02] break-words text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
                  {team.name}
                </div>
                {team.captain && (
                  <div className="mt-2 flex items-center gap-2 text-xl font-semibold text-white/65">
                    <span className="text-[12px] font-extrabold tracking-[0.22em] text-white/35 uppercase">
                      Captain
                    </span>
                    {team.captain.name}
                  </div>
                )}
              </div>
            </div>

            {settings.showTimer && !complete && (
              <div className="mt-8 flex items-end justify-between gap-6 border-t border-white/10 pt-6">
                <div className="pb-2 text-[13px] font-extrabold tracking-[0.3em] text-white/40 uppercase">
                  Time on clock
                </div>
                <DraftClock
                  endsAt={state.pickEndsAt}
                  paused={state.isPaused}
                  pausedRemainingMs={state.pausedRemainingMs}
                  totalSeconds={snapshot.pickSeconds}
                  className="text-8xl font-black"
                />
              </div>
            )}
            {complete && (
              <div className="mt-7 border-t border-white/10 pt-6 text-2xl font-bold text-white/70">
                Every pick is in. That&apos;s a wrap on the {snapshot.teams.length}-team draft.
              </div>
            )}
            {upNext.length > 0 && (
              <div className="mt-7 border-t border-white/10 pt-5">
                <div className="text-[12px] font-extrabold tracking-[0.3em] text-white/40 uppercase">
                  Up next
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {upNext.map((t, i) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-2.5 rounded-xl bg-white/[0.05] px-3.5 py-2 ring-1 ring-white/10"
                    >
                      <span className="text-sm font-black text-thl-orange tabular-nums">
                        {i + 1}
                      </span>
                      <TeamDot color={t.color} size={12} />
                      <span className="text-lg font-bold">{t.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-7 text-4xl font-bold text-white/70">Standby…</div>
        )}
      </Panel>
    </Stage>
  );
}

// ---------- last-pick reveal --------------------------------------------

export function LastPickWidget(props: WidgetProps) {
  const { snapshot, teamById } = useLive(props);
  const { state, picks } = snapshot;

  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const currentId = state?.lastPickId ?? null;

  const reveal: PickRevealData | null = useMemo(() => {
    if (!currentId || currentId === dismissedId) return null;
    const pick = picks.find((p) => p.id === currentId);
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
  }, [currentId, dismissedId, picks, teamById]);

  if (!reveal) return null;

  return (
    <div className="fixed inset-0">
      <PickReveal pick={reveal} sound holdMs={8000} onDone={() => setDismissedId(currentId)} />
    </div>
  );
}

// ---------- ticker -------------------------------------------------------

export function TickerWidget(props: WidgetProps) {
  const { snapshot, settings, teamById } = useLive(props);
  // "Recent picks" toggle controls whether the pick feed scrolls; with it off
  // the ticker shows only your pushed ticker text (or the brand line).
  const recent = settings.showRecentPicks
    ? [...snapshot.picks].reverse().slice(0, 12)
    : [];

  const items: { key: string; node: ReactNode }[] = recent.map((p) => {
    const team = teamById.get(p.teamId);
    return {
      key: p.id,
      node: (
        <span className="inline-flex items-center gap-2.5">
          <span className="font-black text-thl-orange tabular-nums">#{p.overall}</span>
          <span className="font-bold text-white">{p.player?.name ?? "—"}</span>
          <span className="text-white/30">→</span>
          <span className="font-semibold text-white/70">{team?.name ?? "—"}</span>
        </span>
      ),
    };
  });
  if (settings.tickerText) {
    items.unshift({ key: "ticker-text", node: <span className="font-bold text-white">{settings.tickerText}</span> });
  }

  const run = (
    <span className="flex items-center">
      {items.length === 0 ? (
        <span className="px-10 font-bold text-white/70">The Hat League · Draft night</span>
      ) : (
        items.map((it) => (
          <span key={it.key} className="flex items-center">
            <span className="px-6">{it.node}</span>
            <span className="text-thl-orange/60">◆</span>
          </span>
        ))
      )}
    </span>
  );

  return (
    <div className="thl-ovl-fade fixed inset-x-0 bottom-0">
      <div className="flex items-stretch overflow-hidden border-t-[3px] border-thl-orange bg-gradient-to-r from-black via-[#0c0c10] to-black text-lg shadow-[0_-14px_44px_-12px_rgba(247,97,3,0.5)]">
        <div className="relative z-10 flex shrink-0 items-center gap-2.5 bg-thl-orange px-6 py-3.5 text-black">
          <BrandMark size={26} ring={false} />
          <span className="font-marker text-xl leading-none">The Hat League</span>
          <span className="ml-1 rounded bg-black/20 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.2em] uppercase">
            Draft
          </span>
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="thl-ticker flex w-max items-center py-3.5 whitespace-nowrap">
            {run}
            {run}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- board --------------------------------------------------------

export function BoardWidget(props: WidgetProps) {
  const { snapshot } = useLive(props);
  const { teams, picks, picksPerTeam } = snapshot;
  const rounds = Math.max(picksPerTeam, 1);
  const byTeamRound = useMemo(() => {
    const m = new Map<string, Map<number, DraftSnapshot["picks"][number]>>();
    for (const p of picks) {
      if (!m.has(p.teamId)) m.set(p.teamId, new Map());
      m.get(p.teamId)!.set(p.round, p);
    }
    return m;
  }, [picks]);

  if (!teams.length) return <Standby label="No teams yet" />;

  return (
    <Stage place="center" className="p-10">
      <Panel accent={OVL_ORANGE} kicker="Draft Board" meta={`${teams.length} teams · ${rounds} rounds`} className="w-full max-w-[1640px]">
        <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-white/10">
          <div
            className="grid text-[13px]"
            style={{ gridTemplateColumns: `64px repeat(${teams.length}, minmax(0, 1fr))` }}
          >
            <div className="bg-white/[0.06]" />
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 border-l border-white/10 bg-white/[0.06] px-3 py-3"
                style={{ boxShadow: `inset 0 -2px 0 ${t.color ?? OVL_ORANGE}` }}
              >
                <TeamDot color={t.color} />
                <span className="truncate text-sm font-bold">{t.name}</span>
              </div>
            ))}

            {Array.from({ length: rounds }, (_, r) => r + 1).map((round) => (
              <Fragment key={round}>
                <div className="flex items-center justify-center border-t border-white/10 bg-black/40 text-base font-black text-thl-orange tabular-nums">
                  R{round}
                </div>
                {teams.map((t) => {
                  const pick = byTeamRound.get(t.id)?.get(round);
                  return (
                    <div
                      key={t.id}
                      className="border-t border-l border-white/10 px-3 py-2.5"
                    >
                      {pick?.player ? (
                        <span className="font-semibold text-white">{pick.player.name}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </Panel>
    </Stage>
  );
}

// ---------- best available ----------------------------------------------

export function BestAvailableWidget(props: WidgetProps) {
  useLive(props); // subscribe for re-render on pick
  const pool = useAvailablePool(props.seasonId, props.pool);
  const best = [...pool].sort((a, b) => rankWeight(b.peakRank) - rankWeight(a.peakRank)).slice(0, 8);

  return (
    <Stage place="left">
      <Panel accent={OVL_ORANGE} kicker="Best Available" meta="By peak rank" className="w-full max-w-md">
        <ol className="thl-ovl-stagger mt-6 space-y-2">
          {best.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                i === 0 ? "bg-thl-orange/15 ring-1 ring-thl-orange/40" : "bg-white/[0.04]"
              }`}
            >
              <RankNum n={i + 1} />
              <span className="min-w-0 flex-1 truncate text-xl font-bold">{p.name}</span>
              <RankBadge value={p.peakRank} size={22} abbreviate textClassName="text-sm font-bold text-white" />
            </li>
          ))}
          {best.length === 0 && <li className="px-3 py-2 text-white/60">Pool empty.</li>}
        </ol>
      </Panel>
    </Stage>
  );
}

// ---------- team roster --------------------------------------------------

/** The team currently on the clock and the squad they've built so far. */
export function RosterWidget(props: WidgetProps) {
  const { snapshot, settings, teamById } = useLive(props);
  const { state } = snapshot;
  const team = state?.onClockTeamId ? teamById.get(state.onClockTeamId) : undefined;
  const accent = settings.accent ?? team?.color ?? OVL_ORANGE;

  if (!state || state.status === "setup" || !team) return <Standby label="Standby" />;

  const roster = snapshot.picks
    .filter((p) => p.teamId === team.id)
    .sort((a, b) => a.overall - b.overall);
  const needed = Math.max(0, snapshot.picksPerTeam - roster.length);

  return (
    <Stage place="left">
      <Panel
        accent={accent}
        kicker="Team Roster"
        meta={`${roster.length}/${snapshot.picksPerTeam} drafted`}
        className="w-full max-w-md"
      >
        <div className="mt-4 font-marker text-[2.6rem] leading-[1.05] text-white">{team.name}</div>
        {team.captain && (
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/60">
            <TeamDot color={team.color} />
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-white/35 uppercase">Captain</span>
            {team.captain.name}
          </div>
        )}

        <ol className="thl-ovl-stagger mt-5 space-y-2">
          {roster.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
              <span className="flex h-7 shrink-0 items-center rounded-md bg-thl-orange/15 px-2 text-xs font-black text-thl-orange tabular-nums">
                R{p.round}
              </span>
              <span className="min-w-0 flex-1 truncate text-lg font-bold">{p.player?.name ?? "—"}</span>
              <RankBadge value={p.player?.peakRank ?? null} size={20} abbreviate textClassName="text-sm font-bold text-white" />
            </li>
          ))}
          {Array.from({ length: needed }).map((_, i) => (
            <li
              key={`empty-${i}`}
              className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-3 py-2.5"
            >
              <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-xs font-bold text-white/30">
                ·
              </span>
              <span className="text-lg font-semibold text-white/30">
                {i === 0 ? "On the clock…" : "Pick pending"}
              </span>
            </li>
          ))}
        </ol>
      </Panel>
    </Stage>
  );
}

// ---------- up next rail -------------------------------------------------

/** The upcoming picks in order — a deeper "who's coming" rail. */
export function UpNextWidget(props: WidgetProps) {
  const { snapshot, teamById } = useLive(props);
  const { state } = snapshot;

  const upcoming = useMemo(() => {
    if (!state || state.status === "setup" || state.status === "complete") return [];
    const total = snapshot.picksPerTeam * snapshot.order.length;
    const out: { overall: number; round: number; team: DraftTeam }[] = [];
    for (let o = state.currentOverall; o <= total && out.length < 7; o += 1) {
      const id = teamForOverall(o, snapshot.order, snapshot.draftType);
      if (!id) break;
      const t = teamById.get(id);
      if (t) out.push({ overall: o, round: overallToSlot(o, snapshot.order.length, snapshot.draftType)?.round ?? 1, team: t });
    }
    return out;
  }, [state, snapshot.order, snapshot.draftType, snapshot.picksPerTeam, teamById]);

  if (upcoming.length === 0) return <Standby label="Standby" />;

  return (
    <Stage place="left">
      <Panel accent={OVL_ORANGE} kicker="Up Next" meta="Draft order" className="w-full max-w-sm">
        <ol className="thl-ovl-stagger mt-5 space-y-2">
          {upcoming.map((u, i) => (
            <li
              key={u.overall}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                i === 0 ? "bg-thl-orange/15 ring-1 ring-thl-orange/40" : "bg-white/[0.04]"
              }`}
            >
              <span
                className="flex h-8 min-w-[3rem] items-center justify-center rounded-md px-2 text-sm font-black tabular-nums"
                style={
                  i === 0
                    ? { background: OVL_ORANGE, color: "#0a0a0a" }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }
                }
              >
                #{u.overall}
              </span>
              <TeamDot color={u.team.color} size={12} />
              <span className="min-w-0 flex-1 truncate text-lg font-bold">{u.team.name}</span>
              {i === 0 ? (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-black tracking-[0.14em] text-white uppercase">
                  Now
                </span>
              ) : (
                <span className="text-[11px] font-bold tracking-[0.16em] text-white/35 uppercase">R{u.round}</span>
              )}
            </li>
          ))}
        </ol>
      </Panel>
    </Stage>
  );
}

// ---------- top prospect spotlight ---------------------------------------

/** The #1 available player by peak rank — the consensus best pick on the board. */
export function SpotlightWidget(props: WidgetProps) {
  useLive(props); // re-render on pick
  const pool = useAvailablePool(props.seasonId, props.pool);
  const top = [...pool].sort((a, b) => rankWeight(b.peakRank) - rankWeight(a.peakRank))[0];

  if (!top) return <Standby label="Pool empty" />;

  return (
    <Stage place="left">
      <Panel accent={OVL_ORANGE} kicker="Top Prospect" meta="Best on the board" className="w-full max-w-md">
        <div className="mt-5 flex items-center gap-5">
          {top.avatarUrl ? (
            <Image
              src={top.avatarUrl}
              alt=""
              width={96}
              height={96}
              unoptimized
              className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-2 ring-thl-orange/60"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-thl-orange text-4xl font-black text-black">
              {top.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-marker text-[2.4rem] leading-[1.05] break-words text-white">{top.name}</div>
            {top.username && <div className="mt-1 text-sm text-white/45">@{top.username}</div>}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <RankStat label="Peak" value={top.peakRank} />
          <RankStat label="3v3" value={top.rank3v3} />
          <RankStat label="2v2" value={top.rank2v2} />
        </div>
      </Panel>
    </Stage>
  );
}

function RankStat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl bg-white/[0.05] px-3 py-3 text-center ring-1 ring-white/10">
      <div className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">{label}</div>
      <div className="mt-2 flex justify-center">
        <RankBadge value={value} size={26} abbreviate textClassName="text-base font-bold text-white" />
      </div>
    </div>
  );
}

// ---------- lower third --------------------------------------------------

export function LowerThirdWidget(props: WidgetProps) {
  const { settings } = useLive(props);
  if (!settings.lowerThird) return null;
  return (
    <div className="fixed inset-x-0 bottom-16 flex justify-center px-12">
      <div className="thl-ovl-rise relative flex items-stretch overflow-hidden rounded-2xl bg-gradient-to-r from-black via-[#0c0c10] to-black/90 pr-9 text-white shadow-[0_28px_70px_-22px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
        <div className="absolute inset-x-0 top-0 h-[4px] overflow-hidden bg-thl-orange">
          <span className="thl-ovl-sweep absolute inset-y-0 left-0 w-1/4 bg-white/55 blur-[2px]" />
        </div>
        <div className="flex items-center bg-thl-orange px-5 text-black">
          <BrandMark size={30} ring={false} />
        </div>
        <div className="py-4 pl-5">
          <div className="text-[11px] font-extrabold tracking-[0.34em] text-thl-orange uppercase">
            The Hat League
          </div>
          <div className="mt-0.5 text-3xl font-black tracking-tight">{settings.lowerThird}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- auto program (reveal → on-clock) -----------------------------

/**
 * The default Program: when a new pick lands it auto-plays the "THE PICK IS IN"
 * reveal, then settles back on the on-clock card — no manual scene switching.
 * Only picks made *after* mount reveal (so an OBS source reload doesn't replay
 * the last one).
 */
export function AutoProgramWidget(props: WidgetProps) {
  const { snapshot, settings, teamById } = useLive(props);
  const { state, picks } = snapshot;
  const [seenId, setSeenId] = useState<string | null>(() => state?.lastPickId ?? null);
  const currentId = state?.lastPickId ?? null;

  const reveal: PickRevealData | null = useMemo(() => {
    if (!currentId || currentId === seenId) return null;
    const pick = picks.find((p) => p.id === currentId);
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
  }, [currentId, seenId, picks, teamById]);

  if (reveal) {
    return (
      <div className="fixed inset-0">
        <PickReveal
          pick={reveal}
          sound={settings.revealSound}
          holdMs={Math.max(3, settings.revealSeconds) * 1000}
          onDone={() => setSeenId(currentId)}
        />
      </div>
    );
  }
  return <OnClockWidget {...props} />;
}

// ---------- scene director ----------------------------------------------

export function SceneWidget(props: WidgetProps) {
  const { settings } = useLive(props);
  switch (settings.activeScene) {
    case "last_pick":
      return <LastPickWidget {...props} />;
    case "ticker":
      return <TickerWidget {...props} />;
    case "board":
      return <BoardWidget {...props} />;
    case "best_available":
      return <BestAvailableWidget {...props} />;
    case "lower_third":
      return <LowerThirdWidget {...props} />;
    case "on_clock":
    default:
      // Default Program auto-sequences reveal → on-clock.
      return <AutoProgramWidget {...props} />;
  }
}

// ---------- shared -------------------------------------------------------

function Standby({ label }: { label: string }) {
  return (
    <Stage place="center">
      <div className="thl-ovl-fade flex items-center gap-4 rounded-2xl bg-black/70 px-8 py-5 ring-1 ring-white/10 backdrop-blur">
        <BrandMark size={34} />
        <div className="text-2xl font-bold tracking-tight text-white/75">{label}</div>
        <span className="relative ml-1 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-thl-orange opacity-75 motion-reduce:hidden" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-thl-orange" />
        </span>
      </div>
    </Stage>
  );
}

function TeamBadge({ team, size, accent }: { team: DraftTeam; size: number; accent: string }) {
  if (team.captain?.avatarUrl) {
    return (
      <Image
        src={team.captain.avatarUrl}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="shrink-0 rounded-2xl object-cover ring-2 ring-white/20"
        style={{ width: size, height: size, boxShadow: `0 0 0 4px rgba(0,0,0,0.4), 0 14px 40px -12px ${accent}` }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl font-black text-white"
      style={{
        width: size,
        height: size,
        background: team.color ?? accent,
        fontSize: size * 0.42,
        boxShadow: `0 14px 40px -12px ${accent}`,
      }}
    >
      {team.name.slice(0, 1)}
    </div>
  );
}
