"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { MediaDialog } from "@/components/clips/media-dialog";
import { ClipChip } from "@/components/clips/clip-chip";
import { resolveClip, type ResolvedClip } from "@/lib/clips/embed";

/**
 * A player's combine showcase reel: the first clip rendered as a 16:9
 * featured tile, the rest as compact play chips. Embeddable clips play
 * on-site in a dialog. Shared by the combine board and the player profile
 * so the same reel shows everywhere.
 */
export function CombineClips({
  clips,
  name,
  className,
}: {
  clips: string[];
  name: string;
  className?: string;
}) {
  if (clips.length === 0) return null;
  const [first, ...rest] = clips;
  const featured = resolveClip(first);
  return (
    <div className={className}>
      <ClipFeature clip={featured} title={`${name} — ${featured.label} clip`} />
      {rest.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {rest.map((url, i) => (
            <ClipChip key={`${url}-${i}`} url={url} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClipFeature({ clip, title }: { clip: ResolvedClip; title: string }) {
  const tile = (
    <button
      type="button"
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 dark:border-neutral-800"
    >
      {clip.thumbUrl ? (
        <Image
          src={clip.thumbUrl}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 360px, 100vw"
          className="object-cover opacity-90 transition group-hover:opacity-100"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-thl-orange/25 via-neutral-900 to-neutral-900" />
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white ring-2 ring-white/30 backdrop-blur-sm transition group-hover:bg-thl-orange group-hover:text-black">
          <Play className="h-5 w-5 translate-x-px fill-current" aria-hidden />
        </span>
      </span>
      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
        {clip.label}
      </span>
    </button>
  );

  // Embeddable / playable → on-site dialog. Otherwise link out.
  if (clip.playable || clip.thumbUrl) {
    return (
      <MediaDialog clip={clip} title={title}>
        {tile}
      </MediaDialog>
    );
  }
  return (
    <a href={clip.url} target="_blank" rel="noopener" aria-label={`${title} (opens in a new tab)`}>
      {tile}
    </a>
  );
}
