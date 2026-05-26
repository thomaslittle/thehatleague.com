import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata = {
  title: "OG preview · Admin",
  description: "Live preview of every Open Graph card the site emits.",
};

interface CardEntry {
  path: string;
  pageUrl: string;
  ogUrl: string;
  title: string;
  description: string;
  domain: string;
}

const CARDS: CardEntry[] = [
  {
    path: "/",
    pageUrl: "/",
    ogUrl: "/opengraph-image",
    title: "The Hat League — Season 04",
    description:
      "More than mid, less than pro. A draft-style Rocket League series — sign up, get drafted live on Twitch, bring your hat.",
    domain: "thehatleague.com",
  },
  {
    path: "/the-draft",
    pageUrl: "/the-draft",
    ogUrl: "/the-draft/opengraph-image",
    title: "The Draft — Season 04 · The Hat League",
    description:
      "Live-streamed draft. Captains pick their squads in front of chat — one round, every player, no second chances.",
    domain: "thehatleague.com",
  },
  {
    path: "/captains",
    pageUrl: "/captains",
    ogUrl: "/captains/opengraph-image",
    title: "Captains · The Hat League",
    description:
      "Apply to captain Season 04 — the ones doing the picking on draft night.",
    domain: "thehatleague.com",
  },
  {
    path: "/pool",
    pageUrl: "/pool",
    ogUrl: "/pool/opengraph-image",
    title: "Player Pool · The Hat League",
    description:
      "Everyone signed up for the Season 04 draft. Sortable by rank — live, updates instantly.",
    domain: "thehatleague.com",
  },
  {
    path: "/standings",
    pageUrl: "/standings",
    ogUrl: "/standings/opengraph-image",
    title: "Standings · The Hat League",
    description:
      "Season 03 final standings — two conferences, one hat. Sombrero + Fedora regular season + playoffs.",
    domain: "thehatleague.com",
  },
  {
    path: "/leaderboards",
    pageUrl: "/leaderboards",
    ogUrl: "/leaderboards/opengraph-image",
    title: "Leaderboards · The Hat League",
    description:
      "Every hat, every stat. Season 3's full ledger — 60 players, 5 categories.",
    domain: "thehatleague.com",
  },
  {
    path: "/rules",
    pageUrl: "/rules",
    ogUrl: "/rules/opengraph-image",
    title: "Rules · The Hat League",
    description:
      "Season 3 ruleset archived here; Season 4 update in progress. TBA fields lock as decisions land.",
    domain: "thehatleague.com",
  },
  {
    path: "/players/tomlit",
    pageUrl: "/players/tomlit",
    ogUrl: "/players/tomlit/opengraph-image",
    title: "tomlit · Player profile",
    description:
      "tomlit's Season 4 Hat League profile — ranks, peak, tracker link.",
    domain: "thehatleague.com",
  },
];

export default async function OgPreviewPage() {
  await requireAdmin("/admin/og-preview");

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Admin · OG preview
            </div>
            <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
              How the site looks{" "}
              <span className="font-marker font-normal text-thl-orange">
                shared.
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Every Open Graph card on the site, rendered live. Left
              column is the raw 1200×630 image. Right column is a
              Discord-style mock of how the link unfurls in a chat.
              Discord caches aggressively — if a preview looks stale in
              production, paste the link in{" "}
              <a
                href="https://discord.com/channels/@me/@me"
                target="_blank"
                rel="noopener"
                className="font-semibold text-thl-orange underline-offset-4 hover:underline"
              >
                Discord DMs
              </a>{" "}
              to refresh.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
          >
            ← Admin
          </Link>
        </div>

        <ul className="mt-10 grid gap-10">
          {CARDS.map((card) => (
            <li key={card.path}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                <Link
                  href={card.pageUrl}
                  className="font-mono text-sm font-bold text-thl-orange underline-offset-4 hover:underline"
                >
                  {card.path}
                </Link>
                <a
                  href={card.ogUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-xs font-semibold text-neutral-500 underline-offset-4 hover:text-thl-orange hover:underline"
                >
                  Open raw image ↗
                </a>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${card.ogUrl}?preview=1`}
                    alt={`OG card for ${card.path}`}
                    width={1200}
                    height={630}
                    className="block h-auto w-full"
                  />
                </div>
                <DiscordMock card={card} />
              </div>
            </li>
          ))}
        </ul>
      </section>
  );
}

function DiscordMock({ card }: { card: CardEntry }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-[#313338] p-4 text-white dark:border-neutral-800">
      <div className="mb-2 text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
        Discord preview
      </div>
      <div className="overflow-hidden rounded-md border-l-4 border-l-thl-orange bg-[#2b2d31] p-4">
        <div className="text-xs text-[#b5bac1]">{card.domain}</div>
        <div className="mt-1 text-base leading-tight font-semibold text-[#00a8fc] hover:underline">
          {card.title}
        </div>
        <div className="mt-2 text-sm leading-relaxed text-[#dbdee1]">
          {card.description}
        </div>
        <div className="mt-3 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${card.ogUrl}?preview=1`}
            alt=""
            width={1200}
            height={630}
            className="block h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
