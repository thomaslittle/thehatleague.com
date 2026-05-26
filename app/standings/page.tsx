import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight } from "@/components/icons/brand";
import {
  CHALLONGE_BRACKETS,
  FEDORA_PLAYOFFS_S3,
  FEDORA_S3,
  SOMBRERO_PLAYOFFS_S3,
  SOMBRERO_S3,
  type PlayoffRow,
  type StandingRow,
} from "@/lib/data/season3-standings";

export const metadata = {
  title: "Standings",
  description:
    "Season 3 final standings and playoff results across both conferences.",
};

const BRACKETS = [
  {
    label: "Sombrero · Regular season",
    href: CHALLONGE_BRACKETS.sombreroRegular,
    tag: "Regular" as const,
  },
  {
    label: "Fedora · Regular season",
    href: CHALLONGE_BRACKETS.fedoraRegular,
    tag: "Regular" as const,
  },
  {
    label: "Sombrero · Play-In",
    href: CHALLONGE_BRACKETS.playInSombrero,
    tag: "Play-in" as const,
  },
  {
    label: "Fedora · Play-In",
    href: CHALLONGE_BRACKETS.playInFedora,
    tag: "Play-in" as const,
  },
  {
    label: "Sombrero · Playoffs",
    href: CHALLONGE_BRACKETS.sombreroPlayoffs,
    tag: "Playoffs" as const,
  },
  {
    label: "Fedora · Playoffs",
    href: CHALLONGE_BRACKETS.fedoraPlayoffs,
    tag: "Playoffs" as const,
  },
];

