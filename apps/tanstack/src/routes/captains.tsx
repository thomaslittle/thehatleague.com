import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { rankIconSrc } from "@/lib/ranks";
import { ogMeta } from "@/lib/og";
import {
  applyForCaptain,
  withdrawCaptainApplication,
} from "@/server/auth";
import {
  getConfirmedCaptains,
  type ConfirmedCaptain,
} from "@/server/pool";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

const DUTIES = [
  {
    title: "Draft your squad",
    body: "On draft night, you're on camera picking your team from the live pool. No mulligans.",
  },
  {
    title: "Captain the room",
    body: "You set practice cadence, comms style, and who subs in. League ops backstops you.",
  },
  {
    title: "Report results",
    body: "Drop W/L into the captains channel after every match. Replays go to ballchasing.",
  },
  {
    title: "Defend the vibe",
    body: "We're a community league. If something on your bench drifts, you nudge it back into orbit.",
  },
];

export const Route = createFileRoute("/captains")({
  component: CaptainsPage,
  loader: async () => {
    const captains = await getConfirmedCaptains();
    return { captains };
  },
  head: () => ({
    meta: ogMeta({
      title: "Captains · The Hat League",
      description:
        "Become a Hat League captain — draft your squad, run point on Discord, hoist the hat.",
      dynamic: true,
    }),
  }),
});

