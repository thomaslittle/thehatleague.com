import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  DiscordIcon,
  HeartIcon,
  TwitchIcon,
} from "@/components/icons";
import { ClipDialog } from "@/components/clip-dialog";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { getRecentClips, type Clip } from "@/server/clips";
import { ogMeta } from "@/lib/og";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";
const FALLBACK_THUMB = "/brand/thl-fennec.png";
const SOURCE_BADGES: Record<Clip["source"], string> = {
  "discord-mp4": "Discord",
  "discord-image": "Discord",
  gifyourgame: "GIFYourGame",
  medal: "Medal",
  "twitch-clip": "Twitch",
  youtube: "YouTube",
  imgur: "Imgur",
  x: "X",
  other: "Link",
};

export const Route = createFileRoute("/clips")({
  component: ClipsPage,
  loader: () => getRecentClips({ data: { limit: 50 } }),
  head: () => ({
    meta: ogMeta({ title: "Clips & highlights · The Hat League", description: "Clips streamed from the Discord #clips-and-highlights channel.", dynamic: true }),
  }),
});

function ClipsPage() {
  const clips = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <PageHero
          eyebrow={`Clips · ${clips.length} from #clips-and-highlights`}
          title="The angles."
          accent="The bodies."
          subtitle={
            <>
              Streamed straight from{" "}
              <span className="font-semibold text-thl-orange">
                #clips-and-highlights
              </span>{" "}
              on the Discord. GIFYourGame, Medal, Twitch, YouTube, Imgur —
              drop one in the channel and it lands here.
            </>
          }
          actions={
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/40 px-5 py-3.5 font-semibold text-[#5865F2] transition hover:bg-[#5865F2]/10"
            >
              <DiscordIcon className="h-5 w-5" />
              Drop one in #clips
            </a>
          }
        />

        <section className="mx-auto max-w-[1320px] px-6 pb-20 md:px-10 md:pb-24">
          {clips.length === 0 ? (
            <EmptyClipsState />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {clips.map((c) => (
                <ClipCard key={c.id} clip={c} />
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
          <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
            <h3 className="font-marker text-2xl md:text-3xl">
              Until then, watch live.
            </h3>
            <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Stream nights surface the cleanest plays in real time — and
              they land in #clips minutes after, automatically.
            </p>
            <Link
              to="/the-draft"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              Draft format <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ClipCard({ clip }: { clip: Clip }) {
  const badge = SOURCE_BADGES[clip.source];
  const posted = new Date(clip.postedAt);
  return (
    <ClipDialog clip={clip}>
      {(open) => (
        <button
          type="button"
          onClick={open}
          className="group block w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
        >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900">
        <img
          src={clip.thumbnailUrl ?? FALLBACK_THUMB}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-white uppercase backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-thl-orange" />
          {badge}
        </div>
        {clip.videoUrl && (
          <div className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-thl-orange px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-black uppercase">
            ▶ Watch
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
          {clip.title}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
          {clip.authorAvatarUrl ? (
            <img
              src={clip.authorAvatarUrl}
              alt=""
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-thl-orange text-[9px] font-bold text-black">
              {(clip.author ?? "??").slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="truncate">{clip.author ?? "Unknown"}</span>
          <span>·</span>
          <span>
            {posted.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          {clip.reactionCount > 0 && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-thl-orange">
                <HeartIcon className="h-3 w-3" />
                {clip.reactionCount}
              </span>
            </>
          )}
        </div>
      </div>
        </button>
      )}
    </ClipDialog>
  );
}

function EmptyClipsState() {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-8 py-16 text-center dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-md">
        <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
          No clips yet
        </div>
        <h3 className="mt-3 font-marker text-3xl text-neutral-900 md:text-4xl dark:text-white">
          The first goal hasn&apos;t been scored.
        </h3>
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Once draft night kicks off and Season 4 starts, clips from
          #clips-and-highlights stream right into this section. To wire
          this up locally, set <code>DISCORD_BOT_TOKEN</code> +{" "}
          <code>DISCORD_CLIPS_CHANNEL_ID</code> in <code>.env.local</code>.
        </p>
        <a
          href="https://www.twitch.tv/thehatleague"
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#9146ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7c2bff]"
        >
          <TwitchIcon className="h-4 w-4" />
          Watch live instead
        </a>
      </div>
    </div>
  );
}
