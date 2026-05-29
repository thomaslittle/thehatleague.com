import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { ogMeta } from "@/lib/og";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: ogMeta({ title: "About · The Hat League", description: "Who runs The Hat League, why it exists, and how Season 4 fits in.", dynamic: true }),
  }),
});

const VALUES = [
  {
    eyebrow: "Show up",
    title: "If you sign up, you play.",
    body: "Captains shouldn't have to chase you down. Lock in your nights, communicate when something comes up, and the lobby works.",
  },
  {
    eyebrow: "Be a hat dad",
    title: "Be a hat dad about it.",
    body: "No slurs, no targeted heat, no nuking the lobby. Disagreements get resolved in the captains channel before they get loud.",
  },
  {
    eyebrow: "Have fun",
    title: "More than mid, less than pro.",
    body: "Nobody pays us, nobody wins anything. The hat is the trophy. Take it seriously enough to compete, lightly enough to enjoy it.",
  },
];

const FAQ = [
  {
    q: "Who's the league for?",
    a: "Anyone with a hat, a job, and 1–2 nights a week to commit. Most of us peak somewhere between Plat and Champ — but rank isn't the gate, showing up is. Bring your hat.",
  },
  {
    q: "How does the draft work?",
    a: "Captains pick from the player pool live on Twitch. Snake or straight order is decided at the gate; chat sets the pick order. After the draft we publish team rosters and the schedule drops the next morning.",
  },
  {
    q: "What's the time commitment?",
    a: "Five-week regular season, Friday–Sunday 9–11pm EST match windows. Two opponents a week, five games each (not best-of). Then playoffs.",
  },
  {
    q: "I want to captain. How?",
    a: "Sign in, hit the captains page, drop a 3–4 sentence pitch. League ops reviews and DMs back within a couple days.",
  },
  {
    q: "Is this affiliated with Epic/Psyonix?",
    a: "Nope. THL is a community-run series. We pay for nothing, we own nothing, we're just dads with hats.",
  },
];

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <PageHero
          eyebrow="About · The Hat League"
          title="A draft-style RL league"
          accent="for hat dads."
          subtitle={
            <>
              Started as a Discord side-quest in 2020. Three seasons in the
              books, two conferences, captains picked from chat, and
              whoever&apos;s left wearing the hat at the end of the bracket.
            </>
          }
          actions={
            <>
              <Link
                to="/the-draft"
                className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
              >
                How the draft works
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3.5 font-bold text-white transition hover:bg-[#4752c4]"
              >
                <DiscordIcon className="h-5 w-5" />
                Join the Discord
              </a>
            </>
          }
        />

        <section className="mx-auto max-w-[1320px] px-6 pb-20 md:px-10 md:pb-24">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            What we&apos;re about
          </div>
          <h2 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.03em] md:text-5xl">
            Three commitments.{" "}
            <span className="font-marker font-normal text-thl-orange">
              Pinky promise.
            </span>
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.eyebrow}
                className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                  {v.eyebrow}
                </div>
                <div className="mt-2 font-marker text-2xl md:text-3xl">
                  {v.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
          <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-24">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              FAQ
            </div>
            <h2 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.03em] md:text-5xl">
              Common questions.
            </h2>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-neutral-200 bg-white p-5 open:border-thl-orange dark:border-neutral-800 dark:bg-black"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-neutral-900 dark:text-white">
                    <span>{item.q}</span>
                    <span className="text-thl-orange group-open:rotate-45 transition">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 font-bold text-white transition hover:bg-[#4752c4]"
              >
                <DiscordIcon className="h-5 w-5" />
                Hop in the Discord
              </a>
              <Link
                to="/rules"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-800 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-200"
              >
                Read the rules <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
