"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsForm } from "@/components/fnf/settings-form";
import {
  generateTeams,
  startSwiss,
  generatePlayoffs,
  resetTournament,
  type FnfActionState,
} from "@/app/actions/fnf";
import type { FnfStatus } from "@/lib/data/fnf";

const PRIMARY =
  "bg-gradient-to-r from-thl-orange to-amber-500 text-white shadow-sm transition hover:shadow-md hover:brightness-105";

/** League-ops controls — only rendered for admins. Drives the tournament
 *  phase transitions and opens the format settings dialog. */
export function AdminControls({
  tournamentId,
  status,
  registeredCount,
  teamCount,
  name,
  swissRounds,
  swissGames,
  playoffBestOf,
  finalBestOf,
  playoffCut,
  startsAt,
}: {
  tournamentId: string;
  status: FnfStatus;
  registeredCount: number;
  teamCount: number;
  name: string;
  swissRounds: number;
  swissGames: number;
  playoffBestOf: number;
  finalBestOf: number;
  playoffCut: number;
  startsAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [showSettings, setShowSettings] = useState(false);
  const [showReset, setShowReset] = useState(false);
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
    <div className="overflow-hidden rounded-2xl border border-thl-orange/25 bg-gradient-to-br from-thl-orange/[0.08] via-thl-orange/[0.02] to-transparent">
      <div className="flex items-center justify-between gap-3 border-b border-thl-orange/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-thl-orange/15 text-thl-orange">
            <Shield className="size-3.5" />
          </span>
          <span className="text-xs font-bold tracking-[0.18em] text-thl-orange uppercase">
            League ops
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status !== "registration" && (
            <Button
              size="sm"
              variant="ghost"
              className="text-neutral-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              onClick={() => setShowReset(true)}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-thl-orange/40 text-thl-orange hover:bg-thl-orange/10 hover:text-thl-orange"
            onClick={() => setShowSettings(true)}
          >
            <SlidersHorizontal className="size-3.5" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3.5">
        {(status === "registration" || status === "teams") && (
          <Button
            size="sm"
            className={status === "teams" ? undefined : PRIMARY}
            variant={status === "teams" ? "outline" : undefined}
            disabled={pending || registeredCount < 2}
            onClick={() =>
              run(() => generateTeams(tournamentId), "Balanced teams generated.")
            }
          >
            <Sparkles className="size-3.5" />
            {status === "teams" ? "Re-generate teams" : "Auto-generate teams"}
          </Button>
        )}
        {status === "teams" && (
          <Button
            size="sm"
            className={PRIMARY}
            disabled={pending || teamCount < 2}
            onClick={() =>
              run(() => startSwiss(tournamentId), "Swiss round 1 is live!")
            }
          >
            <Swords className="size-3.5" />
            Lock rosters &amp; start Swiss
          </Button>
        )}
        {status === "complete" && (
          <Button
            size="sm"
            className={PRIMARY}
            disabled={pending}
            onClick={() =>
              run(
                () => generatePlayoffs(tournamentId),
                `Top ${playoffCut} bracket created.`,
              )
            }
          >
            <Trophy className="size-3.5" />
            Generate playoff bracket
          </Button>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
          {registeredCount} entered · {teamCount} teams
        </span>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="border border-neutral-200 bg-white p-6 sm:max-w-lg dark:border-neutral-800 dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>Tournament settings</DialogTitle>
            <DialogDescription>
              Format controls for this week&apos;s bracket. Changes apply going
              forward.
            </DialogDescription>
          </DialogHeader>
          <SettingsForm
            tournamentId={tournamentId}
            name={name}
            swissRounds={swissRounds}
            swissGames={swissGames}
            playoffBestOf={playoffBestOf}
            finalBestOf={finalBestOf}
            playoffCut={playoffCut}
            startsAt={startsAt}
            onClose={() => setShowSettings(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent className="border border-neutral-200 bg-white p-6 sm:max-w-md dark:border-neutral-800 dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>Reset to registration?</DialogTitle>
            <DialogDescription>
              This clears the generated teams and every match (Swiss and
              playoffs) and reopens registration. Your {registeredCount} signups
              are kept — you can re-generate teams from scratch. This can&apos;t
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => setShowReset(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await resetTournament(tournamentId);
                  if (res.error) toast.error(res.error);
                  else {
                    toast.success("Reset to registration.");
                    setShowReset(false);
                    router.refresh();
                  }
                })
              }
            >
              <RotateCcw className="size-3.5" />
              Reset tournament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
