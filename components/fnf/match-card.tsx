"use client";

import Image from "next/image";
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
  const isSwiss = match.stage === "swiss";
  const reported = match.status === "reported";
  const winA = reported && match.winnerTeamId === match.teamAId;
  const winB = reported && match.winnerTeamId === match.teamBId;
  const isDraw =
    reported && match.scoreA != null && match.scoreA === match.scoreB;
  const tbd = (n: string | null, label: string) => n ?? label;

  const submit = () => {
    const sa = Number(a);
    const sb = Number(b);
    if (!Number.isFinite(sa) || !Number.isFinite(sb)) {
      toast.error("Enter both game scores.");
      return;
    }
    // Swiss is a fixed-game series and may end 1-1; playoffs need a winner.
    if (!isSwiss && sa === sb) {
      toast.error("Playoff matches need a winner.");
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
