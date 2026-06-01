import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { loadCombineBoard, loadMyCombine } from "@/lib/data/combine";
import { CombineBoard } from "@/components/combine/combine-board";
import { CombineForm } from "@/components/combine/combine-form";

export const metadata = {
  title: "Draft Combine",
  description:
    "The pre-draft showcase. Players submit their best clip, role and ranks; captains scout the field.",
};

export default async function CombinePage() {
  const season = await getActiveSeason();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entries = season ? await loadCombineBoard(season.id) : [];

  // Viewer context: in-pool (can submit) + captain team (can queue).
  let inPool = false;
  let captainTeamId: string | null = null;
  let myCombine = null;
  if (user && season) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("in_player_pool")
      .eq("id", user.id)
      .single();
    inPool = Boolean(profile?.in_player_pool);
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("season_id", season.id)
      .eq("captain_id", user.id)
      .maybeSingle();
    captainTeamId = team?.id ?? null;
    if (inPool) myCombine = await loadMyCombine(season.id, user.id);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow={`${season?.name ?? "Season 04"} · Draft Combine`}
        title="Scout the"
        accent="field."
        subtitle={
          <>
            The NFL-combine for The Hat League. Players post their best clip,
            preferred role and ranks; captains study the board before they pick.
          </>
        }
      />

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        {season && <RealtimeRefresh tables={["combine_profiles"]} channel="combine" />}

        <CombineBoard seasonId={season?.id ?? ""} entries={entries} captainTeamId={captainTeamId} />

        {inPool && (
          <div className="mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-800">
            <CombineForm initial={myCombine} />
          </div>
        )}
      </section>
    </PageShell>
  );
}
