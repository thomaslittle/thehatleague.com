"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportMatch } from "@/app/actions/fnf";
import type { FnfMatchCard } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

type GameInput = { a: string; b: string };

/** A single matchup. Reporters enter each game's score (a Swiss series is a
 *  fixed N games; a playoff series is best-of-N). Admins can edit a reported
 *  result. */
export function MatchCard({
  match,
  canReport,
}: {
  match: FnfMatchCard;
  /** Viewer is on one of the teams, or is an admin. */
  canReport: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isBye = !match.teamBId;
  const isSwiss = match.stage === "swiss";
  const reported = match.status === "reported";
  const winA = reported && match.winnerTeamId === match.teamAId;
  const winB = reported && match.winnerTeamId === match.teamBId;
  const isDraw =
    reported && match.scoreA != null && match.scoreA === match.scoreB;
  const tbd = (n: string | null, label: string) => n ?? label;

  const numGames = Math.max(1, match.bestOf);
  const [games, setGames] = useState<GameInput[]>(() =>
    Array.from({ length: numGames }, () => ({ a: "", b: "" })),
  );

  const startEdit = () => {
    const prefilled: GameInput[] = Array.from({ length: numGames }, (_, i) => {
      const g = match.games[i];
      return g ? { a: String(g[0]), b: String(g[1]) } : { a: "", b: "" };
    });
    setGames(prefilled);
    setOpen(true);
  };

  const setGame = (i: number, side: "a" | "b", v: string) =>
    setGames((prev) =>
      prev.map((g, idx) => (idx === i ? { ...g, [side]: v } : g)),
    );

  const submit = () => {
    const filled: [number, number][] = [];
    for (const g of games) {
      if (g.a === "" && g.b === "") continue;
      const a = Number(g.a);
      const b = Number(g.b);
      if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) {
        toast.error("Enter a valid score for each game.");
        return;
      }
      filled.push([a, b]);
    }
    if (filled.length === 0) {
      toast.error("Enter at least one game's score.");
      return;
    }
    if (isSwiss && filled.length < numGames) {
      toast.error(`Enter both games (all ${numGames}).`);
      return;
    }
    startTransition(async () => {
      const res = await reportMatch(match.id, filled);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Score reported.");
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        reported
          ? "border-neutral-200 dark:border-neutral-800"
          : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Row
          name={tbd(match.teamAName, "TBD")}
          seed={match.teamASeed}
          members={match.teamAMembers}
          score={match.scoreA}
          win={winA}
          dim={reported && !winA && !isDraw && !isBye}
          reported={reported}
        />
      </div>
      <div className="my-1 flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest text-neutral-300 dark:text-neutral-600">
          VS
        </span>
        <span className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
        {isDraw && (
          <span className="text-[10px] font-bold text-amber-600 uppercase dark:text-amber-400">
            Draw
          </span>
        )}
        {isBye ? (
          <span className="text-[10px] font-bold text-thl-orange uppercase">
            Bye
          </span>
        ) : (
          <span className="text-[10px] font-bold text-neutral-400 tabular-nums">
            {isSwiss ? `${match.bestOf} games` : `Bo${match.bestOf}`}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Row
          name={isBye ? "—" : tbd(match.teamBName, "TBD")}
          seed={match.teamBSeed}
          members={isBye ? [] : match.teamBMembers}
          score={match.scoreB}
          win={winB}
          dim={reported && !winB && !isDraw}
          reported={reported}
        />
      </div>

      {/* Per-game breakdown once reported */}
      {reported && !isBye && match.games.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {match.games.map((g, i) => (
            <span key={i} className="tabular-nums">
              <span className="text-neutral-400">G{i + 1}</span> {g[0]}–{g[1]}
            </span>
          ))}
        </div>
      )}

      {/* Reporting / editing */}
      {!isBye && match.teamAId && match.teamBId && (
        <div className="mt-2.5">
          {open ? (
            <div className="space-y-1.5">
              {games.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-[10px] font-bold text-neutral-400">
                    G{i + 1}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={g.a}
                    onChange={(e) => setGame(i, "a", e.target.value)}
                    aria-label={`Game ${i + 1} ${match.teamAName} score`}
                    className="h-8 w-12 rounded-md border border-neutral-300 bg-white px-2 text-center text-sm tabular-nums dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={g.b}
                    onChange={(e) => setGame(i, "b", e.target.value)}
                    aria-label={`Game ${i + 1} ${match.teamBName} score`}
                    className="h-8 w-12 rounded-md border border-neutral-300 bg-white px-2 text-center text-sm tabular-nums dark:border-neutral-700 dark:bg-neutral-950"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-0.5">
                <Button size="sm" onClick={submit} disabled={pending}>
                  {pending ? "…" : "Save result"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : reported ? (
            canReport ? (
              <Button size="sm" variant="ghost" onClick={startEdit}>
                <Pencil className="size-3" /> Edit result
              </Button>
            ) : null
          ) : canReport ? (
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              Report score
            </Button>
          ) : (
            <p className="text-xs text-neutral-400">Awaiting result…</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  name,
  seed,
  members,
  score,
  win,
  dim = false,
  reported,
}: {
  name: string;
  seed: number | null;
  members: { name: string; avatarUrl: string | null }[];
  score: number | null;
  win: boolean;
  dim?: boolean;
  reported: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-start justify-between gap-2 transition-opacity",
        dim && "opacity-50",
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          {win && (
            <span className="size-1.5 shrink-0 rounded-full bg-thl-orange" />
          )}
          {seed != null && (
            <span className="text-[10px] font-bold text-neutral-400">
              #{seed}
            </span>
          )}
          <span
            className={cn(
              "truncate text-sm font-semibold",
              win && "text-thl-orange",
            )}
          >
            {name}
          </span>
        </span>
        {members.length > 0 && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-0.5">
            {members.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400"
              >
                {m.avatarUrl ? (
                  <Image
                    src={m.avatarUrl}
                    alt=""
                    width={14}
                    height={14}
                    className="size-3.5 shrink-0 rounded-full object-cover"
                    aria-hidden
                  />
                ) : null}
                <span className="truncate">{m.name}</span>
              </span>
            ))}
          </span>
        )}
      </div>
      {reported && score != null && (
        <span
          className={cn(
            "shrink-0 text-sm font-bold tabular-nums",
            win ? "text-thl-orange" : "text-neutral-400",
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}
