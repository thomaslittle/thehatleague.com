import Image from "next/image";
import Link from "next/link";
import { getClips, type Clip } from "@/lib/discord/clips";
import {
  ArrowRight,
  DiscordIcon,
  PlayIcon,
} from "@/components/icons/brand";
import { SITE } from "@/lib/site";
import { ClipDialog } from "@/components/clips/clip-dialog";
import { ClipLikeButton } from "@/components/clips/clip-like-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function Clips() {
  const [clips, supabase] = await Promise.all([
    getClips(),
    createSupabaseServerClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isEmpty = clips.length === 0;
  const sliced = clips.slice(0, 6);
  const [featured, ...rest] = sliced;

  return (
    <section
      id="clips"
      className="border-b border-neutral-200 bg-white dark:border-neutral-900 dark:bg-black"
    >
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                Clips &amp; highlights
              </div>
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
            href="/clips"
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
            {featured && (
              <ClipCard
                clip={featured}
                featured
                isAuthenticated={!!user}
              />
            )}
            {rest.map((c) => (
              <ClipCard key={c.id} clip={c} isAuthenticated={!!user} />
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center">
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-thl-orange"
          >
            <DiscordIcon className="h-4 w-4" />
            Submit a clip in #clips-and-highlights
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function EmptyClipsBoard() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      <ClipPlaceholder featured />
      <ClipPlaceholder />
      <ClipPlaceholder />
    </div>
  );
}

function ClipPlaceholder({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 ${
        featured ? "lg:row-span-2" : ""
      }`}
    >
      <div
        className={`relative flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 ${
          featured ? "aspect-[16/13] lg:aspect-auto lg:h-full" : "aspect-video"
        }`}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 14px)",
            color: "rgb(247 97 3 / 0.8)",
          }}
        />
        <div className="relative z-10 px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-thl-orange/15 text-thl-orange md:h-16 md:w-16">
            <PlayIcon className="ml-1 h-7 w-7 md:h-8 md:w-8" />
          </div>
          <div className="mt-4 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            Clip drops here
          </div>
          <div
            className={`mt-1.5 font-bold tracking-tight text-neutral-700 dark:text-neutral-200 ${
              featured ? "text-xl md:text-2xl" : "text-base"
            }`}
          >
            Once Season 04 starts.
          </div>
          {featured && (
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Post your best play in{" "}
              <span className="inline-flex items-center gap-1.5 align-middle font-semibold text-neutral-700 dark:text-neutral-300">
                <DiscordIcon className="h-3.5 w-3.5" /> #clips-and-highlights
              </span>{" "}
              and it lands here automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClipCard({
  clip,
  featured = false,
  isAuthenticated,
}: {
  clip: Clip;
  featured?: boolean;
  isAuthenticated: boolean;
}) {
  const initials = clip.submitterName.slice(0, 2).toUpperCase();
  const profileHref = clip.submitterProfile
    ? `/players/${encodeURIComponent(clip.submitterProfile.username)}`
    : null;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange ${
        featured ? "lg:row-span-2" : ""
      }`}
    >
      <ClipDialog clip={clip}>
        <button
          type="button"
          aria-label={`Play: ${clip.title}`}
          className={`relative block w-full cursor-pointer overflow-hidden bg-neutral-900 ${
            featured ? "aspect-[16/13] lg:aspect-auto lg:h-full" : "aspect-video"
          }`}
        >
          {clip.thumbUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={clip.thumbUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <Image
              src="/brand/thl-fennec.png"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-90"
              style={{ objectPosition: "center" }}
            />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-neutral-900/45 mix-blend-multiply"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10"
          />
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-overlay opacity-[0.10]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 3px)",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-thl-orange text-black shadow-2xl transition group-hover:scale-110 md:h-16 md:w-16">
              <PlayIcon className="ml-1 h-7 w-7 md:h-8 md:w-8" />
            </div>
          </div>

          <span className="absolute top-3 left-3 rounded-md bg-thl-orange px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-black uppercase">
            {clip.week}
          </span>
          <span className="absolute top-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase backdrop-blur-sm">
            {sourceLabel(clip.source)}
          </span>

          <div className="absolute right-4 bottom-4 left-4">
            <h3
              className={`font-bold leading-tight text-white ${
                featured ? "text-2xl md:text-3xl" : "text-base md:text-lg"
              }`}
            >
              {clip.title}
            </h3>
          </div>
        </button>
      </ClipDialog>

      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {clip.submitterAvatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={clip.submitterAvatarUrl}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full border border-neutral-200 dark:border-neutral-800"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-thl-orange/15 text-[10px] font-extrabold text-thl-orange">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="truncate hover:text-thl-orange"
                >
                  {clip.submitterName}
                </Link>
              ) : (
                <span className="truncate">{clip.submitterName}</span>
              )}
              {clip.submitterProfile?.isCaptain && (
                <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                  Captain
                </span>
              )}
            </div>
          </div>
        </div>
        <ClipLikeButton
          messageId={clip.id}
          initialCount={clip.thumbsUp || clip.likes}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </article>
  );
}

function sourceLabel(s: Clip["source"]): string {
  switch (s) {
    case "discord-mp4":
      return "Clip";
    case "discord-image":
      return "Image";
    case "gifyourgame":
      return "GIFYourGame";
    case "medal":
      return "Medal";
    case "twitch-clip":
      return "Twitch";
    case "youtube":
      return "YouTube";
    case "imgur":
      return "Imgur";
    case "x":
      return "X";
    default:
      return "Clip";
  }
}
