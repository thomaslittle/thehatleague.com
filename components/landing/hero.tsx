import Image from "next/image";
import Link from "next/link";
import { ArrowRight, DiscordIcon, TwitchIcon } from "@/components/icons/brand";
import { HeroLogoIntro } from "@/components/landing/hero-logo-intro";
import { SITE } from "@/lib/site";
import type { ViewerInfo } from "@/components/landing/site-header";

const TICKER = [
  "Draft date announced soon",
  "S3 Sombrero champ · Almost Legal (DrSpaceman88)",
  "S3 Fedora champ · Das Boost (Dark0bra)",
  "Draft order revealed live on stream",
  "Captains lock 48h before draft",
  "Games scheduled Fri–Sun · 9–11pm EST",
];

export function Hero({
  viewer,
  poolCount = 0,
  captainCount = 0,
}: {
  viewer?: ViewerInfo | null;
  poolCount?: number;
  captainCount?: number;
} = {}) {
  const isAuthed = !!viewer?.isAuthenticated;
  const inPool = !!viewer?.inPool;
  const firstName = viewer?.displayName?.split(/[\s_]/)[0] ?? null;
  return (
    <>
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Image
          src="/brand/thl-fennec.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30 dark:opacity-40"
          style={{ objectPosition: "55% 35%" }}
        />
        {/* Soft left-side fade — headline stays readable, photo still reads. */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-white/0 dark:from-black/80 dark:via-black/35 dark:to-black/0" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-white dark:to-black" />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 18% 10%, rgba(247,97,3,0.32), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(247,97,3,0.14), transparent 60%)",
          }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80 dark:opacity-100"
      >
        <div
          className="absolute top-[-10%] right-[-10%] h-[640px] w-[640px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(247,97,3,0.18), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[-10%] h-[520px] w-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(247,97,3,0.08), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 pt-16 pb-16 md:px-10 md:pt-24 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <div className="mb-7 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-thl-orange px-3 py-1 text-[11px] font-bold tracking-[0.16em] whitespace-nowrap text-black uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                S04 · Live draft · Date TBA
              </span>
            </div>

            <div className="relative">
              <Image
                src="/brand/hdg-hat-trans.png"
                alt=""
                aria-hidden
                width={420}
                height={320}
                priority
                style={{
                  transform: "rotate(-15deg)",
                  transformOrigin: "70% 50%",
                }}
                className="pointer-events-none absolute top-[-20px] left-[-29px] z-10 w-[77px] drop-shadow-[0_10px_14px_rgba(0,0,0,0.55)] sm:top-[-24px] sm:left-[-36px] sm:w-[96px] lg:top-[-32px] lg:left-[-47px] lg:w-[125px]"
              />
              <h1 className="text-[64px] leading-[0.92] font-bold tracking-[-0.045em] text-neutral-900 sm:text-[80px] lg:text-[104px] dark:text-white">
                Hat&nbsp;up.
                <br />
                Pick your
                <br />
                <span className="font-marker font-normal tracking-normal text-thl-orange">
                  squad.
                </span>
              </h1>
            </div>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-neutral-600 md:text-xl dark:text-neutral-400">
              {isAuthed && inPool ? (
                <>
                  Welcome back{firstName ? `, ${firstName}` : ""}. You&apos;re
                  in the Season 4 pool. Captains start scouting now. Keep your
                  ranks current, watch for the draft announcement.
                </>
              ) : isAuthed ? (
                <>
                  Welcome back{firstName ? `, ${firstName}` : ""}. You&apos;re
                  signed in but not in the pool yet — jump in so captains can
                  scout you before the draft.
                </>
              ) : (
                <>
                  A Rocket League tournament series built for the hat dads, the
                  night-shift sweats, and the players who measure rank in years
                  not hours. Sign up, get drafted, bring your hat.
                </>
              )}
            </p>

            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-[auto_auto] sm:items-center">
              {isAuthed && inPool ? (
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-thl-orange px-6 py-4 text-base font-bold whitespace-nowrap text-black shadow-[0_10px_40px_-12px_rgba(247,97,3,0.6)] transition hover:bg-thl-orange-deep active:scale-[0.98] sm:w-auto"
                >
                  Open your dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : isAuthed ? (
                <Link
                  href="/settings"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-thl-orange px-6 py-4 text-base font-bold whitespace-nowrap text-black shadow-[0_10px_40px_-12px_rgba(247,97,3,0.6)] transition hover:bg-thl-orange-deep active:scale-[0.98] sm:w-auto"
                >
                  Join the player pool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-thl-orange px-6 py-4 text-base font-bold whitespace-nowrap text-black shadow-[0_10px_40px_-12px_rgba(247,97,3,0.6)] transition hover:bg-thl-orange-deep active:scale-[0.98] sm:w-auto"
                >
                  <DiscordIcon className="h-5 w-5" />
                  Sign up with Discord
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <a
                href={SITE.twitchUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#9146ff] px-6 py-4 text-base font-bold whitespace-nowrap text-white shadow-[0_10px_40px_-12px_rgba(145,70,255,0.6)] transition hover:bg-[#7c2bff] active:scale-[0.98] sm:w-auto"
              >
                <TwitchIcon className="h-5 w-5" />
                Watch on Twitch
              </a>
            </div>

          </div>

          <div className="relative">
            <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-white/40 bg-white/20 px-6 pt-12 pb-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] md:aspect-[1/1.05] md:gap-0 md:p-8 lg:p-10 dark:border-white/15 dark:bg-black/35 dark:shadow-[0_30px_80px_-20px_rgba(247,97,3,0.3)]">
              <div className="absolute top-4 left-5 text-[10px] font-bold tracking-[0.22em] text-neutral-400 uppercase md:top-5 dark:text-neutral-600">
                Season 04
              </div>
              <div className="absolute top-4 right-5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] whitespace-nowrap text-thl-orange uppercase md:top-5">
                <span className="h-1.5 w-1.5 rounded-full bg-thl-orange" />
                Live soon
              </div>

              <div className="flex w-full flex-1 items-center justify-center md:pt-4">
                <HeroLogoIntro />
              </div>

              <div className="flex w-full items-end justify-between gap-4 border-t border-dashed border-neutral-300 pt-5 md:pt-6 dark:border-neutral-800">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase dark:text-neutral-500">
                    Draft Night
                  </div>
                  <div className="mt-1 font-marker text-3xl leading-none text-neutral-900 dark:text-white">
                    Date&nbsp;TBA
                  </div>
                  <a
                    href={SITE.twitchUrl}
                    target="_blank"
                    rel="noopener"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-neutral-600 transition hover:text-[#9146ff] dark:text-neutral-400 dark:hover:text-[#a970ff]"
                  >
                    <TwitchIcon className="h-3 w-3" />
                    {SITE.twitchHandle}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-thl-orange px-3 py-2 text-center text-black">
                    <div className="text-2xl leading-none font-extrabold tabular-nums">
                      {poolCount.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[9px] font-bold tracking-[0.2em] uppercase">
                      In pool
                    </div>
                  </div>
                  <div className="rounded-lg border border-neutral-300 px-3 py-2 text-center dark:border-neutral-700">
                    <div className="text-2xl leading-none font-extrabold tabular-nums text-neutral-900 dark:text-white">
                      {captainCount.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                      Captains
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* Ticker is its own block — must NOT be inside the hero section, or
        the section's bottom-fade gradient overlays it. */}
    <div className="relative z-10 overflow-hidden border-y-2 border-black bg-thl-orange text-black shadow-[0_8px_30px_-8px_rgba(247,97,3,0.55)] dark:border-white/10">
      <div className="flex items-stretch">
        <div className="flex shrink-0 items-center bg-black px-4 py-3 text-[10px] font-extrabold tracking-[0.18em] whitespace-nowrap text-thl-orange md:px-10 md:py-3.5 md:text-xs md:tracking-[0.22em]">
          ⚡ LIVE FEED
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="thl-ticker flex w-max gap-6 py-3 pl-4 text-xs font-bold whitespace-nowrap md:gap-10 md:py-3.5 md:pl-6 md:text-sm">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-6 whitespace-nowrap md:gap-10">
                <span className="whitespace-nowrap">{item}</span>
                <span className="opacity-60">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
