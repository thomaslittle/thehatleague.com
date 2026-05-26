import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Replays",
  description:
    "Where Season 4 replays land and how player stats roll up automatically.",
};

const STEPS = [
  {
    n: "01",
    title: "Lobby up",
    body: "Hit the create-private-match button and start the series. THL standard settings, no mutators.",
  },
  {
    n: "02",
    title: "Drop the .replay files",
    body: "End of series, one designated captain uploads to ballchasing.com into the team's THL S04 folder.",
  },
  {
    n: "03",
    title: "Stats refresh",
    body: "Our worker pulls the folder, parses goals / assists / saves / demos, and updates the player-stats table.",
  },
];

export default function ReplaysPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Replays · Season 04"
        title="How stats end up"
        accent="on the leaderboard."
        subtitle={
          <>
            Every Season 4 match is recorded into a team folder on
            ballchasing.com. We ingest that folder, parse the per-player
            numbers, and roll them into the standings and stat leaderboards on
            the landing page.
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
            Issue with a replay? #replays
            <ArrowRight className="h-4 w-4" />
          </a>
        }
      />

      <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="text-3xl font-extrabold tabular-nums text-thl-orange">
                {s.n}
              </div>
              <div className="mt-3 text-lg font-bold tracking-tight">
                {s.title}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-black">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Reserved · S04 replay folders
            </div>
            <h3 className="mt-3 font-marker text-3xl md:text-4xl">
              Each team&apos;s ballchasing folder lives here.
            </h3>
            <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Once the bracket is set, a clickable card for every team
              renders here with a deep link to the team&apos;s ballchasing
              folder and the latest series-by-series score breakdown.
            </p>
            <Link
              href="/standings"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              See standings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
