import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { loadSchedule } from "@/lib/data/tournament";
import { ScheduleBoard } from "@/components/tournament/schedule-board";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";

export const metadata = {
  title: "Schedule",
  description: "The Hat League schedule. Drops once the draft sets the bracket.",
};

const RHYTHM = [
  { label: "Match window", value: "Fri – Sun" },
  { label: "Start time", value: "9 – 11 PM EST" },
  { label: "Subs", value: "Pre-approved only" },
  { label: "Reschedules", value: "Allowed mid-week" },
];

export default async function SchedulePage() {
  const season = await getActiveSeason();
  const supabase = await createSupabaseServerClient();
  const matches = season ? await loadSchedule(season.id) : [];

  // Viewer's team (for the "my team" filter).
  let myTeamId: string | null = null;
  if (season) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: tm } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("season_id", season.id)
        .eq("profile_id", user.id)
        .maybeSingle();
      myTeamId = tm?.team_id ?? null;
    }
  }

  const conferences = season?.conferences ?? [];
  const hasMatches = matches.length > 0;

  return (
    <PageShell>
      <PageHero
        eyebrow="Schedule · Season 04"
        title="The bracket drops"
        accent="after the draft."
        subtitle={
          <>
            We post the full Season 4 match schedule the morning after the
            draft. Until then, here&apos;s how the weeks usually run — and
            where to look for last-minute changes.
          </>
        }
        actions={
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3.5 font-bold text-white transition hover:bg-[#4752c4]"
          >
            <DiscordIcon className="h-5 w-5" />
            Match-day chatter on Discord
            <ArrowRight className="h-4 w-4" />
          </a>
        }
      />

      <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-24">
        <div className="grid gap-4 md:grid-cols-4">
          {RHYTHM.map((r) => (
            <div
              key={r.label}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                {r.label}
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight">{r.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            {season?.name ?? "Season 04"} · Calendar
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
            {hasMatches ? "Every match, every week." : "The calendar drops after the draft."}
          </h2>
          {!hasMatches && (
            <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Once the draft sets the teams, the full week-by-week schedule lands
              here and updates live as captains report results.{" "}
              <Link href="/the-draft" className="font-semibold text-thl-orange underline-offset-4 hover:underline">
                See the draft format <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </p>
          )}
        </div>
      </section>

      {hasMatches && (
        <div className="pt-10">
          <RealtimeRefresh tables={["matches"]} channel="schedule" />
          <ScheduleBoard matches={matches} conferences={conferences} myTeamId={myTeamId} />
        </div>
      )}
    </PageShell>
  );
}
