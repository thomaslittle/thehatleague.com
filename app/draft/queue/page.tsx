import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { loadQueue, loadAvailablePool } from "@/lib/data/draft";
import { QueueBoard } from "@/components/draft/queue-board";

export const metadata = {
  title: "Your draft queue",
  description: "Pre-rank players so auto-pick drafts your board if your clock expires.",
};

export default async function DraftQueuePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const season = await getActiveSeason();

  let body: React.ReactNode;

  if (!user) {
    body = <Notice>Sign in as a captain to build your draft queue.</Notice>;
  } else if (!season) {
    body = <Notice>No active season yet.</Notice>;
  } else {
    const { data: team } = await supabase
      .from("teams")
      .select("id, name")
      .eq("season_id", season.id)
      .eq("captain_id", user.id)
      .maybeSingle();

    if (!team) {
      body = (
        <Notice>
          The queue is for team captains. If you&apos;re a captain and don&apos;t see your
          team yet, league ops haven&apos;t created teams for this season.{" "}
          <Link href="/the-draft" className="text-thl-orange underline-offset-4 hover:underline">
            Back to the draft
          </Link>
        </Notice>
      );
    } else {
      const [queue, pool] = await Promise.all([
        loadQueue(supabase, season.id, team.id),
        loadAvailablePool(supabase, season.id),
      ]);
      body = (
        <QueueBoard
          seasonId={season.id}
          teamId={team.id}
          teamName={team.name}
          initialQueue={queue}
          initialPool={pool}
        />
      );
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Captain tools"
        title={
          <>
            Your draft
            <br />
            queue.
          </>
        }
        accent="Pre-rank your board."
        subtitle={
          <>
            Rank the players you want most. If your pick clock runs out, the
            board auto-drafts the top available player from this queue — so you
            never lose a pick.
          </>
        }
      />
      {body}
    </PageShell>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
        {children}
      </div>
    </section>
  );
}
