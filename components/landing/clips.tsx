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
  if (!clips.length) return null;

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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-thl-orange/10 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.18em] text-thl-orange uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-thl-orange" />
                Live
              </span>
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ClipCard clip={featured} featured />
          {rest.map((c) => (
            <ClipCard key={c.id} clip={c} />
          ))}
        </div>

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

function ClipCard({ clip, featured = false }: { clip: Clip; featured?: boolean }) {
  return (
    <article
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange ${
        featured ? "lg:row-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-neutral-900 ${
          featured ? "aspect-[16/13] lg:aspect-auto lg:h-full" : "aspect-video"
        }`}
      >
        <Image
          src="/brand/thl-fennec.png"
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
          style={{
            objectPosition: clip.pos,
            transform: `scale(${clip.scale})`,
            transformOrigin: "center",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-neutral-900/55 mix-blend-multiply" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/15"
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-overlay opacity-[0.15]"
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

        <span className="absolute top-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur-sm">
          {clip.duration}
        </span>
        <span className="absolute top-3 left-3 rounded-md bg-thl-orange px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-black uppercase">
          {clip.week}
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
            <div className="truncate text-[11px] text-neutral-500">
              {clip.team}
            </div>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <HeartIcon className="h-3.5 w-3.5" />
          {clip.likes}
        </span>
      </div>
    </article>
  );
}
