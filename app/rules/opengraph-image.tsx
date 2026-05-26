import { ImageResponse } from "next/og";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  TYPE,
  loadLogoDataUri,
  loadOgFonts,
  ogBackgroundStyle,
} from "@/lib/og";

export const alt =
  "The Hat League · Rules — S03 archive, S04 update in progress.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const logoSrc = loadLogoDataUri();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
          fontFamily: "Inter Tight",
          padding: 72,
          ...ogBackgroundStyle(),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            ...TYPE.eyebrow,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#f76103",
              display: "block",
            }}
          />
          Rules · S04 update in progress
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
            <div style={{ display: "flex", ...TYPE.display, fontSize: 88 }}>Old rules,</div>
            <div style={{ display: "flex", ...TYPE.display, fontSize: 88 }}>new wrinkles</div>
            <div style={{ display: "flex", ...TYPE.marker, fontSize: 120, marginTop: -2 }}>
              coming for S04.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={240}
            height={240}
            style={{ display: "block", filter: "drop-shadow(0 30px 60px rgba(247,97,3,0.5))" }}
          />
        </div>

        <div
          style={{
            ...TYPE.footer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <span>thehatleague.com/rules</span>
          <span style={{ color: "#f76103" }}>Archived · Season 03</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}
