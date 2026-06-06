import Image from "next/image";
import { Beer, Users, Gamepad2, Clock, GlassWater, PartyPopper } from "lucide-react";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "SH*T Faced Saturday",
  description:
    "The Hat League's friendly Saturday hang — crack a cold one and queue up with the crew. No brackets, no pressure, just buds, beers, and Rocket League.",
};

export default function ShitfacedSaturdayPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="The Hat League · Every Saturday"
        title="SH*T Faced"
        accent="Saturday"
        subtitle={
          <>
            Crack a cold one and queue up with the crew. No brackets, no sweat —
            just buds, beers, and Rocket League every Saturday night. Roll solo
            or bring a squad; the only entry fee is a drink in hand.
          </>
        }
        actions={
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-6 text-base font-bold text-white shadow-lg shadow-[#5865F2]/30 transition hover:bg-[#4752c4] active:scale-[0.98]"
          >
            <DiscordIcon className="h-5 w-5" />
            Join the Discord
          </a>
        }
        aside={
          <div className="relative mx-auto aspect-square w-full max-w-[320px]">
            <Image
              src="/brand/SFS.png"
              alt="SH*T Faced Saturday"
              fill
              priority
              sizes="320px"
              className="object-contain drop-shadow-[0_8px_30px_rgba(255,107,0,0.3)]"
            />
          </div>
        }
      />

      <div className="mx-auto max-w-[1320px] space-y-12 px-6 pb-24 md:space-y-16 md:px-10">
        {/* The vibe */}
        <section>
          <div className="text-[10px] font-bold tracking-[0.28em] text-thl-orange uppercase">
            The vibe
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight md:text-3xl">
            Kick back.{" "}
            <span className="font-marker font-normal text-thl-orange">
              Crack one open.
            </span>
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <VibeCard
              icon={Beer}
              title="Bring a beer"
              body="Beer, seltzer, whatever's cold — the only entry fee is a drink in hand."
            />
            <VibeCard
              icon={Users}
              title="Bring your buds"
              body="Grab a squad or roll solo and meet the regulars. Everyone's welcome at the table."
            />
            <VibeCard
              icon={Gamepad2}
              title="Leave the sweat at home"
              body="No standings, no pressure. Casual lobbies, dumb plays, and good times till last call."
            />
          </div>
        </section>

        {/* How it goes down */}
        <section className="relative overflow-hidden rounded-3xl border border-thl-orange/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-7 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-thl-orange/15 blur-3xl"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="text-[10px] font-bold tracking-[0.28em] text-thl-orange uppercase">
                How it goes down
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Every Saturday{" "}
                <span className="font-marker font-normal text-thl-orange">
                  night.
                </span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
                No sign-ups, no bracket — just show up. We spin up lobbies in the
                Discord, hop in voice, and run it back until somebody&apos;s
                gotta call it a night.
              </p>
              <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-neutral-300">
                <Clock className="size-4 text-thl-orange" />
                Saturdays · ~9pm ET ·{" "}
                <span className="text-thl-orange">SFS (BYOB) voice</span>
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3 lg:max-w-xl">
              {[
                { n: 1, t: "Hop in the Discord", b: "Drop into the server before kickoff." },
                { n: 2, t: "Join SFS (BYOB)", b: "Hop into the SFS (BYOB) voice channel and say hey." },
                { n: 3, t: "Pour & play", b: "We build the lobbies — you bring the drink." },
              ].map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-thl-orange/15 text-xs font-extrabold text-thl-orange tabular-nums">
                    {s.n}
                  </span>
                  <div className="mt-3 text-sm font-bold text-white">{s.t}</div>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    {s.b}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The drinking rules */}
        <section>
          <div className="text-[10px] font-bold tracking-[0.28em] text-thl-orange uppercase">
            House rules
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight md:text-3xl">
            The drinking{" "}
            <span className="font-marker font-normal text-thl-orange">rules.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500 md:text-base dark:text-neutral-400">
            Light, simple, and made to get bent. Here&apos;s how a night runs:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <RuleCard
              icon={GlassWater}
              tag="The golden rule"
              title="Don't say drink, drank, or drunk"
              body="The three forbidden words are off-limits all night. Let one slip out and you owe the lobby a sip."
            />
            <RuleCard
              icon={PartyPopper}
              tag="Players' choice"
              title="Make your own rule"
              body="Anyone can call for a new house rule — pitch it to the lobby, and if it sticks, it's law till last call."
            />
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
            <GlassWater className="size-3.5" />
            21+. Please drink responsibly — hydrate, know your limit, and never
            drive.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

function VibeCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Beer;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-thl-orange hover:shadow-[0_22px_45px_-22px_rgba(247,97,3,0.55)] dark:border-neutral-800 dark:bg-neutral-950">
      <span className="grid size-11 place-items-center rounded-xl bg-thl-orange/15 text-thl-orange transition group-hover:scale-110">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-lg font-bold tracking-tight transition-colors group-hover:text-thl-orange">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{body}</p>
    </div>
  );
}

function RuleCard({
  icon: Icon,
  tag,
  title,
  body,
}: {
  icon: typeof Beer;
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.06] via-white to-white p-5 dark:from-amber-400/[0.08] dark:via-neutral-950 dark:to-neutral-950">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-lg bg-amber-400/15 text-amber-500">
          <Icon className="size-5" />
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">
          {tag}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {body}
      </p>
    </div>
  );
}
