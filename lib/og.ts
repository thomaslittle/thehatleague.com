// Shared bits for next/og ImageResponse cards. Every route's OG card uses
// these helpers so the brand stays consistent.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

export function loadLogoDataUri(): string {
  const buffer = readFileSync(
    join(process.cwd(), "public", "brand", "thl-logo.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export const BG = {
  page: "radial-gradient(ellipse at 20% 0%, rgba(247,97,3,0.40), rgba(10,10,10,1) 60%), #0a0a0a",
} as const;

export const TYPE = {
  eyebrow: {
    fontSize: 22,
    letterSpacing: 6,
    textTransform: "uppercase" as const,
    color: "#f76103",
    fontWeight: 700,
  },
  display: {
    fontSize: 132,
    fontWeight: 800,
    letterSpacing: -6,
    lineHeight: 0.92,
    color: "#fff",
  },
  body: {
    fontSize: 34,
    lineHeight: 1.2,
    color: "#cfcfcf",
  },
  footer: {
    fontSize: 22,
    color: "#9a9a9a",
    letterSpacing: 4,
    textTransform: "uppercase" as const,
    fontWeight: 700,
  },
} as const;
