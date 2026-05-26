import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight } from "@/components/icons/brand";

export const metadata = {
  title: "Rules",
  description:
    "The Hat League rules — Season 3 archive, with Season 4 updates landing soon.",
};

const SECTIONS = [
  {
    id: "regular-season",
    eyebrow: "Regular season",
    title: "5 weeks. Two opponents each week.",
    body: [
      "Against each opponent you play 5 games — not best-of-5, the full 5.",
      "The Labor Day weekend (where Week 2 would sit) is off.",
      "No maximum goal differential.",
    ],
  },
  {
    id: "playoffs",
    eyebrow: "Playoffs & play-in",
    title: "Top 6 in. Seeds 7–10 fight for it.",
    body: [
      "Top 6 teams per conference get an automatic playoff berth.",
      "Seeds 7–10 play a double-elim play-in. Winner takes seed 7, runner-up takes seed 8.",
      "Playoffs are double-elimination, best-of-3 series.",
      "Conference Finals are best-of-5 with a reset if needed.",
      "Grand Finals (Sombrero vs Fedora) is best-of-7.",
    ],
    tba: [
      "Play-In tourneys · TBA CST",
      "Sombrero Conference playoffs · TBA, 8:30 PM CST",
      "Fedora Conference playoffs · TBA, 8:00 PM CST",
      "Grand Finals · TBA, 8:00 PM CST",
    ],
  },
  {
    id: "replays",
    eyebrow: "Replays",
    title: "One person uploads. Stats roll up.",
    body: [
      "One designated player per team uploads replays to ballchasing.com so per-player stats can be tracked.",
      "Each team creates a season-tagged folder for submissions.",
    ],
  },
  {
    id: "subs",
    eyebrow: "Subs & scheduling",
    title: "Subs are last resort.",
    body: [
      "Subs must be pre-approved before a player fills in.",
      "Reschedules during the week are fine if both teams agree.",
      "Games are scheduled Friday – Sunday, 9 PM – 11 PM EST.",
      "Report scheduling issues to TBA ASAP.",
    ],
  },
  {
    id: "conduct",
    eyebrow: "Code of conduct",
    title: "Be a hat dad about it.",
    body: [
      "This is a community league. No slurs, no targeted harassment, no nuking the lobby.",
      "Disagreements get resolved in the captains channel before they get loud.",
      "League ops reserve the right to remove anyone undermining the vibe.",
    ],
  },
];

export default function RulesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Rules · Season 04 update in progress"
        title="Old rules, new wrinkles"
        accent="coming for S04."
        subtitle={
          <>
            What follows is the Season 3 ruleset, archived here so you know
            how things ran. The Season 4 ruleset is being overhauled — fields
            marked &quot;TBA&quot; will fill in as decisions land.
          </>
        }
      />

      <section className="mx-auto max-w-[1320px] px-6 pb-10 md:px-10">
        <div className="flex items-center gap-3 rounded-2xl border border-thl-orange/30 bg-thl-orange/10 px-5 py-4">
          <span className="inline-flex h-2 w-2 rounded-full bg-thl-orange" />
          <p className="text-sm text-neutral-800 dark:text-neutral-200">
            <span className="font-bold">Season 4 note:</span> these rules are
            changing significantly. Treat everything below as placeholder
            until the new ruleset drops here.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-20 md:px-10">
        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          <nav
            aria-label="Rules table of contents"
            className="md:sticky md:top-24 md:self-start"
          >
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Sections
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-md px-2 py-1.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-thl-orange dark:text-neutral-300 dark:hover:bg-neutral-900"
                  >
                    {s.eyebrow}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/the-draft"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              Draft format <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>

          <div className="space-y-12">
            {SECTIONS.map((s) => (
              <article
                key={s.id}
                id={s.id}
                className="scroll-mt-28 rounded-3xl border border-neutral-200 bg-white p-7 md:p-9 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                  {s.eyebrow}
                </div>
                <h2 className="mt-2 font-marker text-3xl md:text-4xl">
                  {s.title}
                </h2>
                <ul className="mt-5 space-y-3 text-neutral-700 dark:text-neutral-300">
                  {s.body.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-thl-orange" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                {s.tba && (
                  <div className="mt-5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                    <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                      TBA — Season 04
                    </div>
                    <ul className="mt-2 space-y-1">
                      {s.tba.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
