"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reportMatch } from "@/app/actions/fnf";
import type { FnfMatchCard } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

/** A single matchup with inline score reporting for participants/admins. */
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
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [pending, startTransition] = useTransition();

  const isBye = !match.teamBId;
  const reported = match.status === "reported";
  const winA = reported && match.winnerTeamId === match.teamAId;
  const winB = reported && match.winnerTeamId === match.teamBId;
  const tbd = (n: string | null, label: string) => n ?? label;

  const submit = () => {
    const sa = Number(a);
    const sb = Number(b);
    if (!Number.isFinite(sa) || !Number.isFinite(sb) || sa === sb) {
      toast.error("Enter two different scores.");
      return;
    }
    startTransition(async () => {
      const res = await reportMatch(match.id, sa, sb);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Score reported.");
        setOpen(false);
        setA("");
        setB("");
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
          score={match.scoreA}
          win={winA}
          reported={reported}
        />
      </div>
      <div className="my-1 flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest text-neutral-300 dark:text-neutral-600">
          VS
        </span>
        <span className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
        {isBye && (
          <span className="text-[10px] font-bold text-thl-orange uppercase">
            Bye
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Row
          name={isBye ? "—" : tbd(match.teamBName, "TBD")}
          seed={match.teamBSeed}
          score={match.scoreB}
          win={winB}
          reported={reported}
        />
      </div>

      {!reported && !isBye && match.teamAId && match.teamBId && (
        <div className="mt-2.5">
          {open ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder={match.teamAName ?? "A"}
                className="h-8 w-14 rounded-md border border-neutral-300 bg-white px-2 text-center text-sm tabular-nums dark:border-neutral-700 dark:bg-neutral-950"
                aria-label={`${match.teamAName} score`}
              />
              <span className="text-neutral-400">–</span>
              <input
                type="number"
                inputMode="numeric"
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder={match.teamBName ?? "B"}
                className="h-8 w-14 rounded-md border border-neutral-300 bg-white px-2 text-center text-sm tabular-nums dark:border-neutral-700 dark:bg-neutral-950"
                aria-label={`${match.teamBName} score`}
              />
              <Button size="sm" onClick={submit} disabled={pending}>
                {pending ? "…" : "Submit"}
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
  score,
  win,
  reported,
}: {
  name: string;
  seed: number | null;
  score: number | null;
  win: boolean;
  reported: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5">
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
