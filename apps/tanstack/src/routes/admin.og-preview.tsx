import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/server/auth";
import { AdminTabs } from "./admin";

interface OgEntry {
  path: string;
  title: string;
  description: string;
  subtitle?: string;
  eyebrow?: string;
}

function imageFor(e: OgEntry): string {
  const params = new URLSearchParams({
    title: e.title,
    subtitle: e.subtitle ?? e.description,
    eyebrow: e.eyebrow ?? "Season 04",
  });
  return `/api/og?${params.toString()}`;
}

const ENTRIES: OgEntry[] = [
  {
    path: "/",
    title: "The Hat League · Season 04",
    description:
      "A draft-style Rocket League tournament series for hat dads. More than mid, less than pro.",
    subtitle: "A draft-style Rocket League series",
  },
  {
    path: "/the-draft",
    title: "The Draft · The Hat League",
    description:
      "A live-streamed Rocket League draft for The Hat League Season 4. Captains pick their squads on Twitch. Date TBA.",
    subtitle: "Captains pick live. One night. Date TBA.",
    eyebrow: "The Draft · Season 04",
  },
  {
    path: "/pool",
    title: "Player pool · The Hat League",
    description:
      "Every player currently in The Hat League Season 4 player pool — ranks, captains, and recent sign-ups.",
  },
  {
    path: "/standings",
    title: "Standings · The Hat League",
    description:
      "Season 3 final standings (Fedora + Sombrero). Season 4 live standings land after draft.",
  },
  {
    path: "/leaderboards",
    title: "Leaderboards · The Hat League",
    description:
      "Season 3 leaderboards by category and conference. Season 4 board lands once ballchasing pipeline is live.",
  },
  {
    path: "/schedule",
    title: "Schedule · The Hat League",
    description:
      "The Hat League schedule. Drops once the draft sets the bracket.",
  },
  {
    path: "/captains",
    title: "Captains · The Hat League",
    description:
      "Become a Hat League captain — draft your squad, run point on Discord, hoist the hat.",
  },
  {
    path: "/clips",
    title: "Clips & highlights · The Hat League",
    description:
      "Clips streamed from the Discord #clips-and-highlights channel.",
  },
  {
    path: "/rules",
    title: "Rules · The Hat League",
    description:
      "The Hat League rules — Season 3 archive, with Season 4 updates landing soon.",
  },
  {
    path: "/about",
    title: "About · The Hat League",
    description:
      "Who runs The Hat League, why it exists, and how Season 4 fits in.",
  },
  {
    path: "/mvp",
    title: "Season MVP · The Hat League",
    description:
      "End-of-season MVP voting for The Hat League Season 4. One player, one vote — voting opens after Conference Finals.",
  },
  {
    path: "/replays",
    title: "Replays · The Hat League",
    description:
      "Replay uploads go to ballchasing.com folders per team. Per-player stat ingestion lands here for Season 4.",
  },
  {
    path: "/announcements",
    title: "Announcements · The Hat League",
    description:
      "League announcements — draft updates, schedule changes, rule tweaks.",
  },
  {
    path: "/signin",
    title: "Sign in · The Hat League",
    description:
      "Sign in to The Hat League with Discord. We use Discord for identity, draft pings, and captain comms.",
  },
  {
    path: "/announcements/sample-slug",
    title: "Draft night locked — Friday July 19 · The Hat League",
    description:
      "Captains lock 48h before. Twitch goes live at 9pm EST. Pool freezes at draft start.",
    eyebrow: "Pinned · League ops",
    subtitle:
      "Captains lock 48h before. Twitch goes live at 9pm EST. Pool freezes at draft start.",
  },
  {
    path: "/players/tomlit",
    title: "tomlit · The Hat League",
    description: "tomlit's Season 4 Hat League profile — peak champion ii.",
    eyebrow: "Season 04 player",
    subtitle: "Peak Champion II · Duos",
  },
];

export const Route = createFileRoute("/admin/og-preview")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({
        to: "/signin",
        search: { redirect: "/admin/og-preview" },
      });
    }
    if (!viewer.isAdmin) throw notFound();
    return { viewer };
  },
  component: OgPreviewPage,
  head: () => ({
    meta: [
      { title: "Admin · OG preview · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function OgPreviewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main className="flex-1">
        <AdminTabs current="og-preview" />
        <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Open Graph preview
          </div>
          <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
            What share cards look like.
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
            Each route emits its own title, description, and image via{" "}
            <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-900">
              ogMeta()
            </code>
            . Images are generated on demand at{" "}
            <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-900">
              /api/og
            </code>{" "}
            via Satori + the brand fonts. Spot-check before pasting URLs
            in Discord or X.
          </p>

          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {ENTRIES.map((e) => (
              <Card key={e.path} entry={e} />
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Card({ entry }: { entry: OgEntry }) {
  const imageUrl = imageFor(entry);
  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="relative aspect-[1200/630] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900">
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          thehatleague.com{entry.path}
        </div>
        <div className="mt-2 text-base font-bold text-neutral-900 dark:text-white">
          {entry.title}
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {entry.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={entry.path}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-400"
          >
            Open page
          </a>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-400"
          >
            Open image
          </a>
        </div>
      </div>
    </li>
  );
}
