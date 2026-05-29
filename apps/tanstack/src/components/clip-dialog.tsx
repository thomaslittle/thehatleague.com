import { useEffect, useState, type ReactNode } from "react";
import type { Clip } from "@/server/clips";

function deriveEmbedUrl(clip: Clip, parentHost: string): string | null {
  if (clip.source === "youtube") {
    const m =
      /youtu\.be\/([A-Za-z0-9_-]+)/.exec(clip.url) ??
      /[?&]v=([A-Za-z0-9_-]+)/.exec(clip.url);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1`;
    return null;
  }
  if (clip.source === "twitch-clip") {
    const m =
      /clips\.twitch\.tv\/([A-Za-z0-9_-]+)/.exec(clip.url) ??
      /twitch\.tv\/[^/]+\/clip\/([A-Za-z0-9_-]+)/.exec(clip.url);
    if (m)
      return `https://clips.twitch.tv/embed?clip=${m[1]}&parent=${parentHost}&autoplay=true`;
    return null;
  }
  return null;
}

export function ClipDialog({
  clip,
  children,
}: {
  clip: Clip;
  children: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // EFFECT JUSTIFICATION: ESC keydown listener + scroll lock are imperative
  // document-level concerns tied to open/close state. Same pattern used by
  // the mobile nav.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {children(() => setOpen(true))}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-[min(96vw,1080px)]">
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-[0_30px_80px_-20px_rgba(247,97,3,0.45)]">
              <ClipPlayer clip={clip} />
              <div className="flex items-start justify-between gap-3 px-5 py-4 text-white">
                <h2 className="min-w-0 truncate text-base font-bold sm:text-lg">
                  {clip.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="-mt-1 -mr-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ClipPlayer({ clip }: { clip: Clip }) {
  // Derive embed URL client-side so we can supply window.location.hostname
  // (Twitch's iframe demands a matching `parent` param).
  const parentHost =
    typeof window === "undefined" ? "localhost" : window.location.hostname;
  const embedUrl = deriveEmbedUrl(clip, parentHost);

  if (clip.videoUrl) {
    return (
      <video
        controls
        autoPlay
        playsInline
        preload="metadata"
        src={clip.videoUrl}
        className="aspect-video w-full bg-black"
      />
    );
  }

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={clip.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video w-full bg-black"
      />
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <p className="text-sm text-neutral-400">
        This clip lives on a host we can&apos;t embed inline.
      </p>
      <a
        href={clip.url}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-5 py-3 text-sm font-bold text-black transition hover:bg-thl-orange-deep"
      >
        Open clip ↗
      </a>
    </div>
  );
}
