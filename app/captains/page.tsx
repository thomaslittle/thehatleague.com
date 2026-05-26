import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CaptainApplication } from "@/components/captains/captain-application";
import { SITE } from "@/lib/site";
import { RankBadge } from "@/components/ranks/rank-badge";

export const metadata = {
  title: "Captains",
  description:
    "Season 4 captains — the ones doing the picking. Apply to captain from this page.",
};

const HANDBOOK = [
  {
    title: "Show up to the draft",
    body: "If you can't be there live, you don't captain — no proxies. Plan around it.",
  },
  {
    title: "Pick your squad in order",
    body: "We use a chat-driven order on the night. Snake or straight, decided at the gate.",
  },
  {
    title: "Own scheduling",
    body: "You coordinate matches in the captains channel. Subs are pre-approved only.",
  },
  {
    title: "Submit replays",
    body: "One captain per matchup uploads to ballchasing.com so stats roll in.",
  },
];

export default async function CaptainsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: confirmed } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, discord_global_name, discord_avatar_url, peak_rank, peak_rank_playlist, captain_pitch",
    )
    .eq("is_captain", true)
    .order("created_at", { ascending: true });

  let viewerProfile: {
    is_captain: boolean;
    is_captain_applicant: boolean;
    captain_pitch: string | null;
  } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_captain, is_captain_applicant, captain_pitch")
      .eq("id", user.id)
      .single();
    viewerProfile = data;
  }

  const captains = confirmed ?? [];
  const showApplicationSection = !!user;

  return (
    <PageShell>
      <PageHero
        eyebrow="Captains · Season 04"
        title="The ones doing the picking."
        accent={captains.length === 0 ? "Roster TBA." : `${captains.length} confirmed.`}
        subtitle={
          <>
            Captain confirmations are locked 48 hours before draft night.
            Confirmed captains show below as they sign on; everyone else can
            apply directly from this page.
          </>
        }
        actions={
          !user ? (
            <Link
              href="/signin?redirect=/captains"
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
            {captains.map((c) => {
              const name = c.discord_global_name ?? c.discord_username ?? "Captain";
              const profileHref = c.discord_username
                ? `/players/${encodeURIComponent(c.discord_username)}`
                : null;
              return (
                <li
                  key={c.id}
                  className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange"
                >
                  <div className="flex items-center gap-3">
                    {c.discord_avatar_url ? (
                      <Image
                        src={c.discord_avatar_url}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized
                        className="h-14 w-14 rounded-full border border-thl-orange/30"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-base font-bold">
                        {name}
                      </div>
                      <div className="truncate text-xs text-neutral-500">
                        @{c.discord_username ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-thl-orange/30 bg-thl-orange/5 px-3 py-2">
                    <div className="text-[9px] font-bold tracking-[0.18em] text-thl-orange uppercase">
                      Peak{c.peak_rank_playlist ? ` · ${c.peak_rank_playlist}` : ""}
                    </div>
                    <div className="mt-0.5">
                      <RankBadge
                        value={c.peak_rank}
                        size={18}
                        textClassName="text-sm font-bold text-thl-orange truncate"
                      />
                    </div>
                  </div>
                  {c.captain_pitch && (
                    <blockquote className="mt-4 border-l-2 border-thl-orange/40 pl-3 text-sm leading-relaxed text-neutral-700 italic dark:text-neutral-300">
                      &ldquo;{c.captain_pitch}&rdquo;
                    </blockquote>
                  )}
                  {profileHref && (
                    <Link
                      href={profileHref}
                      className="mt-auto pt-4 text-xs font-semibold text-thl-orange underline-offset-4 hover:underline"
                    >
                      View captain profile →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {showApplicationSection && (
        <section
          id="apply"
          className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950"
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
                  href="/rules#playoffs"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
                >
                  Captain responsibilities <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <CaptainApplication
                alreadyApplied={viewerProfile?.is_captain_applicant ?? false}
                initialPitch={viewerProfile?.captain_pitch ?? ""}
                isCaptain={viewerProfile?.is_captain ?? false}
              />
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Captain&apos;s handbook
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
            What you&apos;re signing up for.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {HANDBOOK.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black"
              >
                <h3 className="font-marker text-2xl">{h.title}</h3>
                <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {h.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            Full responsibilities live in the{" "}
            <Link
              href="/rules"
              className="font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              ruleset
            </Link>
            . If you have questions, ping{" "}
            <a
              href={SITE.discordInvite}
              target="_blank"
              rel="noopener"
              className="font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              #captains on Discord
            </a>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
