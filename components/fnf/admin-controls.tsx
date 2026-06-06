"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import {
  generateTeams,
  startSwiss,
  generatePlayoffs,
  type FnfActionState,
} from "@/app/actions/fnf";
import type { FnfStatus } from "@/lib/data/fnf";

/** League-ops controls — only rendered for admins. Drives the tournament
 *  phase transitions (generate teams → start swiss → playoffs). */
export function AdminControls({
  tournamentId,
  status,
  registeredCount,
  teamCount,
  playoffCut,
}: {
  tournamentId: string;
  status: FnfStatus;
  registeredCount: number;
  teamCount: number;
  playoffCut: number;
}) {
  const [pending, startTransition] = useTransition();
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
    <div className="rounded-xl border border-thl-orange/30 bg-thl-orange/[0.04] p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-thl-orange uppercase">
        <Settings2 className="size-3.5" /> League ops
      </div>
      <div className="flex flex-wrap gap-2">
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
  );
}
