// Shared bits for next/og ImageResponse cards. Every route's OG card uses
// these helpers so the brand stays consistent.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { rankIconSrc } from "@/lib/data/rank-icons";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

const PUBLIC_DIR = join(process.cwd(), "public");

function readPublic(...parts: string[]): Buffer {
  return readFileSync(join(PUBLIC_DIR, ...parts));
}

function dataUri(buffer: Buffer, mime: string): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export function loadLogoDataUri(): string {
  return dataUri(readPublic("brand", "thl-logo.png"), "image/png");
}

export function loadFennecDataUri(): string {
  return dataUri(readPublic("brand", "thl-fennec.png"), "image/png");
}

/**
 * Resolve a stored rank string (e.g. "Diamond II · Div 3") to a base64
 * data URI of the in-game tier icon. Reads the same `/public/brand/ranks/*.png`
 * file the site uses via `rankIconSrc`, then inlines it so Satori can
 * draw it without making an HTTP fetch at render time. Returns null when
 * the rank string doesn't match a known tier (legacy free-text values).
 */
export function loadRankIconDataUri(
  value: string | null | undefined,
): string | null {
  const publicPath = rankIconSrc(value);
  if (!publicPath) return null;
  // rankIconSrc returns e.g. "/brand/ranks/13.png" — strip the leading
  // slash and split so readPublic can join it under public/.
  const parts = publicPath.replace(/^\//, "").split("/");
  return dataUri(readPublic(...parts), "image/png");
}

/**
 * Bundled brand fonts so OG cards render with the same typography as the
 * site instead of falling back to Discord's generic sans-serif. Pass the
 * returned array into `new ImageResponse(jsx, { fonts: [...] })`.
 *
 * Inter Tight is a variable font — we register the file three times at
 * the weights we actually use (600/700/800) so `fontWeight` in the JSX
 * works the way it would in a stylesheet.
 */
export interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 600 | 700 | 800;
  style: "normal";
}

export function loadOgFonts(): OgFont[] {
  const semibold = readPublic("fonts", "InterTight-SemiBold.ttf");
  const bold = readPublic("fonts", "InterTight-Bold.ttf");
  const extrabold = readPublic("fonts", "InterTight-ExtraBold.ttf");
  const permanentMarker = readPublic("fonts", "PermanentMarker-Regular.ttf");
  return [
    { name: "Inter Tight", data: semibold, weight: 600, style: "normal" },
    { name: "Inter Tight", data: bold, weight: 700, style: "normal" },
    { name: "Inter Tight", data: extrabold, weight: 800, style: "normal" },
    { name: "Permanent Marker", data: permanentMarker, weight: 400, style: "normal" },
  ];
}

/**
 * Shared full-card background: brand-orange radial glow over a deep
 * neutral, plus the fennec hero photo at very low opacity for texture.
 * Returns a style object — splat into a top-level <div>.
 */
export function ogBackgroundStyle(): React.CSSProperties {
  const fennec = loadFennecDataUri();
  return {
    background: [
      // Brand-orange spotlight from top-left, like the site hero.
      "radial-gradient(ellipse at 18% 8%, rgba(247,97,3,0.45), transparent 55%)",
      // Subtler counter-glow bottom-right for depth.
      "radial-gradient(ellipse at 90% 100%, rgba(247,97,3,0.18), transparent 55%)",
      // Fennec photo for texture — heavily darkened via the gradient
      // overlay below so the headline always wins contrast.
      `linear-gradient(180deg, rgba(8,8,8,0.85), rgba(8,8,8,0.92)), url('${fennec}')`,
    ].join(", "),
    backgroundSize: "100% 100%, 100% 100%, cover",
    backgroundPosition: "center, center, 55% 35%",
    backgroundColor: "#080808",
  };
}

export const BG = {
  // Legacy alias — newer cards use ogBackgroundStyle() directly.
  page: "radial-gradient(ellipse at 20% 0%, rgba(247,97,3,0.40), rgba(10,10,10,1) 60%), #0a0a0a",
} as const;

export const TYPE = {
  eyebrow: {
    fontFamily: "Inter Tight",
    fontSize: 22,
    letterSpacing: 6,
    textTransform: "uppercase" as const,
    color: "#f76103",
    fontWeight: 700,
  },
  // Big primary headline — uses the marker accent font for the brand vibe.
  // Mix with a separate `display` span set to Inter Tight for the
  // non-accent words.
  marker: {
    fontFamily: "Permanent Marker",
    fontSize: 140,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 0.92,
    color: "#f76103",
  },
  display: {
    fontFamily: "Inter Tight",
    fontSize: 132,
    fontWeight: 800,
    letterSpacing: -6,
    lineHeight: 0.92,
    color: "#fff",
  },
  body: {
    fontFamily: "Inter Tight",
    fontSize: 32,
    fontWeight: 600,
    lineHeight: 1.25,
    color: "#dcdcdc",
  },
  footer: {
    fontFamily: "Inter Tight",
    fontSize: 22,
    color: "#9a9a9a",
    letterSpacing: 4,
    textTransform: "uppercase" as const,
    fontWeight: 700,
  },
} as const;