function CaptainsPage() {
  const { captains } = Route.useLoaderData();
  const { viewer } = useLoaderData({ from: "__root__" });

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Captains · Season 04"
          title="The ones doing the picking."
          accent={
            captains.length === 0
              ? "Roster TBA."
              : `${captains.length} confirmed.`
          }
          subtitle={
            <>
              Captain confirmations are locked 48 hours before draft night.
              Confirmed captains show below as they sign on; everyone else
              can apply directly from this page.
            </>
          }
          actions={
            !viewer ? (
              <Link
                to="/signin"
                search={{ redirect: "/captains" }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3.5 font-bold text-white transition hover:bg-[#4752c4]"
              >
                <DiscordIcon className="h-5 w-5" />
                Sign in to apply
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
              >
                Apply to captain
                <ArrowRight className="h-4 w-4" />
              </a>
            )
          }
        />

        <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10">
          {captains.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                Reserved · S04 captains roster
              </div>
              <h2 className="mt-3 font-marker text-3xl md:text-4xl">
                Avatars and team names slot in here.
              </h2>
              <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
                We&apos;ll show each confirmed captain&apos;s Discord avatar,
                their team handle, and a quick &quot;why I&apos;m picking how
                I&apos;m picking&quot; blurb once they&apos;re locked in.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {captains.map((c) => (
                <CaptainCard key={c.id} row={c} />
              ))}
            </ul>
          )}
        </section>

        {viewer && (
          <section
            id="apply"
            className="scroll-mt-28 border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950"
          >
            <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
              <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
                <div>
                  <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                    Want to captain?
                  </div>
                  <h2 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
                    Tell us how you&apos;d{" "}
                    <span className="font-marker font-normal text-thl-orange">
                      run the lobby.
                    </span>
                  </h2>
                  <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-400">
                    Application goes straight to league ops. We DM you on
                    Discord with a yes/no inside a couple days.
                  </p>
                  <Link
                    to="/rules"
                    hash="playoffs"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
                  >
                    Captain responsibilities{" "}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <CaptainApplication
                  alreadyApplied={
                    !!viewer.isCaptainApplicant && !viewer.isCaptain
                  }
                  initialPitch={viewer.captainPitch ?? ""}
                  isCaptain={!!viewer.isCaptain}
                />
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            The job
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
            Four duties.{" "}
            <span className="font-marker font-normal text-thl-orange">
              That&apos;s the deal.
            </span>
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {DUTIES.map((d, i) => (
              <div
                key={d.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="text-3xl font-extrabold tabular-nums text-thl-orange">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-3 text-lg font-bold tracking-tight">
                  {d.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {d.body}
                </p>
              </div>
            ))}
          </div>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/40 px-5 py-3 font-semibold text-[#5865F2] transition hover:bg-[#5865F2]/10"
          >
            <DiscordIcon className="h-5 w-5" />
            Captains channel on Discord
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CaptainCard({ row }: { row: ConfirmedCaptain }) {
  const name =
    row.discord_global_name ?? row.discord_username ?? "Captain";
  const avatarUrl = row.profile_avatar_url ?? row.discord_avatar_url;
  const peakIcon = rankIconSrc(row.peak_rank);

  return (
    <li className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full border border-thl-orange/30"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-base font-bold">{name}</div>
          <div className="truncate text-xs text-neutral-500">
            @{row.discord_username ?? "—"}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-thl-orange/30 bg-thl-orange/5 px-3 py-2">
        <div className="text-[9px] font-bold tracking-[0.18em] text-thl-orange uppercase">
          Peak
          {row.peak_rank_playlist ? ` · ${row.peak_rank_playlist}` : ""}
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5">
          {peakIcon && <img src={peakIcon} alt="" className="h-4 w-4" />}
          <span className="truncate text-sm font-bold text-thl-orange">
            {row.peak_rank ?? "—"}
          </span>
        </div>
      </div>
      {row.captain_pitch && (
        <blockquote className="mt-4 border-l-2 border-thl-orange/40 pl-3 text-sm leading-relaxed text-neutral-700 italic dark:text-neutral-300">
          &ldquo;{row.captain_pitch}&rdquo;
        </blockquote>
      )}
      {row.discord_username && (
        <Link
          to="/players/$username"
          params={{ username: row.discord_username }}
          className="mt-auto pt-4 text-xs font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          View captain profile →
        </Link>
      )}
    </li>
  );
}

const PITCH_MIN = 40;
const PITCH_MAX = 1200;

function CaptainApplication({
  alreadyApplied,
  initialPitch,
  isCaptain,
}: {
  alreadyApplied: boolean;
  initialPitch: string;
  isCaptain: boolean;
}) {
  const [pitch, setPitch] = useState(initialPitch);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [pending, start] = useTransition();

  if (isCaptain) {
    return (
      <div className="rounded-3xl border border-thl-orange/40 bg-thl-orange/5 p-6 md:p-8 dark:bg-thl-orange/10">
        <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          You&apos;re a captain
        </div>
        <h3 className="mt-3 font-marker text-2xl md:text-3xl">
          Locked in for Season 04.
        </h3>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
          See you on draft night. Update your pitch from{" "}
          <Link
            to="/settings"
            className="font-semibold text-thl-orange underline-offset-4 hover:underline"
          >
            settings
          </Link>
          .
        </p>
      </div>
    );
  }

  if ((alreadyApplied || submitted) && !withdrawn) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          Application received
        </div>
        <h3 className="mt-3 font-marker text-2xl md:text-3xl">
          We&apos;ll DM you on Discord.
        </h3>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
          League ops reviews applications a few times a week.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setError(null);
            start(async () => {
              const r = await withdrawCaptainApplication();
              if (r.ok) setWithdrawn(true);
              else setError(r.message);
            });
          }}
          disabled={pending}
          className="mt-5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
        >
          {pending ? "Withdrawing…" : "Withdraw application"}
        </button>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    setWithdrawn(false);
    start(async () => {
      const r = await applyForCaptain({ data: { pitch } });
      if (!r.ok) setError(r.message);
      else setSubmitted(true);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <label className="block">
        <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
          Captain pitch
        </span>
        <textarea
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          minLength={PITCH_MIN}
          maxLength={PITCH_MAX}
          rows={6}
          placeholder="A few sentences on how you'd captain — playstyle, scrim cadence, vibe."
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
        />
        <span
          className={
            "mt-1 block text-xs " +
            (pitch.length > PITCH_MAX
              ? "text-rose-500"
              : pitch.length > 0 && pitch.length < PITCH_MIN
                ? "text-amber-600 dark:text-amber-400"
                : "text-neutral-500")
          }
        >
          {pitch.length}/{PITCH_MAX}
          {pitch.length > 0 && pitch.length < PITCH_MIN
            ? ` · ${PITCH_MIN - pitch.length} more to submit`
            : ""}
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}
      {submitted && !error && (
        <p role="status" className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Application sent. League ops will DM you on Discord.
        </p>
      )}
      <button
        type="submit"
        disabled={
          pending || pitch.length < PITCH_MIN || pitch.length > PITCH_MAX
        }
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
