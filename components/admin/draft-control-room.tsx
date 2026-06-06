"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useDraftLive, useAvailablePool } from "@/lib/draft/use-draft-live";
import { queryKeys } from "@/lib/query-keys";
import { rankWeight } from "@/lib/data/rank-sort";
import { RankBadge } from "@/components/ranks/rank-badge";
import { DraftClock } from "@/components/draft/draft-clock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeftRight } from "lucide-react";
import {
  startDraft,
  startPickClock,
  makePick,
  movePlayer,
  autoPickIfExpired,
  pauseDraft,
  resumeDraft,
  extendClock,
  setOnClock,
  undoLastPick,
  createTeamsFromCaptains,
  seedTeams,
  updateDraftSettings,
} from "@/app/actions/draft";
import { DraftGuideButton } from "@/components/admin/draft-guide-dialog";
import type { OverlaySettingsView } from "@/lib/data/overlay";
import { OverlayStudio } from "@/components/admin/overlay-studio";
import { BallchasingPanel } from "@/components/admin/ballchasing-panel";
import type { SeedMethod } from "@/lib/draft/seeding";
import type { DraftSnapshot, DraftPerson, DraftTeam } from "@/lib/data/draft";

type Result = { ok?: boolean; error?: string; skipped?: boolean };

export function DraftControlRoom({
  seasonId,
  seasonName,
  seasonSlug,
  initialSnapshot,
  initialPool,
  captainCount,
  initialOverlay,
  origin,
}: {
  seasonId: string;
  seasonName: string;
  seasonSlug: string;
  initialSnapshot: DraftSnapshot;
  initialPool: DraftPerson[];
  captainCount: number;
  initialOverlay: OverlaySettingsView | null;
  origin: string;
}) {
  const snapshot = useDraftLive(seasonId, initialSnapshot);
  const pool = useAvailablePool(seasonId, initialPool);
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const status = snapshot.state?.status ?? "setup";

  // Thin wrapper: run an action in a transition + toast the outcome, then
  // refetch the draft queries directly. Supabase Realtime can be delayed or
  // undelivered, so the streamer's OWN actions must update the cockpit
  // immediately — we don't rely on a realtime round-trip for the actor.
  const run = (label: string, fn: () => Promise<Result>) => {
    startTransition(async () => {
      const res = await fn();
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.skipped) toast.info(`${label}: nothing to do.`);
      else toast.success(`${label}`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.draft.snapshot(seasonId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.draft.available(seasonId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.draft.overlay(seasonId) });
    });
  };

  return (
    <>
      {/* Slim header — the control room wants vertical room for the deck. */}
      <section className="mx-auto max-w-[1320px] px-6 pt-5 pb-1 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase">
              Control room
            </span>
            <h1 className="text-lg font-bold tracking-tight">{seasonName} draft</h1>
          </div>
          <div className="flex items-center gap-2">
            <DraftGuideButton />
            <StatusBadge status={status} pending={pending} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
      {status === "setup" ? (
        <SetupPanel
          snapshot={snapshot}
          captainCount={captainCount}
          pending={pending}
          run={run}
          seasonId={seasonId}
        />
      ) : (
        <LivePanel
          snapshot={snapshot}
          pool={pool}
          pending={pending}
          run={run}
          seasonId={seasonId}
        />
      )}

      <OverlayStudio
        seasonId={seasonId}
        seasonSlug={seasonSlug}
        origin={origin}
        initialOverlay={initialOverlay}
        pending={pending}
        run={run}
      />

      <BallchasingPanel />
      </section>
    </>
  );
}


