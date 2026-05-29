import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { SessionCta } from "@/components/page/session-cta";
import { ArrowRight, DiscordIcon, TwitchIcon } from "@/components/icons/brand";
import { getViewer } from "@/lib/auth/viewer";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    "Who runs The Hat League, why it exists, and how Season 4 fits in.",
};

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
    q: "I can't make the draft. Can someone pick for me?",
    a: "Yes — you stay in the pool and captains pick as normal. You just don't get a say in which team. Show up on draft night if you want input.",
  },
  {
    q: "What if I'm a way better/worse player than I said?",
    a: "Captains can see your tracker so misrepresenting ranks doesn't last long. Update them honestly in /settings and you stay credible.",
  },
  {
    q: "I want to captain. How?",
    a: "Sign in, hit /captains, drop a 3–4 sentence pitch about how you'd run a lobby. League ops reviews and DMs back within a couple days.",
  },
  {
    q: "Is this affiliated with Epic/Psyonix?",
    a: "Nope. THL is a community-run series. We pay for nothing, we own nothing, we're just dads with hats.",
  },
];

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

export default async function AboutPage() {
  const viewer = await getViewer();
  return (
    <PageShell>
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
              href="/the-draft"
              className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
            >
              How the draft works
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE.discordInvite}
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

      <section className="mx-auto max-w-[1080px] px-6 pb-16 md:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map((v) => (
            <article
              key={v.eyebrow}
              className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                {v.eyebrow}
              </div>
              <h3 className="mt-3 font-marker text-2xl">{v.title}</h3>
              <p className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400">
                {v.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1080px] px-6 py-16 md:px-10 md:py-20">
          <div className="grid gap-12 md:grid-cols-[260px_1fr]">
            <div className="md:sticky md:top-24 md:self-start">
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                FAQ
              </div>
              <h2 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.02em]">
                Frequently asked.
              </h2>
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Anything not covered here, ask in the{" "}
                <a
                  href={SITE.discordInvite}
                  target="_blank"
                  rel="noopener"
                  className="font-semibold text-thl-orange underline-offset-4 hover:underline"
                >
                  #help channel on Discord
                </a>
                .
              </p>
            </div>

            <dl className="grid gap-3">
              {FAQ.map((item, i) => (
                <details
                  key={item.q}
                  open={i === 0}
                  className="group rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition open:shadow-sm dark:border-neutral-800 dark:bg-black"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-base font-bold tracking-tight">
                    {item.q}
                    <span className="text-thl-orange transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <dd className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {item.a}
                  </dd>
                </details>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1080px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-10 rounded-3xl border border-thl-orange/30 bg-thl-orange/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Ready to play?
            </div>
            <h2 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
              Get your hat in the ring.
            </h2>
            <p className="mt-3 max-w-md text-neutral-700 dark:text-neutral-300">
              Sign in with Discord, paste your tracker URL, confirm three
              ranks. Captains start scouting the same day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:flex-col md:items-stretch">
            <SessionCta viewer={viewer} signedOutLabel="Sign up" />
            <a
              href={SITE.twitchUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-[#9146ff] hover:text-[#9146ff] dark:border-neutral-700 dark:text-neutral-300"
            >
              <TwitchIcon className="h-4 w-4" />
              Watch on Twitch
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
