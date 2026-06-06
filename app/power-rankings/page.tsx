import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { loadPowerRankings, type PowerRankRow } from "@/lib/data/tournament";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { PublishPowerRankings } from "@/components/tournament/publish-power-rankings";

export const metadata = {
  title: "Power rankings",
  description: "The Hat League power rankings — who's hot, who's not, week by week.",
};

export default async function PowerRankingsPage() {
  const season = await getActiveSeason();
  const data = season ? await loadPowerRankings(season.id) : null;

  let isAdmin = false;
  if (season) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      isAdmin = Boolean(profile?.is_admin);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow={`${season?.name ?? "Season 04"} · Power rankings`}
        title="Who's hot."
        accent="Who's not."
        subtitle={
          <>
            Our weekly read on every team — earned by results, graded on the
            curve. Movement arrows show the climb (or the slide) since last week.
          </>
        }
      />

      <section className="mx-auto max-w-[1100px] px-6 pb-24 md:px-10">
        {season && <RealtimeRefresh tables={["power_rankings"]} channel="power-rankings" />}

        {(isAdmin || data) && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="text-xs font-bold tracking-[0.22em] text-neutral-500 uppercase">
              {data ? `Week ${data.week}` : "Not published yet"}
            </div>
            {isAdmin && season && <PublishPowerRankings seasonId={season.id} />}
          </div>
        )}

        {data && data.rows.length > 0 ? (
          <ol className="space-y-3">
            {data.rows.map((r) => (
              <RankRow key={r.teamId} row={r} />
            ))}
          </ol>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
            Power rankings drop once the season is underway.
          </div>
        )}
      </section>
    </PageShell>
  );
}

function RankRow({ row }: { row: PowerRankRow }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span className="text-3xl font-extrabold text-thl-orange tabular-nums">{row.rank}</span>
        <Movement movement={row.movement} />
      </div>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
        style={{ background: row.color ?? "var(--color-thl-orange)" }}
      >
        {row.name.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        {row.slug ? (
          <Link href={`/teams/${row.slug}`} className="text-xl font-bold tracking-tight hover:text-thl-orange">
            {row.name}
          </Link>
        ) : (
          <span className="text-xl font-bold tracking-tight">{row.name}</span>
        )}
        {row.blurb && <p className="mt-0.5 text-sm text-neutral-500">{row.blurb}</p>}
      </div>
      {row.conference && (
        <span className="hidden shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-neutral-500 uppercase sm:inline dark:bg-neutral-900">
          {row.conference}
        </span>
      )}
    </li>
  );
}

function Movement({ movement }: { movement: number | null }) {
  if (movement == null) {
    return <span className="text-[10px] font-bold tracking-wide text-thl-fedora uppercase">New</span>;
  }
  if (movement === 0) {
    return <span className="text-xs text-neutral-400">—</span>;
  }
  const up = movement > 0;
  return (
    <span className={`text-xs font-bold ${up ? "text-emerald-500" : "text-red-500"}`}>
      {up ? "▲" : "▼"} {Math.abs(movement)}
    </span>
  );
}
