import { Link } from "@tanstack/react-router";
import { DiscordIcon, TwitchIcon, ArrowRight, HeartIcon } from "@/components/icons";
import { ClipDialog } from "@/components/clip-dialog";
import type { Clip } from "@/server/clips";

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

export function Clips({ clips }: { clips: Clip[] }) {
  const sliced = clips.slice(0, 6);
  const [featured, ...rest] = sliced;
  const isEmpty = clips.length === 0;

  return (
    <section
      id="clips"
      className="border-b border-neutral-200 bg-white dark:border-neutral-900 dark:bg-black"
    >
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Clips &amp; highlights
            </div>
            <h2 className="text-4xl leading-[0.98] font-bold tracking-[-0.03em] text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
              The plays.{" "}
              <span className="font-marker font-normal text-thl-orange">
                Caught on tape.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-neutral-600 dark:text-neutral-400">
              Pulled live from{" "}
              <span className="inline-flex items-center gap-1.5 align-middle font-semibold text-neutral-900 dark:text-white">
                <DiscordIcon className="h-4 w-4" /> #clips-and-highlights
              </span>{" "}
              on the Discord. Drop a clip in the channel, it shows up here.
            </p>
          </div>
          <Link
            to="/clips"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-thl-orange hover:text-black dark:bg-white dark:text-neutral-900 dark:hover:bg-thl-orange dark:hover:text-black"
          >
            See all clips
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isEmpty ? (
          <EmptyClipsBoard />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured && <ClipCard clip={featured} featured />}
            {rest.map((c) => (
              <ClipCard key={c.id} clip={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ClipCard({ clip, featured }: { clip: Clip; featured?: boolean }) {
  const badge = SOURCE_BADGES[clip.source];
  const posted = new Date(clip.postedAt);
  return (
    <ClipDialog clip={clip}>
      {(open) => (
        <button
          type="button"
          onClick={open}
          className={
            "group block w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 " +
            (featured ? "md:col-span-2 md:row-span-2" : "")
          }
        >
      <div
        className={
          "relative w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900 " +
          (featured ? "aspect-[16/10]" : "aspect-video")
        }
      >
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
        <div
          className={
            "line-clamp-2 font-semibold text-neutral-900 dark:text-white " +
            (featured ? "text-lg" : "text-sm")
          }
        >
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

function EmptyClipsBoard() {
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
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="https://www.twitch.tv/thehatleague"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-[#9146ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7c2bff]"
          >
            <TwitchIcon className="h-4 w-4" />
            Watch live instead
          </a>
        </div>
      </div>
    </div>
  );
}
