import Image from "next/image";
import { getClips, type Clip } from "@/lib/discord/clips";
import {
  ArrowRight,
  DiscordIcon,
  HeartIcon,
  PlayIcon,
} from "@/components/icons/brand";
import { SITE } from "@/lib/site";

export async function Clips() {
  const clips = await getClips();
  const isEmpty = clips.length === 0;
  const [featured, ...rest] = clips;

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
                <DiscordIcon className="h-4 w-4" /> #highlights
              </span>{" "}
              on the Discord. Drop a clip in the channel, it shows up here.
            </p>
          </div>
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-thl-orange hover:text-black dark:bg-white dark:text-neutral-900 dark:hover:bg-thl-orange dark:hover:text-black"
          >
            <DiscordIcon className="h-4 w-4" />
            Submit a clip
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {isEmpty ? (
          <EmptyClipsBoard />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ClipCard clip={featured} featured />
            {rest.map((c) => (
              <ClipCard key={c.id} clip={c} />
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
            View the whole channel
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
                <DiscordIcon className="h-3.5 w-3.5" /> #highlights
              </span>{" "}
              and it lands here automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ClipCard({ clip, featured = false }: { clip: Clip; featured?: boolean }) {
  const hasThumb = !!clip.thumbUrl;
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    clip.url ? (
      <a
        href={clip.url}
        target="_blank"
        rel="noopener"
        className={`group relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange ${
          featured ? "lg:row-span-2" : ""
        }`}
      >
        {children}
      </a>
    ) : (
      <article
        className={`group relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 ${
          featured ? "lg:row-span-2" : ""
        }`}
      >
        {children}
      </article>
    );

  return (
    <Wrapper>
      <div
        className={`relative overflow-hidden bg-neutral-900 ${
          featured ? "aspect-[16/13] lg:aspect-auto lg:h-full" : "aspect-video"
        }`}
      >
        {hasThumb ? (
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
            className="object-cover"
            style={{
              objectPosition: clip.pos ?? "center",
              transform: `scale(${clip.scale ?? 1})`,
              transformOrigin: "center",
            }}
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-neutral-900/45 mix-blend-multiply" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10"
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-overlay opacity-[0.12]"
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

        {clip.duration && (
          <span className="absolute top-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur-sm">
            {clip.duration}
          </span>
        )}
        {clip.week && (
          <span className="absolute top-3 left-3 rounded-md bg-thl-orange px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-black uppercase">
            {clip.week}
          </span>
        )}

        <div className="absolute right-4 bottom-4 left-4">
          <h3
            className={`font-bold leading-tight text-white ${
              featured ? "text-2xl md:text-3xl" : "text-base md:text-lg"
            }`}
          >
            {clip.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-thl-orange/15 text-[10px] font-extrabold text-thl-orange">
            {clip.submitter.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {clip.submitter}
            </div>
            {clip.team && (
              <div className="truncate text-[11px] text-neutral-500">
                {clip.team}
              </div>
            )}
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <HeartIcon className="h-3.5 w-3.5" />
          {clip.likes}
        </span>
      </div>
    </Wrapper>
  );
}
