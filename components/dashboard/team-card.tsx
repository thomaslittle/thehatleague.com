import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { loadSchedule, loadStandings } from "@/lib/data/tournament";
import { TeamChatButton } from "@/components/social/team-chat-button";

/**
 * Dashboard "your team / next matchup" card. Renders nothing until the viewer
 * is rostered on a team in the active season, so it stays invisible pre-draft.
 */
export async function DashboardTeamCard({ userId }: { userId: string }) {
  const season = await getActiveSeason();
  if (!season) return null;

  const supabase = await createSupabaseServerClient();
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, teams:team_id(name, slug, color, conference)")
    .eq("season_id", season.id)
    .eq("profile_id", userId)
    .maybeSingle();
  if (!membership) return null;

  const team = membership.teams as unknown as {
    name: string;
    slug: string;
    color: string | null;
    conference: string | null;
  } | null;
  if (!team) return null;

  const [schedule, standings] = await Promise.all([
    loadSchedule(season.id),
    loadStandings(season.id),
  ]);
  const mine = schedule.filter(
    (m) => m.home?.id === membership.team_id || m.away?.id === membership.team_id,
  );
  const nextMatch = mine.find((m) => m.status !== "final") ?? null;
  const row = standings.find((s) => s.teamId === membership.team_id);

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center gap-4 border-b border-neutral-200 p-6 dark:border-neutral-800">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
          style={{ background: team.color ?? "var(--color-thl-orange)" }}
        >
          {team.name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            Your team · {team.conference ?? "League"}
          </div>
          <Link href={`/teams/${team.slug}`} className="text-2xl font-bold tracking-tight hover:text-thl-orange md:text-3xl">
            {team.name}
          </Link>
          {row && (
            <div className="text-sm text-neutral-500">
              {row.w}–{row.l} · {row.diff >= 0 ? "+" : ""}
              {row.diff} diff
            </div>
          )}
        </div>
        <TeamChatButton teamId={membership.team_id} className="ml-auto shrink-0" />
      </div>

      <div className="p-6">
        <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
          Next matchup
        </div>
        {nextMatch ? (
          <Link
            href={`/matches/${nextMatch.id}`}
            className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-thl-orange dark:border-neutral-800"
          >
            <span className="text-sm font-bold">
              vs{" "}
              {nextMatch.home?.id === membership.team_id
                ? nextMatch.away?.name
                : nextMatch.home?.name}
            </span>
            <span className="text-xs text-thl-orange">
              {nextMatch.week ? `Week ${nextMatch.week}` : "TBD"} →
            </span>
          </Link>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">
            No upcoming matches — check the{" "}
            <Link href="/schedule" className="text-thl-orange underline-offset-4 hover:underline">
              schedule
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
