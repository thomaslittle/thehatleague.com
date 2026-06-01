import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { RankBadge } from "@/components/ranks/rank-badge";
import { getActiveSeason } from "@/lib/data/season";
import { loadTeamBySlug } from "@/lib/data/tournament";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TeamChatButton } from "@/components/social/team-chat-button";
import { loadAssets } from "@/lib/data/assets";
import { AssetGallery } from "@/components/assets/asset-gallery";
import { AssetSubmit } from "@/components/assets/asset-submit";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const season = await getActiveSeason();
  const data = season ? await loadTeamBySlug(season.id, slug) : null;
  return { title: data ? data.team.name : "Team" };
}

export default async function TeamPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const season = await getActiveSeason();
  const data = season ? await loadTeamBySlug(season.id, slug) : null;
  if (!data) notFound();
  const { team, roster, matches, record } = data;

  // Team-chat button only for members of this team.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isMember = false;
  let canModerate = false;
  if (user) {
    const [{ count }, { data: prof }] = await Promise.all([
      supabase
        .from("team_members")
        .select("team_id", { count: "exact", head: true })
        .eq("team_id", team.id)
        .eq("profile_id", user.id),
      supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle(),
    ]);
    isMember = (count ?? 0) > 0;
    canModerate = Boolean(prof?.is_admin);
  }
  const teamAssets = await loadAssets("team", team.id, user?.id ?? null);

  return (
    <PageShell>
      <RealtimeRefresh tables={["matches", "team_members"]} channel={`team:${team.id}`} />

      <section className="mx-auto max-w-[1100px] px-6 pt-12 md:px-10">
        <div className="flex items-center gap-4">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold text-white"
            style={{ background: team.color ?? "var(--color-thl-orange)" }}
          >
            {team.name.slice(0, 1)}
          </span>
          <div>
            <div className="text-xs font-bold tracking-[0.22em] text-thl-orange uppercase">
              {team.conference ?? "League"}
            </div>
            <h1 className="text-4xl font-bold tracking-[-0.03em] md:text-5xl">{team.name}</h1>
          </div>
          {isMember && <TeamChatButton teamId={team.id} className="ml-auto shrink-0" />}
        </div>

        <div className="mt-6 flex flex-wrap gap-8">
          <Stat label="Record" value={`${record.w}–${record.l}`} />
          <Stat label="Games" value={String(record.gp)} />
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-[1100px] gap-6 px-6 pb-10 md:px-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-xl font-bold tracking-tight">Roster</h2>
          <ul className="mt-3 space-y-1.5">
            {roster.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                {p.isCaptain && (
                  <span className="rounded bg-thl-orange/15 px-1 text-[9px] font-bold text-thl-orange uppercase">C</span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {p.username ? (
                    <Link href={`/players/${encodeURIComponent(p.username)}`} className="hover:text-thl-orange">
                      {p.name}
                    </Link>
                  ) : (
                    p.name
                  )}
                </span>
                <RankBadge value={p.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
              </li>
            ))}
            {roster.length === 0 && <li className="text-sm text-neutral-500">Roster fills on draft night.</li>}
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-xl font-bold tracking-tight">Schedule</h2>
          <ul className="mt-3 space-y-1.5">
            {matches.map((m) => {
              const isHome = m.home?.id === team.id;
              const opponent = isHome ? m.away : m.home;
              const isFinal = m.status === "final";
              const won = m.winnerTeamId === team.id;
              // Score from THIS team's perspective (own score first).
              const myScore = isHome ? m.homeScore : m.awayScore;
              const oppScore = isHome ? m.awayScore : m.homeScore;
              return (
                <li key={m.id}>
                  <Link
                    href={`/matches/${m.id}`}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 transition hover:border-thl-orange dark:border-neutral-800"
                  >
                    <span className="w-10 shrink-0 text-xs text-neutral-400">
                      {m.week ? `W${m.week}` : "—"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      vs {opponent?.name ?? "TBD"}
                    </span>
                    {isFinal ? (
                      <span className={`text-xs font-bold ${won ? "text-emerald-500" : "text-neutral-400"}`}>
                        {won ? "W" : "L"} {myScore}-{oppScore}
                      </span>
                    ) : (
                      <span className="text-xs text-thl-orange">upcoming</span>
                    )}
                  </Link>
                </li>
              );
            })}
            {matches.length === 0 && <li className="text-sm text-neutral-500">No matches scheduled yet.</li>}
          </ul>
        </div>
      </section>

      {(teamAssets.length > 0 || user) && (
        <section className="mx-auto max-w-[1100px] px-6 pb-24 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">Team highlights</h2>
            {user && <AssetSubmit targetType="team" targetId={team.id} />}
          </div>
          {teamAssets.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No team highlights yet.</p>
          ) : (
            <div className="mt-4">
              <AssetGallery assets={teamAssets} canModerate={canModerate} />
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">{label}</div>
      <div className="mt-0.5 text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
