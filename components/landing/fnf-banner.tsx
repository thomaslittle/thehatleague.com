import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Swords, Trophy } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanDiscordUsername } from "@/lib/discord/name";
import { RankBadge } from "@/components/ranks/rank-badge";
import { LocalTime } from "@/components/fnf/local-time";

type ChampPlayer = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  rank: string | null;
};

/**
 * Landing-page Friday Nite Fights block. While a tournament is open/live it's a
 * promo CTA; once a champion is crowned (the playoff final has a winner) it
 * flips to a celebration that features the winning team's players.
 */
export async function FnfBanner() {
  const supabase = await createSupabaseServerClient();
  const { data: tournament } = await supabase
    .from("fnf_tournaments")
    .select("id, status, swiss_rounds, playoff_cut, starts_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!tournament) return null;

  // Champion = winner of the final (highest playoff round) once it's decided.
  let champion: { teamName: string; players: ChampPlayer[] } | null = null;
  if (tournament.status === "playoffs" || tournament.status === "complete") {
    const { data: po } = await supabase
      .from("fnf_matches")
      .select("round, winner_team_id")
      .eq("tournament_id", tournament.id)
      .eq("stage", "playoffs");
    if (po && po.length > 0) {
      const maxRound = Math.max(...po.map((m) => m.round));
      const finalMatch = po.find((m) => m.round === maxRound);
      const champTeamId = finalMatch?.winner_team_id ?? null;
      if (champTeamId) {
        const [{ data: team }, { data: members }] = await Promise.all([
          supabase.from("fnf_teams").select("name").eq("id", champTeamId).single(),
          supabase
            .from("fnf_team_members")
            .select("profile_id")
            .eq("team_id", champTeamId),
        ]);
        const ids = (members ?? []).map((m) => m.profile_id);
        const { data: profiles } = ids.length
          ? await supabase
              .from("profiles")
              .select(
                "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, peak_rank",
              )
              .in("id", ids)
          : { data: [] };
        champion = {
          teamName: team?.name ?? "Champions",
          players: (profiles ?? []).map((p) => ({
            id: p.id,
            name:
              p.discord_global_name ??
              cleanDiscordUsername(p.discord_username) ??
              "Player",
            username: cleanDiscordUsername(p.discord_username),
            avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url ?? null,
            rank: p.peak_rank,
          })),
        };
      }
    }
  }

  if (champion) {
    return <ChampionBanner teamName={champion.teamName} players={champion.players} />;
  }

  const { count } = await supabase
    .from("fnf_registrations")
    .select("profile_id", { count: "exact", head: true })
    .eq("tournament_id", tournament.id);

  const live = tournament.status === "swiss" || tournament.status === "playoffs";
  const open = tournament.status === "registration";
  const label = live
    ? "Live now"
    : open
      ? "Registration open"
      : tournament.status === "teams"
        ? "Teams locked"
        : "Results";
  const cta = open ? "Enter tonight" : live ? "Watch it live" : "View bracket";
  const showStart = open && tournament.starts_at;

  return (
    <section className="px-6 py-8 md:px-10 md:py-12">
      <Link
        href="/friday-nite-fights"
        className="group relative mx-auto flex max-w-[1320px] flex-col items-center gap-8 overflow-hidden rounded-3xl border border-thl-orange/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-7 shadow-2xl shadow-black/40 md:flex-row md:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-thl-orange/30 blur-3xl transition-opacity duration-500 group-hover:opacity-90 md:size-96"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-amber-500/20 blur-3xl"
        />

        <div className="relative aspect-square w-36 shrink-0 md:w-52">
          <Image
            src="/brand/fnf.png"
            alt="Friday Nite Fights"
            fill
            sizes="208px"
            className="object-contain drop-shadow-[0_8px_40px_rgba(255,107,0,0.45)] transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="relative flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-thl-orange/40 bg-thl-orange/10 px-3 py-1 text-[11px] font-bold tracking-widest text-thl-orange uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-thl-orange" />
            {label} · Every Friday · 2v2
          </span>
          <h2 className="mt-4 text-4xl leading-[0.95] font-bold tracking-tight text-white md:text-6xl">
            Friday Nite{" "}
            <span className="font-marker font-normal text-thl-orange">Fights</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-300 md:mx-0 md:text-base">
            Connect Discord and we auto-build rank-balanced 2v2 teams. Battle
            through {tournament.swiss_rounds} Swiss rounds — top{" "}
            {tournament.playoff_cut} make the playoffs.
            {showStart ? (
              <>
                {" "}
                Starts <LocalTime iso={tournament.starts_at!} />.
              </>
            ) : (
              ""
            )}
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row md:items-center md:justify-start">
            <span className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-thl-orange to-amber-500 px-7 text-base font-bold text-white shadow-lg shadow-thl-orange/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-thl-orange/40">
              <Swords className="size-5" />
              {cta}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </span>
            {typeof count === "number" && count > 0 && (
              <span className="text-sm font-semibold text-neutral-400">
                {count} {count === 1 ? "player" : "players"} entered
              </span>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}

/** Celebration banner shown once the FNF champion is crowned. */
function ChampionBanner({
  teamName,
  players,
}: {
  teamName: string;
  players: ChampPlayer[];
}) {
  return (
    <section className="px-6 py-8 md:px-10 md:py-12">
      <div className="relative mx-auto flex max-w-[1320px] flex-col items-center gap-8 overflow-hidden rounded-3xl border border-thl-orange/40 bg-gradient-to-br from-thl-orange/[0.12] via-neutral-950 to-black p-7 shadow-2xl shadow-black/40 md:flex-row md:gap-12 md:p-10">
        {/* signature dotted-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px]"
        />
        {/* glow accents */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-20 size-80 rounded-full bg-thl-orange/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-amber-500/15 blur-3xl"
        />

        {/* FNF logo — the feature owns the wide space with the brand mark. */}
        <div className="relative aspect-square w-40 shrink-0 md:w-56">
          <Image
            src="/brand/fnf.png"
            alt="Friday Nite Fights"
            fill
            sizes="224px"
            className="object-contain drop-shadow-[0_8px_40px_rgba(255,107,0,0.45)]"
          />
        </div>

        {/* Champions showcase */}
        <div className="relative flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-thl-orange/40 bg-thl-orange/10 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            <Trophy className="size-3.5 text-amber-400" /> Friday Nite Fights
            Champions
          </span>

          <h2 className="mt-3 text-4xl leading-[0.95] font-extrabold tracking-tight text-white md:text-6xl">
            {teamName}
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm text-neutral-300 md:mx-0">
            This week&apos;s 2v2 champions — auto-balanced, Swiss-tested, last
            team standing.
          </p>

          {/* Featured players */}
          <div className="mt-6 flex flex-wrap items-start justify-center gap-6 md:justify-start md:gap-10">
            {players.map((p) => {
              const card = (
                <>
                  <div className="relative">
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-300 to-thl-orange opacity-70 blur-[2px]" />
                    <div className="relative size-16 overflow-hidden rounded-full ring-2 ring-amber-300/90 md:size-20">
                      {p.avatarUrl ? (
                        <Image
                          src={p.avatarUrl}
                          alt={p.name}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-300 group-hover/champ:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-lg font-bold text-neutral-300">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1.5 left-1/2 inline-flex -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-black uppercase shadow">
                      Champ
                    </span>
                  </div>
                  <div className="mt-3.5 text-base font-bold text-white">{p.name}</div>
                  {p.rank && (
                    <div className="mt-1 flex justify-center">
                      <RankBadge
                        value={p.rank}
                        size={16}
                        abbreviate
                        textClassName="text-xs font-semibold text-amber-200"
                      />
                    </div>
                  )}
                </>
              );
              return p.username ? (
                <Link
                  key={p.id}
                  href={`/players/${encodeURIComponent(p.username)}`}
                  className="group/champ flex flex-col items-center"
                >
                  {card}
                </Link>
              ) : (
                <div key={p.id} className="flex flex-col items-center">
                  {card}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA pinned to the right so the feature fills the full width. */}
        <Link
          href="/friday-nite-fights"
          className="group/cta relative inline-flex h-12 shrink-0 items-center justify-center gap-2 self-center rounded-xl bg-gradient-to-r from-thl-orange to-amber-500 px-7 text-sm font-bold text-black shadow-lg shadow-thl-orange/25 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Trophy className="size-4" />
          View the bracket
          <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
