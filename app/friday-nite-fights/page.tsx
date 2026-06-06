import Image from "next/image";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFnfState } from "@/lib/data/fnf";
import { FnfRealtime } from "@/components/fnf/fnf-realtime";
import { RegisterButton } from "@/components/fnf/register-button";
import { AdminControls } from "@/components/fnf/admin-controls";
import { TeamEditor } from "@/components/fnf/team-editor";
import { RoundsView } from "@/components/fnf/rounds-view";
import { BracketView } from "@/components/fnf/bracket-view";
import { StandingsTable } from "@/components/fnf/standings-table";
import { EnteredList } from "@/components/fnf/entered-list";
import { LocalTime } from "@/components/fnf/local-time";
import type { FnfStatus } from "@/lib/data/fnf";

export const metadata = {
  title: "Friday Nite Fights",
  description:
    "The Hat League's weekly 2v2 Swiss tournament. Connect Discord, get auto-balanced teams by rank, and battle through Swiss into the playoffs.",
};

const STATUS_COPY: Record<FnfStatus, string> = {
  registration: "Registration open",
  teams: "Teams locked in",
  swiss: "Swiss in progress",
  playoffs: "Playoffs",
  complete: "Swiss complete",
};

export default async function FridayNiteFightsPage(
  props: PageProps<"/friday-nite-fights">,
) {
  // Optional ?id=<tournament> to view a specific (e.g. past) tournament. The
  // default with no id shows the active (most recent) one, so this never
  // changes what regular visitors see.
  const sp = await props.searchParams;
  const previewId = typeof sp.id === "string" ? sp.id : undefined;
  const state = await getFnfState(previewId);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!data?.is_admin;
  }

  if (!state) {
    return (
      <PageShell>
        <PageHero
          eyebrow="The Hat League"
          title="Friday Nite"
          accent="Fights"
          subtitle="No tournament is scheduled right now — check back Friday."
        />
      </PageShell>
    );
  }

  const { tournament, registrations, teams, matches, standings } = state;
  const isRegistered = !!user && registrations.some((r) => r.id === user.id);
  const viewerTeamIds = user
    ? teams.filter((t) => t.members.some((m) => m.id === user.id)).map((t) => t.id)
    : [];

  const statusLine =
    tournament.status === "swiss"
      ? `Round ${tournament.currentRound} of ${tournament.swissRounds} · Swiss in progress`
      : STATUS_COPY[tournament.status];

  return (
    <PageShell>
      <FnfRealtime />
      <PageHero
        eyebrow="The Hat League · Weekly 2v2"
        title="Friday Nite"
        accent="Fights"
        subtitle={
          <>
            Connect Discord and jump in. We auto-build rank-balanced 2v2 teams,
            run a Swiss bracket over {tournament.swissRounds} rounds, then the
            top {tournament.playoffCut} fight it out in the playoffs.
          </>
        }
        actions={
          <RegisterButton
            tournamentId={tournament.id}
            isAuthenticated={!!user}
            isRegistered={isRegistered}
            locked={tournament.status !== "registration"}
          />
        }
        aside={
          <div className="relative mx-auto aspect-square w-full max-w-[320px]">
            <Image
              src="/brand/fnf.png"
              alt="Friday Nite Fights"
              fill
              priority
              sizes="320px"
              className="object-contain drop-shadow-[0_8px_30px_rgba(255,107,0,0.25)]"
            />
          </div>
        }
      />

      <div className="mx-auto max-w-[1320px] space-y-8 px-6 pb-20 md:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-thl-orange/30 bg-thl-orange/[0.06] px-3 py-1 text-xs font-bold tracking-wide text-thl-orange uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-thl-orange" />
            {statusLine}
          </span>
          {tournament.startsAt && tournament.status === "registration" && (
            <span className="text-xs text-neutral-500">
              Starts <LocalTime iso={tournament.startsAt} />
            </span>
          )}
        </div>

        {isAdmin && (
          <AdminControls
            tournamentId={tournament.id}
            status={tournament.status}
            registeredCount={registrations.length}
            teamCount={teams.length}
            name={tournament.name}
            swissRounds={tournament.swissRounds}
            swissGames={tournament.swissGames}
            playoffBestOf={tournament.playoffBestOf}
            finalBestOf={tournament.finalBestOf}
            playoffCut={tournament.playoffCut}
            startsAt={tournament.startsAt}
          />
        )}

        {/* Registration: who's in */}
        {tournament.status === "registration" && (
          <section>
            <h2 className="mb-3 text-lg font-bold">
              Entered{" "}
              <span className="text-neutral-400">({registrations.length})</span>
            </h2>
            {registrations.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
                Be the first to enter — hit the button above.
              </p>
            ) : (
              <EnteredList
                registrations={registrations}
                isAdmin={isAdmin}
                tournamentId={tournament.id}
              />
            )}
          </section>
        )}

        {/* Teams set: roster grid (admin can drag/edit) */}
        {tournament.status === "teams" && teams.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold">Teams</h2>
            <TeamEditor
              teams={teams}
              tournamentId={tournament.id}
              editable={isAdmin}
            />
          </section>
        )}

        {/* Swiss / complete: standings + rounds */}
        {(tournament.status === "swiss" ||
          tournament.status === "complete" ||
          tournament.status === "playoffs") &&
          teams.length > 0 && (
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="order-2 lg:order-1">
                {tournament.status === "playoffs" ? (
                  <>
                    <h2 className="mb-3 text-lg font-bold">Playoff bracket</h2>
                    <BracketView
                      matches={matches}
                      viewerTeamIds={viewerTeamIds}
                      isAdmin={isAdmin}
                    />
                    <h2 className="mt-8 mb-3 text-lg font-bold">
                      Swiss rounds
                    </h2>
                    <RoundsView
                      matches={matches}
                      viewerTeamIds={viewerTeamIds}
                      isAdmin={isAdmin}
                    />
                  </>
                ) : (
                  <>
                    <h2 className="mb-3 text-lg font-bold">Matches</h2>
                    <RoundsView
                      matches={matches}
                      viewerTeamIds={viewerTeamIds}
                      isAdmin={isAdmin}
                    />
                  </>
                )}
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="mb-3 text-lg font-bold">Standings</h2>
                <StandingsTable
                  standings={standings}
                  teams={teams}
                  playoffCut={tournament.playoffCut}
                />
                {tournament.status === "complete" && (
                  <p className="mt-3 text-xs text-neutral-500">
                    Swiss complete. Top {tournament.playoffCut} qualify — an
                    admin can now generate the playoff bracket.
                  </p>
                )}
              </div>
            </section>
          )}
      </div>
    </PageShell>
  );
}
