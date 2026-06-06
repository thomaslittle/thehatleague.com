"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { submitPrediction, reportMatchResult, castMvpVote } from "@/app/actions/tournament";

interface VotablePlayer {
  id: string;
  name: string;
  teamName: string;
}

/** MVP voting for a final match — any signed-in player picks one. */
export function MvpVote({
  matchId,
  players,
  tally,
  myVote,
  canVote,
}: {
  matchId: string;
  players: VotablePlayer[];
  tally: Record<string, number>;
  myVote: string | null;
  canVote: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  const ranked = [...players].sort((a, b) => (tally[b.id] ?? 0) - (tally[a.id] ?? 0));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        MVP vote · {total} cast
      </div>
      <ul className="mt-3 space-y-1">
        {ranked.map((p) => {
          const votes = tally[p.id] ?? 0;
          const mine = myVote === p.id;
          return (
            <li key={p.id} className="flex items-center gap-3">
              {canVote ? (
                <Button
                  variant={mine ? "default" : "outline"}
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await castMvpVote(matchId, p.id);
                      if (res.error) toast.error(res.error);
                      else toast.success(`Voted ${p.name}`);
                    })
                  }
                  className="min-w-0 flex-1 justify-start"
                >
                  {mine && <Check className="h-3.5 w-3.5" aria-hidden />}
                  <span className="truncate">{p.name}</span>
                </Button>
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
              )}
              <span className="font-bold text-thl-orange tabular-nums">{votes}</span>
            </li>
          );
        })}
        {players.length === 0 && <li className="text-sm text-neutral-500">No eligible players.</li>}
      </ul>
    </div>
  );
}

interface TeamLite {
  id: string;
  name: string;
}

/** Predict-winner buttons + live tally bar. Any signed-in player. */
export function PredictionBox({
  matchId,
  home,
  away,
  homeVotes,
  awayVotes,
  myPick,
  canPredict,
}: {
  matchId: string;
  home: TeamLite;
  away: TeamLite;
  homeVotes: number;
  awayVotes: number;
  myPick: string | null;
  canPredict: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const total = homeVotes + awayVotes;
  const homePct = total ? Math.round((homeVotes / total) * 100) : 50;

  const predict = (teamId: string) => {
    startTransition(async () => {
      const res = await submitPrediction(matchId, teamId);
      if (res.error) toast.error(res.error);
      else toast.success("Prediction locked in");
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        Fan prediction · {total} vote{total === 1 ? "" : "s"}
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div className="bg-thl-orange" style={{ width: `${homePct}%` }} />
        <div className="bg-thl-fedora" style={{ width: `${100 - homePct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-bold">
        <span>
          {home.name} · {homePct}%
        </span>
        <span>
          {away.name} · {100 - homePct}%
        </span>
      </div>
      {canPredict && (
        <div className="mt-4 flex gap-2">
          {[home, away].map((t) => (
            <Button
              key={t.id}
              variant={myPick === t.id ? "default" : "outline"}
              disabled={pending}
              onClick={() => predict(t.id)}
              className="flex-1"
            >
              {myPick === t.id && <Check className="h-3.5 w-3.5" aria-hidden />}
              {t.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Result-report form for involved captains / league ops. */
export function ReportResultForm({
  matchId,
  home,
  away,
  bestOf,
}: {
  matchId: string;
  home: TeamLite;
  away: TeamLite;
  bestOf: number;
}) {
  const [pending, startTransition] = useTransition();
  const winGames = Math.ceil((bestOf + 1) / 2);
  const [homeScore, setHomeScore] = useState(winGames);
  const [awayScore, setAwayScore] = useState(0);

  const submit = () => {
    startTransition(async () => {
      const res = await reportMatchResult({ matchId, homeScore, awayScore });
      if (res.error) toast.error(res.error);
      else toast.success("Result reported");
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        Report result · best of {bestOf}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Field label={home.name}>
          <Input
            type="number"
            min={0}
            max={winGames}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="text-lg font-bold tabular-nums"
          />
        </Field>
        <Field label={away.name}>
          <Input
            type="number"
            min={0}
            max={winGames}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="text-lg font-bold tabular-nums"
          />
        </Field>
      </div>
      <Button size="lg" disabled={pending} onClick={submit} className="mt-4 w-full">
        Submit final
      </Button>
    </div>
  );
}