function StatusBadge({ status, pending }: { status: string; pending: boolean }) {
  const map: Record<string, string> = {
    setup: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    live: "bg-thl-orange text-black",
    paused: "bg-amber-400 text-black",
    complete: "bg-emerald-500 text-black",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.2em] uppercase ${map[status] ?? map.setup}`}
    >
      {pending && <span className="h-2 w-2 animate-pulse motion-reduce:animate-none rounded-full bg-current" />}
      {status}
    </span>
  );
}

// ---------- setup --------------------------------------------------------

function SetupPanel({
  snapshot,
  captainCount,
  pending,
  run,
  seasonId,
}: {
  snapshot: DraftSnapshot;
  captainCount: number;
  pending: boolean;
  run: (label: string, fn: () => Promise<Result>) => void;
  seasonId: string;
}) {
  const [rosterSize, setRosterSize] = useState(snapshot.rosterSize);
  const [pickSeconds, setPickSeconds] = useState(snapshot.pickSeconds);
  const [seedMethod, setSeedMethod] = useState<SeedMethod>("rank_asc");
  const teamById = useMemo(() => new Map(snapshot.teams.map((t) => [t.id, t])), [snapshot.teams]);
  const ordered = snapshot.order.map((id) => teamById.get(id)).filter(Boolean) as DraftTeam[];

  const hasTeams = snapshot.teams.length > 0;
  const hasOrder = snapshot.order.length > 0;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-2">
      <Card title="1 · Teams">
        <p className="text-sm text-neutral-500">
          {captainCount} captain{captainCount === 1 ? "" : "s"} · {snapshot.teams.length} team
          {snapshot.teams.length === 1 ? "" : "s"} created.
        </p>
        <Button
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() => run("Teams created", () => createTeamsFromCaptains(seasonId))}
          className="mt-4 w-full"
        >
          Create teams from captains
        </Button>
      </Card>

      <Card title="2 · Settings">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Roster size" value={rosterSize} min={2} max={8} onChange={setRosterSize} />
          <NumberField label="Pick seconds" value={pickSeconds} min={15} max={300} step={5} onChange={setPickSeconds} />
        </div>
        <Field label="Seed method" className="mt-3">
          <Select value={seedMethod} onValueChange={(v) => setSeedMethod(v as SeedMethod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank_asc">Rank — lowest first (balance)</SelectItem>
              <SelectItem value="rank_desc">Rank — highest first</SelectItem>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="manual">Manual (keep current)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Button
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() =>
            run("Settings saved", () =>
              updateDraftSettings(seasonId, { roster_size: rosterSize, pick_seconds: pickSeconds, seed_method: seedMethod }),
            )
          }
          className="mt-4 w-full"
        >
          Save settings
        </Button>
      </Card>

      <Card title="3 · Draft order">
        <Button
          variant="outline"
          size="lg"
          disabled={pending || !hasTeams}
          onClick={() => run("Order seeded", () => seedTeams(seasonId, seedMethod))}
          className="w-full"
        >
          Seed order ({seedMethod})
        </Button>
        <ol className="mt-4 space-y-1.5">
          {ordered.map((t, i) => (
            <li key={t.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
              <span className="w-6 text-center text-lg font-bold text-thl-orange tabular-nums">{i + 1}</span>
              <span className="truncate text-sm font-bold">{t.name}</span>
              {t.captain && <span className="ml-auto truncate text-xs text-neutral-500">{t.captain.name}</span>}
            </li>
          ))}
          {!hasOrder && <li className="text-sm text-neutral-500">No order yet — seed it.</li>}
        </ol>
      </Card>

      <Card title="4 · Go live">
        <p className="text-sm text-neutral-500">
          {snapshot.picksPerTeam} pick{snapshot.picksPerTeam === 1 ? "" : "s"} per team.
          Captains pick the rest.
        </p>
        <Button
          size="lg"
          disabled={pending || !hasOrder}
          onClick={() => run("Draft started", () => startDraft(seasonId))}
          className="mt-4 w-full"
        >
          Start draft
        </Button>
      </Card>
    </div>
  );
}

// ---------- live ---------------------------------------------------------

function LivePanel({
  snapshot,
  pool,
  pending,
  run,
  seasonId,
}: {
  snapshot: DraftSnapshot;
  pool: DraftPerson[];
  pending: boolean;
  run: (label: string, fn: () => Promise<Result>) => void;
  seasonId: string;
}) {
  const { state, teams } = snapshot;
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const onClock = state?.onClockTeamId ? teamById.get(state.onClockTeamId) : undefined;
  const isComplete = state?.status === "complete";
  // "On deck": a team is up but the clock hasn't started (just after a pick, or
  // right after Start draft) — the reveal plays and the streamer hits Start.
  const awaitingStart =
    !isComplete && !state?.isPaused && !state?.pickEndsAt && !!state?.onClockTeamId;

  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...pool]
      .sort((a, b) => rankWeight(b.peakRank) - rankWeight(a.peakRank))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.username ?? "").toLowerCase().includes(q))
      .slice(0, 40);
  }, [pool, query]);

  const confirmPlayer = confirmId ? pool.find((p) => p.id === confirmId) : null;

  // EFFECT JUSTIFICATION: a document-level "/" shortcut to focus the pick search
  // is inherently a global keyboard listener bound to this view's lifetime —
  // there's no non-effect path for a document listener with cleanup.
  useEffect(() => {
    if (isComplete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isComplete]);

  // Arrow/Enter navigation within the search-driven pick list.
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = filtered[highlight];
      if (pick) setConfirmId(pick.id);
    }
  };

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* Clock + controls */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-black p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold tracking-[0.3em] text-thl-orange uppercase">
              {isComplete ? "Complete" : awaitingStart ? "On deck" : "On the clock"}
            </div>
            {!isComplete && state && (
              <div className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
                Pick {state.currentOverall} / {snapshot.picksPerTeam * teams.length} · R{state.currentRound}
              </div>
            )}
          </div>
          {isComplete ? (
            <div className="mt-4 text-2xl font-extrabold tracking-tight text-white">Rosters are set.</div>
          ) : (
            <>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-white">{onClock?.name ?? "—"}</div>
              {onClock?.captain && <div className="mt-1 text-sm text-white/60">Captain {onClock.captain.name}</div>}
              <DraftClock
                endsAt={state?.pickEndsAt ?? null}
                paused={state?.isPaused ?? false}
                pausedRemainingMs={state?.pausedRemainingMs ?? null}
                totalSeconds={snapshot.pickSeconds}
                className={`mt-5 text-6xl ${awaitingStart ? "text-white/35" : ""}`}
              />
              {awaitingStart && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-thl-orange">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-thl-orange opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-thl-orange" />
                  </span>
                  Reveal on air · clock is stopped until you start
                </div>
              )}
            </>
          )}
          {!isComplete &&
            (awaitingStart ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  onClick={() => run("Clock started", () => startPickClock(seasonId))}
                  disabled={pending}
                  className="bg-thl-orange text-black hover:bg-thl-orange-deep"
                >
                  ▶ Start {onClock?.name ? `${onClock.name}'s` : "next"} pick
                </Button>
                <SmallBtn onClick={() => run("Undone", () => undoLastPick(seasonId))} disabled={pending}>
                  Undo last pick
                </SmallBtn>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                {state?.isPaused ? (
                  <SmallBtn onClick={() => run("Resumed", () => resumeDraft(seasonId))} disabled={pending}>Resume</SmallBtn>
                ) : (
                  <SmallBtn onClick={() => run("Paused", () => pauseDraft(seasonId))} disabled={pending}>Pause</SmallBtn>
                )}
                <SmallBtn onClick={() => run("+15s", () => extendClock(seasonId, 15))} disabled={pending}>+15s</SmallBtn>
                <SmallBtn onClick={() => run("−15s", () => extendClock(seasonId, -15))} disabled={pending}>−15s</SmallBtn>
                <SmallBtn onClick={() => run("Auto-picked", () => autoPickIfExpired(seasonId, true))} disabled={pending}>Auto-pick now</SmallBtn>
                <SmallBtn onClick={() => run("Undone", () => undoLastPick(seasonId))} disabled={pending}>Undo</SmallBtn>
              </div>
            ))}
        </div>

        {/* Set on-clock override */}
        {!isComplete && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">Set on-clock</div>
            <Select
              value=""
              disabled={pending}
              onValueChange={(v) => {
                if (v) run("On-clock set", () => setOnClock(seasonId, v));
              }}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choose team…" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Draft order rail */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">Order</div>
          <ol className="mt-3 space-y-1">
            {snapshot.order.map((id, i) => {
              const t = teamById.get(id);
              const active = id === state?.onClockTeamId;
              return (
                <li key={id} className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm ${active ? "bg-thl-orange/15 font-bold text-thl-orange" : ""}`}>
                  <span className="w-5 text-center text-neutral-400">{i + 1}</span>
                  <span className="truncate">{t?.name ?? "—"}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Make pick + rosters */}
      <div className="space-y-6">
        {!isComplete && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">Make pick</div>
              <span className="text-xs text-neutral-400">
                {pool.length} available · <kbd className="font-sans">/</kbd> search · ↑↓ Enter
              </span>
            </div>
            <Input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Search players…  (press / )"
              className="mt-1.5"
            />
            <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto">
              {filtered.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmId(p.id)}
                    onMouseEnter={() => setHighlight(i)}
                    data-selected={i === highlight}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition disabled:opacity-50 ${
                      i === highlight
                        ? "border-thl-orange bg-thl-orange/10"
                        : "border-neutral-200 hover:border-thl-orange dark:border-neutral-800"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</span>
                    <RankBadge value={p.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-1 py-4 text-sm text-neutral-500">No matches.</li>}
            </ul>
          </div>
        )}

        {/* Rosters */}
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map((t) => (
            <RosterCard
              key={t.id}
              team={t}
              picks={snapshot.picks.filter((p) => p.teamId === t.id)}
              picksPerTeam={snapshot.picksPerTeam}
              allTeams={teams}
              seasonId={seasonId}
              pending={pending}
              run={run}
            />
          ))}
        </div>
      </div>

      {/* Confirm pick */}
      <Dialog open={Boolean(confirmPlayer)} onOpenChange={(open) => !open && setConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              <span className="block text-xs font-bold tracking-[0.2em] text-thl-orange uppercase">
                Confirm pick
              </span>
              <span className="mt-2 block text-2xl font-bold tracking-tight">{confirmPlayer?.name}</span>
              <span className="mt-1 block text-sm font-normal text-neutral-500">
                to {onClock?.name ?? "—"}
              </span>
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={() => {
                if (!confirmPlayer) return;
                const pid = confirmPlayer.id;
                setConfirmId(null);
                setQuery("");
                run("Pick made", () => makePick({ seasonId, profileId: pid }));
              }}
            >
              Draft player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RosterCard({
  team,
  picks,
  picksPerTeam,
  allTeams,
  seasonId,
  pending,
  run,
}: {
  team: DraftTeam;
  picks: DraftSnapshot["picks"];
  picksPerTeam: number;
  allTeams: DraftTeam[];
  seasonId: string;
  pending: boolean;
  run: (label: string, fn: () => Promise<Result>) => void;
}) {
  const needs = Math.max(0, picksPerTeam - picks.length);
  return (
    <div
      className={`rounded-2xl border bg-white p-4 dark:bg-neutral-950 ${
        needs === 0 ? "border-emerald-500/40" : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-bold">{team.name}</span>
        <span
          className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
            needs === 0
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-thl-orange/15 text-thl-orange"
          }`}
        >
          {needs === 0 ? "Full" : `Needs ${needs}`}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {team.captain && (
          <li className="flex items-center gap-2 text-xs">
            <span className="rounded bg-thl-orange/15 px-1 text-[9px] font-bold text-thl-orange uppercase">C</span>
            <span className="truncate">{team.captain.name}</span>
          </li>
        )}
        {picks.map((p) => (
          <li key={p.id} className="group flex items-center gap-2 text-xs">
            <span className="w-4 text-center text-neutral-400">{p.round}</span>
            <span className="min-w-0 flex-1 truncate">{p.player?.name ?? "—"}</span>
            {p.player?.id && (
              <MovePlayer
                profileId={p.player.id}
                fromTeamId={team.id}
                allTeams={allTeams}
                seasonId={seasonId}
                pending={pending}
                run={run}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Per-player "move to team" control for league-ops trades / corrections. */
function MovePlayer({
  profileId,
  fromTeamId,
  allTeams,
  seasonId,
  pending,
  run,
}: {
  profileId: string;
  fromTeamId: string;
  allTeams: DraftTeam[];
  seasonId: string;
  pending: boolean;
  run: (label: string, fn: () => Promise<Result>) => void;
}) {
  const others = allTeams.filter((t) => t.id !== fromTeamId);
  if (others.length === 0) return null;
  return (
    <Select
      value=""
      disabled={pending}
      onValueChange={(toTeamId) => {
        if (toTeamId) run("Player moved", () => movePlayer(seasonId, profileId, toTeamId));
      }}
    >
      <SelectTrigger
        aria-label="Move player to another team"
        title="Move to another team"
        className="h-6 w-auto shrink-0 gap-1 rounded-md border-0 bg-neutral-100 px-1.5 text-neutral-400 transition hover:bg-thl-orange/15 hover:text-thl-orange dark:bg-neutral-800"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
      </SelectTrigger>
      <SelectContent>
        {others.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            Move to {t.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------- shared bits --------------------------------------------------

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

/** Glass button for the dark broadcast cockpit panel (shadcn Button underneath). */
function SmallBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="border-0 bg-white/10 text-white hover:bg-white/20"
    >
      {children}
    </Button>
  );
}
