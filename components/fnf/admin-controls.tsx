"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "@/components/fnf/settings-form";
import {
  generateTeams,
  startSwiss,
  generatePlayoffs,
  type FnfActionState,
} from "@/app/actions/fnf";
import type { FnfStatus } from "@/lib/data/fnf";

/** League-ops controls — only rendered for admins. Drives the tournament
 *  phase transitions (generate teams → start swiss → playoffs) and exposes the
 *  format settings. */
export function AdminControls({
  tournamentId,
  status,
  registeredCount,
  teamCount,
  name,
  swissRounds,
  swissBestOf,
  playoffBestOf,
  playoffCut,
  startsAt,
}: {
  tournamentId: string;
  status: FnfStatus;
  registeredCount: number;
  teamCount: number;
  name: string;
  swissRounds: number;
  swissBestOf: number;
  playoffBestOf: number;
  playoffCut: number;
  startsAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  const run = (fn: () => Promise<FnfActionState>, ok: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.error) toast.error(res.error);
      else {
        toast.success(ok);
        router.refresh();
      }
    });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-thl-orange/30 bg-thl-orange/[0.04] p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-thl-orange uppercase">
            <Settings2 className="size-3.5" /> League ops
          </div>
          <Button
            size="sm"
            variant="outline"
            aria-expanded={showSettings}
            onClick={() => setShowSettings((s) => !s)}
          >
            <SlidersHorizontal className="size-3.5" />
            Settings
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(status === "registration" || status === "teams") && (
            <Button
              size="sm"
              disabled={pending || registeredCount < 2}
              onClick={() =>
                run(
                  () => generateTeams(tournamentId),
                  "Balanced teams generated.",
                )
              }
            >
              {status === "teams" ? "Re-generate teams" : "Auto-generate teams"}
            </Button>
          )}
          {status === "teams" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={pending || teamCount < 2}
              onClick={() =>
                run(() => startSwiss(tournamentId), "Swiss round 1 is live!")
              }
            >
              Lock rosters &amp; start Swiss
            </Button>
          )}
          {status === "complete" && (
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                run(
                  () => generatePlayoffs(tournamentId),
                  `Top ${playoffCut} bracket created.`,
                )
              }
            >
              Generate playoff bracket
            </Button>
          )}
          <span className="self-center text-xs text-neutral-500">
            {registeredCount} registered · {teamCount} teams
          </span>
        </div>
      </div>

      {showSettings && (
        <SettingsForm
          tournamentId={tournamentId}
          name={name}
          swissRounds={swissRounds}
          swissBestOf={swissBestOf}
          playoffBestOf={playoffBestOf}
          playoffCut={playoffCut}
          startsAt={startsAt}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
