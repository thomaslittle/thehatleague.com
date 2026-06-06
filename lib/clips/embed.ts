// Client-safe, synchronous clip URL resolver. Given a pasted link it
// classifies the host and, where possible, derives an iframe embed URL,
// a direct video URL, and/or a poster thumbnail so the clip can play
// inline on-site instead of bouncing the user to another tab.
//
// This is the lightweight cousin of lib/discord/clips.ts (which is
// server-only and does network scraping). Anything that needs a network
// round-trip to resolve (medal, gifyourgame video, og-scraping) is left
// as a non-playable external link here.

export type EmbedSource =
  | "youtube"
  | "twitch-clip"
  | "streamable"
  | "video"
  | "other";

export interface ResolvedClip {
  /** The original external URL (used for the "open externally" fallback). */
  url: string;
  source: EmbedSource;
  /** Iframe-ready embed URL (YouTube nocookie, Twitch, Streamable). */
  embedUrl?: string;
  /** Direct video file URL playable in a <video> tag. */
  videoUrl?: string;
  /** Poster thumbnail when we can derive one (YouTube). */
  thumbUrl?: string;
  /** Human label for chips/links. */
  label: string;
  /** True when it can play inline (embedUrl or videoUrl present). */
  playable: boolean;
}

const TWITCH_PARENTS = ["thehatleague.com", "www.thehatleague.com", "localhost"];

export function resolveClip(rawUrl: string): ResolvedClip {
  const url = rawUrl.trim();
  const base: ResolvedClip = {
    url,
    source: "other",
    label: "Clip",
    playable: false,
  };
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return base;
  }

  // Direct video files.
  if (/\.(mp4|webm|m4v|mov)(?:[?#]|$)/i.test(url)) {
    return { url, source: "video", videoUrl: url, label: "Video", playable: true };
  }

  // YouTube (incl. shorts + youtu.be).
  if (host.endsWith("youtube.com") || host.endsWith("youtu.be")) {
    const id = youTubeId(url);
    return {
      url,
      source: "youtube",
      embedUrl: id
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
        : undefined,
      thumbUrl: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined,
      label: "YouTube",
      playable: Boolean(id),
    };
  }

  // Twitch clips.
  if (host === "clips.twitch.tv" || (host.endsWith("twitch.tv") && url.includes("/clip/"))) {
    const slug = twitchSlug(url);
    return {
      url,
      source: "twitch-clip",
      embedUrl: slug ? buildTwitchEmbedUrl(slug) : undefined,
      label: "Twitch",
      playable: Boolean(slug),
    };
  }

  // Streamable.
  if (host.endsWith("streamable.com")) {
    const id = url.split("streamable.com/")[1]?.split(/[/?#]/)[0];
    return {
      url,
      source: "streamable",
      embedUrl: id ? `https://streamable.com/e/${id}?autoplay=1` : undefined,
      label: "Streamable",
      playable: Boolean(id),
    };
  }

  // Everything else (medal, gifyourgame, imgur, X, …) — link out.
  const label = host
    ? host.replace(/\.(com|tv|gg|net)$/i, "").replace(/^./, (c) => c.toUpperCase())
    : "Clip";
  return { ...base, label };
}

function youTubeId(url: string): string | undefined {
  const m =
    url.match(/youtu\.be\/([\w-]{11})/) ??
    url.match(/[?&]v=([\w-]{11})/) ??
    url.match(/youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/);
  return m?.[1];
}

function twitchSlug(url: string): string | undefined {
  try {
    const u = new URL(url);
    if (u.hostname === "clips.twitch.tv") {
      return u.pathname.split("/").filter(Boolean)[0];
    }
    if (u.pathname.includes("/clip/")) {
      return u.pathname.split("/clip/")[1]?.split(/[/?#]/)[0];
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function buildTwitchEmbedUrl(slug: string): string {
  const params = new URLSearchParams({ clip: slug, autoplay: "true", muted: "false" });
  for (const parent of TWITCH_PARENTS) params.append("parent", parent);
  return `https://clips.twitch.tv/embed?${params.toString()}`;
}
