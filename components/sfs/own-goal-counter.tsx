"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Beer, Goal, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logOwnGoal } from "@/app/actions/sfs";
import type {
  SfsOwnGoalStats,
  SfsTaggablePlayer,
} from "@/lib/data/sfs";

export function OwnGoalCounter({
  stats,
  players,
  isAuthenticated,
}: {
  stats: SfsOwnGoalStats;
  players: SfsTaggablePlayer[];
  isAuthenticated: boolean;
}) {
  return (
    <section>
      <div className="text-[10px] font-bold tracking-[0.28em] text-thl-orange uppercase">
        Wall of shame
      </div>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight md:text-3xl">
        The own-goal{" "}
        <span className="font-marker font-normal text-thl-orange">counter.</span>
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500 md:text-base dark:text-neutral-400">
        Someone scored on their own net? Log it. Tag the culprit and it lands on
        their profile forever. (Own goal = finish your drink, remember.)
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* The big counter + form */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-400/60 bg-gradient-to-br from-amber-400/15 to-thl-orange/10 p-6 text-center md:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(247,97,3,0.18)_1px,transparent_0)] [background-size:20px_20px]"
          />
          <div className="relative flex items-center justify-center gap-2 text-amber-500">
            <Goal className="size-5" />
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase">
              All-time own goals
            </span>
          </div>
          <div className="relative mt-1 font-marker text-7xl leading-none text-thl-orange md:text-8xl">
            {stats.total}
          </div>
          <div className="relative mt-1 text-xs font-semibold text-neutral-500">
            …and counting. 🫡
          </div>

          <div className="relative mt-6">
            {isAuthenticated ? (
              <OwnGoalForm players={players} />
            ) : (
              <Link
                href="/signin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-thl-orange px-6 text-sm font-bold text-black transition hover:bg-thl-orange-deep"
              >
                <Beer className="size-4" />
                Sign in to log one
              </Link>
            )}
          </div>
        </div>

        {/* Wall of shame leaderboard */}
        <div>
          {stats.leaders.length === 0 ? (
            <div className="flex h-full min-h-[12rem] items-center justify-center rounded-3xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
              No own goals logged yet. Give it time.
            </div>
          ) : (
            <ol className="space-y-2">
              {stats.leaders.slice(0, 10).map((l, i) => {
                const inner = (
                  <>
                    <span className="w-6 text-center text-sm font-extrabold tabular-nums text-neutral-400">
                      {i + 1}
                    </span>
                    {l.avatarUrl ? (
                      <Image
                        src={l.avatarUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="size-8 shrink-0 rounded-full object-cover"
                        aria-hidden
                      />
                    ) : (
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {l.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {l.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
                      <Goal className="size-3.5" />
                      {l.count}
                    </span>
                  </>
                );
                return (
                  <li
                    key={l.key}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                      i === 0
                        ? "border-amber-400/40 bg-amber-400/[0.06]"
                        : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    {l.username ? (
                      <Link
                        href={`/players/${encodeURIComponent(l.username)}`}
                        className="flex min-w-0 flex-1 items-center gap-3 hover:[&_span]:text-thl-orange"
                      >
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function OwnGoalForm({ players }: { players: SfsTaggablePlayer[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SfsTaggablePlayer | null>(null);
  const [useTyped, setUseTyped] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return players
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.username ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [players, query]);

  const reset = () => {
    setSelected(null);
    setUseTyped(false);
    setQuery("");
    setNote("");
  };

  const submit = () => {
    const payload = selected
      ? { profileId: selected.id }
      : useTyped
        ? { playerName: query.trim() }
        : null;
    if (!payload) {
      toast.error("Pick a player or tag a name.");
      return;
    }
    startTransition(async () => {
      const res = await logOwnGoal({ ...payload, note });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Own goal logged. Drink up. 🍺");
        reset();
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-left dark:border-neutral-800 dark:bg-neutral-950">
      {selected || useTyped ? (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-thl-orange/10 px-3 py-2">
          <span className="truncate text-sm font-bold text-thl-orange">
            {selected ? selected.name : query.trim()}
            {useTyped && (
              <span className="ml-1 text-[11px] font-medium text-neutral-500">
                (not on the site)
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={reset}
            aria-label="Clear"
            className="shrink-0 text-neutral-400 hover:text-thl-orange"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Who own-goaled?"
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-thl-orange focus:ring-2 focus:ring-thl-orange/30 dark:border-neutral-700 dark:bg-neutral-950"
          />
          {query.trim() && (
            <div className="mt-1.5 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
              {matches.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-thl-orange/10"
                >
                  {p.avatarUrl ? (
                    <Image
                      src={p.avatarUrl}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 rounded-full object-cover"
                      aria-hidden
                    />
                  ) : null}
                  <span className="truncate font-semibold">{p.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUseTyped(true)}
                className="flex w-full items-center gap-2 border-t border-neutral-100 px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900"
              >
                <Plus className="size-4" />
                Tag &ldquo;{query.trim()}&rdquo; (not on the site)
              </button>
            </div>
          )}
        </div>
      )}

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What happened? (optional)"
        maxLength={120}
        className="mt-2 h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
      />

      <Button
        onClick={submit}
        disabled={pending || (!selected && !useTyped)}
        className="mt-2 w-full bg-gradient-to-r from-thl-orange to-amber-500 font-bold text-white"
      >
        <Goal className="size-4" />
        {pending ? "Logging…" : "Log own goal"}
      </Button>
    </div>
  );
}
