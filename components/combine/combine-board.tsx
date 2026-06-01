"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Clock, Plus, ExternalLink } from "lucide-react";
import { rankWeight } from "@/lib/data/rank-sort";
import { RankBadge } from "@/components/ranks/rank-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CombineClips } from "@/components/combine/combine-clips";
import { addToQueue } from "@/app/actions/draft-queue";
import type { CombineEntry } from "@/lib/data/combine";

/** Captains browse the combine field — filter by role, sort by rank, queue. */
export function CombineBoard({
  seasonId,
  entries,
  captainTeamId,
}: {
  seasonId: string;
  entries: CombineEntry[];
  captainTeamId: string | null;
}) {
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState<"peak" | "name">("peak");

  const roles = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.preferredRole) set.add(e.preferredRole);
    return [...set];
  }, [entries]);

  const shown = useMemo(() => {
    return entries
      .filter((e) => role === "all" || e.preferredRole === role)
      .sort((a, b) =>
        sort === "name"
          ? a.name.localeCompare(b.name)
          : rankWeight(b.peakRank) - rankWeight(a.peakRank),
      );
  }, [entries, role, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-auto min-w-[150px] whitespace-nowrap">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as "peak" | "name")}>
          <SelectTrigger className="w-auto min-w-[150px] whitespace-nowrap">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="peak">Sort: Peak rank</SelectItem>
            <SelectItem value="name">Sort: Name</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-neutral-400">{shown.length} prospects</span>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
          No combine submissions yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <ProspectCard key={e.profileId} entry={e} seasonId={seasonId} captainTeamId={captainTeamId} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProspectCard({
  entry,
  seasonId,
  captainTeamId,
}: {
  entry: CombineEntry;
  seasonId: string;
  captainTeamId: string | null;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start gap-3">
        {entry.avatarUrl ? (
          <Image
            src={entry.avatarUrl}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
            {entry.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">
            {entry.username ? (
              <Link href={`/players/${encodeURIComponent(entry.username)}`} className="hover:text-thl-orange">
                {entry.name}
              </Link>
            ) : (
              entry.name
            )}
          </div>
          {entry.preferredRole && (
            <span className="mt-1 inline-block rounded-md bg-thl-orange/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-thl-orange uppercase">
              {entry.preferredRole}
              {entry.secondaryRole ? ` / ${entry.secondaryRole}` : ""}
            </span>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <RankCell label="Peak" value={entry.peakRank} />
        <RankCell label="3v3" value={entry.rank3v3} />
        <RankCell label="2v2" value={entry.rank2v2} />
      </dl>

      {entry.notes && <p className="mt-3 line-clamp-3 text-sm text-neutral-500">{entry.notes}</p>}
      {entry.availability && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {entry.availability}
        </p>
      )}

      <CombineClips clips={entry.clipUrls} name={entry.name} className="mt-4" />

      {entry.trackerUrl && (
        <div className="mt-3 text-xs font-semibold">
          <a
            href={entry.trackerUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-neutral-500 underline-offset-4 hover:text-thl-orange hover:underline"
          >
            Tracker <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      )}

      {captainTeamId && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await addToQueue(seasonId, captainTeamId, entry.profileId);
              if (res.error) toast.error(res.error);
              else toast.success(`Queued ${entry.name}`);
            })
          }
          className="mt-4"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Add to my queue
        </Button>
      )}
    </div>
  );
}

function RankCell({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-2 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-[9px] font-bold tracking-[0.18em] text-neutral-500 uppercase">{label}</div>
      <div className="mt-0.5">
        <RankBadge value={value} size={18} abbreviate textClassName="text-xs font-bold" />
      </div>
    </div>
  );
}
