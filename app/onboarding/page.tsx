import { redirect } from "next/navigation";
import Image from "next/image";
import { readThemePref } from "@/lib/theme";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";
import { skipOnboarding } from "@/app/actions/onboarding";

export const metadata = {
  title: "Onboarding",
};

export default async function OnboardingPage() {
  const theme = await readThemePref();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (
    profile?.rl_tracker_url &&
    profile.rank_2v2 &&
    profile.rank_3v3 &&
    profile.peak_rank
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-white">
      <SiteHeader theme={theme} showSignup={false} />
      <main id="main" className="relative">
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

              <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
                <OnboardingForm
                  defaults={{
                    in_player_pool: profile?.in_player_pool ?? true,
                  }}
                />
              </div>

              <form action={skipOnboarding} className="mt-4 text-center">
                <button
                  type="submit"
                  className="text-sm font-semibold text-neutral-500 underline-offset-4 hover:text-thl-orange hover:underline"
                >
                  Skip for now — I&apos;ll add ranks before the draft
                </button>
              </form>

              <details className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                <summary className="cursor-pointer font-semibold text-neutral-900 dark:text-white">
                  Why are we asking you and not just pulling it?
                </summary>
                <p className="mt-3 leading-relaxed">
                  rocketleague.tracker.network sits behind Cloudflare bot
                  protection that blocks server-side fetches. We&apos;re
                  building an automated pull that
                  will refresh ranks on a schedule — but until that&apos;s
                  online, the manual confirm-and-go form is the cleanest way
                  to get accurate ranks in front of captains.
                </p>
              </details>
            </div>

            <aside className="relative">
              <div className="sticky top-28 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 md:bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex items-center gap-3">
                  {profile?.discord_avatar_url ? (
                    <Image
                      src={profile.discord_avatar_url}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
                      {(profile?.discord_username ?? "??").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                      {profile?.discord_global_name ??
                        profile?.discord_username ??
                        "your_handle"}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                      Discord verified · S04 setup
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    You choose whether to enter the Season 04 player pool on
                    this form. Captains can scout you once your ranks are saved.
                  </p>
                </div>
                <a
                  href={SITE.discordInvite}
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
