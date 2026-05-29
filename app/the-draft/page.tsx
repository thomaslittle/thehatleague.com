import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { SessionCta } from "@/components/page/session-cta";
import { ArrowRight, TwitchIcon } from "@/components/icons/brand";
import { getViewer } from "@/lib/auth/viewer";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "The Draft",
  description:
    "A live-streamed Rocket League draft for The Hat League Season 4. Date TBA.",
};

const READINESS = [
  {
    n: "01",
    title: "Sign in with Discord",
    body: "We use Discord to roster you. Identity confirmed, profile created.",
    cta: "Sign in",
    href: "/signin",
  },
  {
    n: "02",
    title: "Confirm your ranks",
    body: "Paste your rocketleague.tracker.network URL, confirm your 2v2 / 3v3 / peak.",
    cta: "Open onboarding",
    href: "/onboarding",
  },
  {
    n: "03",
    title: "Sit in the pool",
    body: "Browse captain stories on the Discord. Tune in on draft night.",
    cta: "Join Discord",
    href: SITE.discordInvite,
  },
];

export default async function DraftPage() {
  const viewer = await getViewer();
  return (
    <PageShell>
      <PageHero
        eyebrow="The Draft · Season 04"
        title={
          <>
            Captains pick live.
            <br />
            One night.
          </>
        }
        accent="Draft — TBA."
        subtitle={
          <>
            On draft night we go live on Twitch and team captains pick their
            squads in front of chat — one round at a time, every player
            available, no second chances. The exact date, format details and
            roster sizes for Season 4 are still being locked in. You can be
            ready right now.
          </>
        }
        actions={
          <>
            <SessionCta viewer={viewer} signedOutLabel="Get in the pool" />
            <a
              href={SITE.twitchUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl bg-[#9146ff] px-5 py-3.5 font-bold text-white transition hover:bg-[#7c2bff]"
            >
              <TwitchIcon className="h-5 w-5" />
              Watch on Twitch
            </a>
          </>
        }
      />

      <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Stat label="Date" value="TBA" hint="Locked once captains confirm" />
          <Stat
            label="Format"
            value="Live · Twitch"
            hint="Captains pick in chat-driven order"
          />
          <Stat
            label="Roster sizes"
            value="TBA"
            hint="Season 4 structure pending"
          />
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-24">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            How to be ready
          </div>
          <h2 className="mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.03em] md:text-5xl">
            Three steps.{" "}
            <span className="font-marker font-normal text-thl-orange">
              That&apos;s it.
            </span>
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {READINESS.map((r) => (
              <Link
                key={r.n}
                href={r.href}
                target={r.href.startsWith("http") ? "_blank" : undefined}
                rel={r.href.startsWith("http") ? "noopener" : undefined}
                className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-thl-orange hover:shadow-lg dark:border-neutral-800 dark:bg-black dark:hover:border-thl-orange"
              >
                <div className="text-3xl font-extrabold tabular-nums text-thl-orange">
                  {r.n}
                </div>
                <div className="text-lg font-bold tracking-tight">
                  {r.title}
                </div>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {r.body}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange">
                  {r.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Reserved: Player Pool board */}
          <ReservedPanel
            tag="Reserved · Player pool board"
            title="Who&apos;s available"
            body="Once registration is open, the live pool board will appear here — sortable by 2v2 rank, 3v3 rank, peak, and recent form. Captains use it during the draft."
          />
          {/* Reserved: Live draft board */}
          <ReservedPanel
            tag="Reserved · Live draft board"
            title="Round-by-round picks"
            body="On draft night, this here renders the live pick clock, captain queues, and the round-by-round board. Powered by Supabase Realtime so chat and players see picks the moment they land."
          />
        </div>
      </section>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {label}
      </div>
      <div className="mt-2 font-marker text-4xl">{value}</div>
      <div className="mt-2 text-sm text-neutral-500">{hint}</div>
    </div>
  );
}

function ReservedPanel({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-300 bg-gradient-to-br from-white to-neutral-50 p-8 md:p-12 dark:border-neutral-800 dark:from-neutral-950 dark:to-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(247,97,3,0.16), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          {tag}
        </div>
        <h3 className="mt-3 font-marker text-3xl md:text-4xl">{title}</h3>
        <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-400">
          {body}
        </p>
        <div className="mt-8 h-44 rounded-xl border border-dashed border-neutral-300 bg-neutral-100/40 dark:border-neutral-800 dark:bg-neutral-900/40" />
      </div>
    </div>
  );
}