export default function StandingsPage() {
  const sombreroChamp = SOMBRERO_PLAYOFFS_S3[0];
  const fedoraChamp = FEDORA_PLAYOFFS_S3[0];

  return (
    <PageShell>
      <PageHero
        eyebrow="Season 03 · Final standings"
        title="The receipts."
        accent="Two conferences."
        subtitle={
          <>
            Season 3 ended with{" "}
            <span className="font-semibold text-thl-orange">
              {sombreroChamp.name}
            </span>{" "}
            taking the Sombrero hat and{" "}
            <span className="font-semibold text-thl-orange">
              {fedoraChamp.name}
            </span>{" "}
            taking the Fedora. Regular-season tables below; playoff finishes
            beneath each.
          </>
        }
      />

      <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <ConfBlock
            title="Sombrero Conference"
            sub="Western · 10 teams · S03"
            rows={SOMBRERO_S3}
            playoffs={SOMBRERO_PLAYOFFS_S3}
            regularHref={CHALLONGE_BRACKETS.sombreroRegular}
            playoffsHref={CHALLONGE_BRACKETS.sombreroPlayoffs}
            playInHref={CHALLONGE_BRACKETS.playInSombrero}
          />
          <ConfBlock
            title="Fedora Conference"
            sub="Eastern · 10 teams · S03"
            rows={FEDORA_S3}
            playoffs={FEDORA_PLAYOFFS_S3}
            regularHref={CHALLONGE_BRACKETS.fedoraRegular}
            playoffsHref={CHALLONGE_BRACKETS.fedoraPlayoffs}
            playInHref={CHALLONGE_BRACKETS.playInFedora}
          />
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Original brackets · Challonge
          </div>
          <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
            Open any bracket in Challonge.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {BRACKETS.map((b) => (
              <a
                key={b.href}
                href={b.href}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-black"
              >
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                    {b.tag}
                  </div>
                  <div className="mt-0.5 text-sm font-bold">{b.label}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-thl-orange transition group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            Reserved · Season 04 live standings
          </div>
          <h3 className="mt-3 font-marker text-3xl md:text-4xl">
            Live standings render here once Season 4 kicks off.
          </h3>
          <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            We&apos;ll wire this directly to ballchasing.com once the draft
            sets the league structure.
          </p>
          <Link
            href="/the-draft"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-4 py-2.5 text-sm font-bold text-black hover:bg-thl-orange-deep"
          >
            See draft info <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

function ConfBlock({
  title,
  sub,
  rows,
  playoffs,
  regularHref,
  playoffsHref,
  playInHref,
}: {
  title: string;
  sub: string;
  rows: StandingRow[];
  playoffs: PlayoffRow[];
  regularHref: string;
  playoffsHref: string;
  playInHref: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div>
          <div className="font-marker text-2xl md:text-3xl">{title}</div>
          <div className="mt-1.5 text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
            {sub}
          </div>
        </div>
        <span className="rounded-md bg-thl-orange px-2.5 py-1 text-[10px] font-extrabold tracking-[0.18em] text-black">
          S03
        </span>
      </div>

      {/* Regular season table */}
      <div className="grid grid-cols-[32px_1fr_60px_56px] gap-2 border-b border-neutral-200 px-4 py-3 text-[10px] font-bold tracking-[0.16em] text-neutral-500 uppercase md:grid-cols-[40px_1fr_44px_64px_44px_44px_56px] dark:border-neutral-800">
        <span className="text-center">#</span>
        <span>Team</span>
        <span className="hidden text-center md:block">GP</span>
        <span className="text-center">W/L</span>
        <span className="hidden text-center md:block">GF</span>
        <span className="hidden text-center md:block">GA</span>
        <span className="text-right">Diff</span>
      </div>
      <ol>
        {rows.map((t, i) => {
          const diff = t.gf - t.ga;
          return (
            <li
              key={t.seed}
              className={`grid grid-cols-[32px_1fr_60px_56px] items-center gap-2 px-4 py-3 text-sm md:grid-cols-[40px_1fr_44px_64px_44px_44px_56px] ${
                i === 0
                  ? "bg-thl-orange/10"
                  : "border-t border-neutral-100 dark:border-neutral-900"
              }`}
            >
              <span className="text-center font-extrabold tabular-nums text-thl-orange">
                {String(t.seed).padStart(2, "0")}
              </span>
              <span className="min-w-0 truncate font-semibold" title={t.name}>
                {t.name}
                {t.captain && (
                  <span className="ml-1.5 text-xs font-normal text-neutral-500">
                    · {t.captain}
                  </span>
                )}
              </span>
              <span className="hidden text-center tabular-nums text-neutral-600 md:block dark:text-neutral-400">
                {t.gp}
              </span>
              <span className="text-center font-semibold tabular-nums whitespace-nowrap">
                {t.w}–{t.l}
              </span>
              <span className="hidden text-center tabular-nums text-neutral-600 md:block dark:text-neutral-400">
                {t.gf}
              </span>
              <span className="hidden text-center tabular-nums text-neutral-600 md:block dark:text-neutral-400">
                {t.ga}
              </span>
              <span
                className={`text-right font-bold tabular-nums ${
                  diff > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : diff < 0
                      ? "text-rose-500"
                      : "text-neutral-500"
                }`}
              >
                {diff > 0 ? "+" : ""}
                {diff}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Playoff results */}
      <div className="border-t border-neutral-200 bg-neutral-50/60 px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            Playoff finish
          </div>
          <span className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
            8 teams · double-elim
          </span>
        </div>
        <ol className="mt-3 grid gap-1.5">
          {playoffs.map((p, i) => (
            <li
              key={`${p.rank}-${p.name}`}
              className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm ${
                i === 0
                  ? "bg-thl-orange/15 font-bold text-thl-orange"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <span className="w-6 text-center font-extrabold tabular-nums">
                {p.rank}
              </span>
              <span className="min-w-0 truncate">
                {i === 0 && "★ "}
                {p.name}
              </span>
              {p.captain && (
                <span className="ml-auto truncate text-xs text-neutral-500">
                  {p.captain}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 px-6 py-3 text-[11px] dark:border-neutral-800">
        <a
          href={regularHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Regular season ↗
        </a>
        <a
          href={playInHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Play-in ↗
        </a>
        <a
          href={playoffsHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Playoffs ↗
        </a>
      </div>
    </div>
  );
}
