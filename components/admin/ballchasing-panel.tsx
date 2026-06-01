"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupBallchasingGroup } from "@/app/actions/ballchasing";
import type { BallchasingGroupSummary } from "@/lib/ballchasing";

/** League-ops tool: pull a ballchasing group's aggregated player stats. */
export function BallchasingPanel() {
  const [pending, startTransition] = useTransition();
  const [groupId, setGroupId] = useState("");
  const [summary, setSummary] = useState<BallchasingGroupSummary | null>(null);

  const lookup = () => {
    startTransition(async () => {
      const res = await lookupBallchasingGroup(groupId);
      if (res.error) {
        toast.error(res.error);
        setSummary(null);
      } else if (res.summary) {
        setSummary(res.summary);
        toast.success(`Loaded ${res.summary.players.length} players`);
      }
    });
  };

  return (
    <div className="mt-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-lg font-bold tracking-tight">Ballchasing import</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Paste a ballchasing.com group id or URL to pull aggregated match-night stats.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            placeholder="ballchasing.com/group/<id>  or just the id"
            className="min-w-0 flex-1"
          />
          <Button onClick={lookup} disabled={pending || !groupId.trim()}>
            {pending ? "Loading…" : "Fetch"}
          </Button>
        </div>

        {summary && (
          <div className="mt-5">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              {summary.label}
            </div>
            {summary.players.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">No player stats in this group yet.</p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-[10px] font-bold tracking-[0.16em] text-neutral-500 uppercase dark:border-neutral-800">
                      <th className="px-3 py-2">Player</th>
                      <th className="px-2 py-2 text-center">GP</th>
                      <th className="px-2 py-2 text-center">G</th>
                      <th className="px-2 py-2 text-center">A</th>
                      <th className="px-2 py-2 text-center">SV</th>
                      <th className="px-2 py-2 text-center">Demos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.players.map((p) => (
                      <tr key={p.player} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
                        <td className="px-3 py-1.5 font-semibold">{p.player}</td>
                        <td className="px-2 py-1.5 text-center tabular-nums">{p.matches}</td>
                        <td className="px-2 py-1.5 text-center tabular-nums">{p.goals}</td>
                        <td className="px-2 py-1.5 text-center tabular-nums">{p.assists}</td>
                        <td className="px-2 py-1.5 text-center tabular-nums">{p.saves}</td>
                        <td className="px-2 py-1.5 text-center tabular-nums">{p.demos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
