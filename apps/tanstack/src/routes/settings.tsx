import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { RL_RANK_TIERS } from "@/lib/ranks";
import { parseSocialLinks, SOCIAL_LINKS } from "@/lib/customization";
import type { Json } from "@/lib/supabase/types";
import {
  applyForCaptain,
  applyForLeagueOps,
  getViewer,
  signOut,
  submitOnboarding,
  togglePoolMembership,
  updateProfileCustomization,
  withdrawCaptainApplication,
  withdrawLeagueOpsApplication,
} from "@/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServerFn } from "@tanstack/react-start";

const PEAK_PLAYLISTS = ["Duos", "Standard", "Solo Standard", "Doubles", "Other"];

const getProfileExtras = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ bio: string | null; social_links: Json | null }> => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { bio: null, social_links: null };
    const { data } = await supabase
      .from("profiles")
      .select("bio, social_links")
      .eq("id", user.id)
      .maybeSingle();
    return {
      bio: data?.bio ?? null,
      social_links: (data?.social_links ?? null) as Json | null,
    };
  },
);

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({ to: "/signin", search: { redirect: "/settings" } });
    }
    return { viewer };
  },
  loader: async ({ context }) => {
    const extras = await getProfileExtras();
    return { viewer: context.viewer, extras };
  },
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function SettingsPage() {
  const { viewer, extras } = Route.useLoaderData();
  const initialSocials = parseSocialLinks(extras.social_links);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <section className="relative">
          <div className="relative mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
            <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                  Settings
                </div>
                <h1 className="mt-4 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
                  Keep your{" "}
                  <span className="font-marker font-normal text-thl-orange">
                    card current.
                  </span>
                </h1>
                <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
                  Update your tracker URL or refresh your ranks any time —
                  captains see the latest version on the player pool.
                </p>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
              >
                ← Back to dashboard
              </Link>
            </div>

            <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
              <CustomizationForm
                initialBio={extras.bio ?? ""}
                initialSocials={initialSocials}
              />
            </div>

            <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
              <RanksForm viewer={viewer} />
            </div>

            <PoolToggle inPool={viewer.inPlayerPool} />

            <ApplicationCard
              kind="captain"
              isMember={viewer.isCaptain}
              hasApplied={viewer.isCaptainApplicant && !viewer.isCaptain}
              initialPitch={viewer.captainPitch ?? ""}
            />

            <ApplicationCard
              kind="league-ops"
              isMember={viewer.isAdmin}
              hasApplied={viewer.isAdminApplicant && !viewer.isAdmin}
              initialPitch={viewer.adminPitch ?? ""}
            />

            <SignOutCard
              displayName={
                viewer.displayName ?? viewer.discordUsername ?? "captain"
              }
              onSignedOut={() => {
                navigate({ to: "/" });
              }}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CustomizationForm({
  initialBio,
  initialSocials,
}: {
  initialBio: string;
  initialSocials: ReturnType<typeof parseSocialLinks>;
}) {
  const [bio, setBio] = useState(initialBio);
  const [socials, setSocials] = useState<Record<string, string>>(() => ({
    x: initialSocials.x ?? "",
    twitch: initialSocials.twitch ?? "",
    youtube: initialSocials.youtube ?? "",
    tiktok: initialSocials.tiktok ?? "",
    instagram: initialSocials.instagram ?? "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    start(async () => {
      const r = await updateProfileCustomization({
        data: { bio, socials },
      });
      if (!r.ok) setError(r.message);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        Profile card
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        Bio &amp; socials
      </h2>
      <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
        Captains see your bio and social links when they hover your card on
        draft night.
      </p>

      <label className="mt-6 block">
        <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
          Bio (≤ 280 chars)
        </span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="A line or two — playstyle, role, vibe."
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
        />
        <span className="mt-1 block text-xs text-neutral-500">
          {bio.length}/280
        </span>
      </label>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {SOCIAL_LINKS.map((link) => (
          <label key={link.key} className="block">
            <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
              {link.label}
            </span>
            <input
              type="url"
              value={socials[link.key] ?? ""}
              onChange={(e) =>
                setSocials((s) => ({ ...s, [link.key]: e.target.value }))
              }
              placeholder={link.placeholder}
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
            />
          </label>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Saved. Captains will see the new card.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

type ViewerInfo = Awaited<ReturnType<typeof getViewer>>;
type NonNullViewer = Exclude<ViewerInfo, null>;

function RanksForm({ viewer }: { viewer: NonNullViewer }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const payload = {
      trackerUrl: String(fd.get("tracker_url") ?? "").trim(),
      rank2v2: String(fd.get("rank_2v2") ?? "").trim(),
      rank3v3: String(fd.get("rank_3v3") ?? "").trim(),
      peakRank: String(fd.get("peak_rank") ?? "").trim(),
      peakPlaylist: String(fd.get("peak_playlist") ?? "").trim() || undefined,
      inPlayerPool: viewer.inPlayerPool,
    };
    start(async () => {
      const r = await submitOnboarding({ data: payload });
      if (!r.ok) setError(r.message);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        Tracker &amp; ranks
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        Keep these honest.
      </h2>
      <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
        Captains see your tracker URL and the three ranks below on draft
        night.
      </p>

      <label className="mt-6 block">
        <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
          Rocket League Tracker URL
        </span>
        <input
          type="url"
          name="tracker_url"
          defaultValue={viewer.trackerUrl ?? ""}
          required
          placeholder="https://rocketleague.tracker.network/rocket-league/profile/steam/yourname/overview"
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
        />
      </label>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <RankSelect
          label="Current 2v2"
          name="rank_2v2"
          defaultValue={viewer.rank2v2 ?? ""}
          options={RL_RANK_TIERS as readonly string[]}
          required
        />
        <RankSelect
          label="Current 3v3"
          name="rank_3v3"
          defaultValue={viewer.rank3v3 ?? ""}
          options={RL_RANK_TIERS as readonly string[]}
          required
        />
        <RankSelect
          label="Peak rank"
          name="peak_rank"
          defaultValue={viewer.peakRank ?? ""}
          options={RL_RANK_TIERS as readonly string[]}
          required
        />
        <RankSelect
          label="Peak playlist"
          name="peak_playlist"
          defaultValue={viewer.peakPlaylist ?? ""}
          options={PEAK_PLAYLISTS}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function RankSelect({
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

function PoolToggle({ inPool }: { inPool: boolean }) {
  const [current, setCurrent] = useState(inPool);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggle() {
    setError(null);
    start(async () => {
      const r = await togglePoolMembership({ data: { wantIn: !current } });
      if (r.ok) setCurrent((c) => !c);
      else setError(r.message);
    });
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="max-w-xl">
        <div className="text-sm font-bold text-neutral-900 dark:text-white">
          {current ? "You're in the Season 4 pool" : "You're not in the pool"}
        </div>
        <div className="mt-0.5 text-xs text-neutral-500">
          {current
            ? "Captains can see your ranks and pick you on draft night."
            : "You won't be visible to captains. Rejoin any time."}
        </div>
        {error && (
          <p role="alert" className="mt-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          current
            ? "inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
            : "inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black transition hover:bg-thl-orange-deep disabled:opacity-60"
        }
      >
        {pending
          ? "Updating…"
          : current
            ? "Leave the pool"
            : "Rejoin the pool"}
      </button>
    </div>
  );
}

const PITCH_MIN = 40;
const PITCH_MAX = 1200;

function ApplicationCard({
  kind,
  isMember,
  hasApplied,
  initialPitch,
}: {
  kind: "captain" | "league-ops";
  isMember: boolean;
  hasApplied: boolean;
  initialPitch: string;
}) {
  const [pitch, setPitch] = useState(initialPitch);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [pending, start] = useTransition();

  const copy =
    kind === "captain"
      ? {
          eyebrow: "Captain application",
          title: "Want to draft a squad?",
          pitchLabel: "Your captain pitch",
          memberMsg: "You're a confirmed captain.",
          appliedMsg:
            "Application sent. League ops will review and DM you.",
          submitLabel: "Submit captain application",
        }
      : {
          eyebrow: "League-ops application",
          title: "Want to help run the league?",
          pitchLabel: "Your league-ops pitch",
          memberMsg: "You're on league ops.",
          appliedMsg:
            "Application sent. A current admin will review and DM you.",
          submitLabel: "Submit league-ops application",
        };

  const apply = kind === "captain" ? applyForCaptain : applyForLeagueOps;
  const withdraw =
    kind === "captain"
      ? withdrawCaptainApplication
      : withdrawLeagueOpsApplication;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    setWithdrawn(false);
    start(async () => {
      const r = await apply({ data: { pitch } });
      if (!r.ok) setError(r.message);
      else setSubmitted(true);
    });
  }

  function onWithdraw() {
    setError(null);
    start(async () => {
      const r = await withdraw();
      if (r.ok) {
        setWithdrawn(true);
        setSubmitted(false);
      } else {
        setError(r.message);
      }
    });
  }

  if (isMember) {
    return (
      <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-thl-orange/40 bg-thl-orange/5 p-5 dark:bg-thl-orange/10">
        <div>
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            {copy.eyebrow}
          </div>
          <div className="mt-1 text-sm font-bold">{copy.memberMsg}</div>
        </div>
      </div>
    );
  }

  if ((hasApplied || submitted) && !withdrawn) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="max-w-xl">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            {copy.eyebrow}
          </div>
          <div className="mt-1 text-sm font-bold">{copy.appliedMsg}</div>
        </div>
        <button
          type="button"
          onClick={onWithdraw}
          disabled={pending}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
        >
          {pending ? "Withdrawing…" : "Withdraw"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {copy.eyebrow}
      </div>
      <h3 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
        {copy.title}
      </h3>

      <label className="mt-4 block">
        <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
          {copy.pitchLabel}
        </span>
        <textarea
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          minLength={PITCH_MIN}
          maxLength={PITCH_MAX}
          rows={5}
          placeholder="A few sentences on why you'd be a good fit."
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
          {copy.appliedMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || pitch.length < PITCH_MIN || pitch.length > PITCH_MAX}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Submitting…" : copy.submitLabel}
      </button>
    </form>
  );
}

function SignOutCard({
  displayName,
  onSignedOut,
}: {
  displayName: string;
  onSignedOut: () => void;
}) {
  const [pending, start] = useTransition();
  function onClick() {
    start(async () => {
      await signOut();
      onSignedOut();
    });
  }
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <div className="text-sm font-bold text-neutral-900 dark:text-white">
          Signed in as {displayName}
        </div>
        <div className="mt-0.5 text-xs text-neutral-500">
          Discord identity managed by Supabase Auth.
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-rose-500"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
