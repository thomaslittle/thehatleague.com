import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { ProfileCustomizationForm } from "@/components/settings/profile-customization-form";
import { signOut } from "@/app/actions/auth";
import { togglePoolMembership } from "@/app/actions/onboarding";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden"
        >
          <Image
            src="/brand/thl-fennec.png"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-40 dark:opacity-45"
            style={{ objectPosition: "55% 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/25 dark:from-black/80 dark:via-black/45 dark:to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white dark:to-black" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 18% 10%, rgba(247,97,3,0.32), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(247,97,3,0.14), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-[0.08] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,1), transparent 90%)",
          }}
        />
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
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
            >
              ← Back to dashboard
            </Link>
          </div>

          <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            <ProfileCustomizationForm
              bio={profile.bio}
              socialLinks={profile.social_links}
              hasCustomAvatar={!!profile.profile_avatar_url}
              hasCustomBanner={!!profile.profile_banner_url}
            />
          </div>

          <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            <OnboardingForm
              from="settings"
              submitLabel="Save changes"
              pendingLabel="Saving…"
              defaults={{
                tracker_url: profile.rl_tracker_url,
                rank_2v2: profile.rank_2v2,
                rank_3v3: profile.rank_3v3,
                peak_rank: profile.peak_rank,
                peak_playlist: profile.peak_rank_playlist,
              }}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="max-w-xl">
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                {profile.in_player_pool
                  ? "You're in the Season 4 pool"
                  : "You're not in the pool"}
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                {profile.in_player_pool
                  ? "Captains can see your ranks and pick you on draft night."
                  : "You won't be visible to captains. Rejoin any time."}
              </div>
            </div>
            <form action={togglePoolMembership}>
              <input
                type="hidden"
                name="want_in"
                value={profile.in_player_pool ? "0" : "1"}
              />
              <button
                type="submit"
                className={
                  profile.in_player_pool
                    ? "inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-300"
                    : "inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black transition hover:bg-thl-orange-deep"
                }
              >
                {profile.in_player_pool ? "Leave the pool" : "Rejoin the pool"}
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">
                Signed in as {profile.discord_global_name ?? profile.discord_username ?? user.email}
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                Discord ID: {profile.discord_id ?? "—"}
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-rose-500"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
