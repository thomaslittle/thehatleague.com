import {
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { DiscordIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { RL_RANK_TIERS } from "@/lib/ranks";
import { getViewer, skipOnboarding, submitOnboarding } from "@/server/auth";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";
const PEAK_PLAYLISTS = ["Duos", "Standard", "Solo Standard", "Doubles", "Other"];

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({
        to: "/signin",
        search: { redirect: "/onboarding" },
      });
    }
    const fullyOnboarded = Boolean(
      viewer.trackerUrl &&
        viewer.rank2v2 &&
        viewer.rank3v3 &&
        viewer.peakRank,
    );
    if (fullyOnboarded) {
      throw redirect({ to: "/dashboard" });
    }
    return { viewer };
  },
  loader: ({ context }) => ({ viewer: context.viewer }),
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Onboarding · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function OnboardingPage() {
  const { viewer } = Route.useLoaderData();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      trackerUrl: String(fd.get("tracker_url") ?? "").trim(),
      rank2v2: String(fd.get("rank_2v2") ?? "").trim(),
      rank3v3: String(fd.get("rank_3v3") ?? "").trim(),
      peakRank: String(fd.get("peak_rank") ?? "").trim(),
      peakPlaylist: String(fd.get("peak_playlist") ?? "").trim() || undefined,
      inPlayerPool: fd.get("in_player_pool") === "on",
    };
    startTransition(async () => {
      const result = await submitOnboarding({ data: payload });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      navigate({ to: "/dashboard", search: { welcome: "1" } });
    });
  }

  function onSkip() {
    startTransition(async () => {
      const result = await skipOnboarding();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      navigate({
        to: "/dashboard",
        search: { welcome: "1", pending: "1" },
      });
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-[1080px] px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-12 md:grid-cols-[1fr_320px] md:gap-16">
            <div>
              <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                Step 02 · Onboarding
              </div>
              <h1 className="mt-4 text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-5xl">
                Tell us what you bring{" "}
                <span className="font-marker font-normal text-thl-orange">
                  to the lobby.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-neutral-600 dark:text-neutral-400">
                Captains pick from this info on draft night. Tracker URL plus
                three ranks — your current 2v2, your current 3v3, and the
                highest rank you&apos;ve ever hit (any season, any playlist).
              </p>

              <form
                onSubmit={onSubmit}
                className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <Field
                  label="Rocket League Tracker URL"
                  name="tracker_url"
                  type="url"
                  placeholder="https://rocketleague.tracker.network/rocket-league/profile/steam/yourname/overview"
                  defaultValue={viewer.trackerUrl ?? ""}
                  required
                  hint="Paste the full URL to your profile on rocketleague.tracker.network."
                />
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Select
                    label="Current 2v2 rank"
                    name="rank_2v2"
                    defaultValue={viewer.rank2v2 ?? ""}
                    options={RL_RANK_TIERS as readonly string[]}
                    required
                  />
                  <Select
                    label="Current 3v3 rank"
                    name="rank_3v3"
                    defaultValue={viewer.rank3v3 ?? ""}
                    options={RL_RANK_TIERS as readonly string[]}
                    required
                  />
                  <Select
                    label="Peak rank (ever)"
                    name="peak_rank"
                    defaultValue={viewer.peakRank ?? ""}
                    options={RL_RANK_TIERS as readonly string[]}
                    required
                  />
                  <Select
                    label="Peak playlist"
                    name="peak_playlist"
                    defaultValue={viewer.peakPlaylist ?? ""}
                    options={PEAK_PLAYLISTS}
                  />
                </div>
                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <input
                    type="checkbox"
                    name="in_player_pool"
                    defaultChecked={viewer.inPlayerPool}
                    className="mt-1 h-4 w-4 accent-thl-orange"
                  />
                  <span className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <span className="font-bold">Put me in the player pool</span>
                    <span className="block text-xs text-neutral-500">
                      Captains can see you and draft you on stream. Uncheck if
                      you&apos;re sitting out this season.
                    </span>
                  </span>
                </label>
                {error && (
                  <p role="alert" className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-thl-orange px-6 py-4 font-bold text-black transition hover:bg-thl-orange-deep active:scale-[0.98] disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save and continue"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={pending}
                  className="text-sm font-semibold text-neutral-500 underline-offset-4 hover:text-thl-orange hover:underline disabled:opacity-60"
                >
                  Skip for now — I&apos;ll add ranks before the draft
                </button>
              </div>

              <details className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                <summary className="cursor-pointer font-semibold text-neutral-900 dark:text-white">
                  Why are we asking you and not just pulling it?
                </summary>
                <p className="mt-3 leading-relaxed">
                  rocketleague.tracker.network sits behind Cloudflare bot
                  protection that blocks server-side fetches. The automated
                  pull (PRD adapter #2) is on deck behind a stub — for now,
                  manual confirm-and-go is the cleanest way to get accurate
                  ranks in front of captains.
                </p>
              </details>
            </div>

            <aside className="relative">
              <div className="sticky top-28 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 md:bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex items-center gap-3">
                  {viewer.avatarUrl ? (
                    <img
                      src={viewer.avatarUrl}
                      alt=""
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
                      {(viewer.discordUsername ?? "??")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                      {viewer.displayName ??
                        viewer.discordUsername ??
                        "your_handle"}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                      Discord verified · S04 setup
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">
                  You choose whether to enter the Season 04 player pool on
                  this form. Captains can scout you once your ranks are
                  saved.
                </p>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                >
                  <DiscordIcon className="h-4 w-4" />
                  Open #help on Discord
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
      />
      {hint && (
        <span className="mt-1.5 block text-xs text-neutral-500">{hint}</span>
      )}
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
