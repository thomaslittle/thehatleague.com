import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";

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

export default function SchedulePage() {
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
              <div className="mt-2 font-marker text-2xl">{r.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 md:grid-cols-[1fr_auto] md:px-10 md:py-20">
          <div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Reserved · Season 04 calendar
            </div>
            <h2 className="mt-3 font-marker text-3xl md:text-4xl">
              Week-by-week calendar slots in here.
            </h2>
            <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              When the draft is done, we drop the full schedule (team vs team,
              by week) here. Captain reschedules go through the
              Discord and reflect here automatically.
            </p>
            <Link
              href="/the-draft"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              See the draft format <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="h-48 rounded-2xl border border-dashed border-neutral-300 bg-white/40 md:w-80 dark:border-neutral-800 dark:bg-black/40" />
        </div>
      </section>
    </PageShell>
  );
}
