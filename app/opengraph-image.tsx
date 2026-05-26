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
  "The Hat League — A Rocket League tournament series. More than mid, less than pro.";
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
          padding: 72,
          color: "#fff",
          fontFamily: "Inter Tight",
          ...ogBackgroundStyle(),
        }}
      >
        <div
          style={{ ...TYPE.eyebrow, display: "flex", alignItems: "center", gap: 18 }}
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
          Season 04 · Rocket League
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            paddingTop: 36,
            paddingBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 680,
            }}
          >
            <div style={{ display: "flex", ...TYPE.display, fontSize: 96 }}>
              The Hat
            </div>
            <div
              style={{
                display: "flex",
                ...TYPE.marker,
                fontSize: 138,
                marginTop: -4,
              }}
            >
              League.
            </div>
            <div
              style={{
                display: "flex",
                ...TYPE.body,
                marginTop: 32,
                fontSize: 28,
                maxWidth: 640,
              }}
            >
              More than mid, less than pro. A draft-style RL series. Sign
              up, get drafted live on Twitch.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={300}
            height={300}
            style={{ display: "block" }}
          />
        </div>

        <div
          style={{
            ...TYPE.footer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 26,
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <span>thehatleague.com</span>
          <span style={{ color: "#f76103" }}>Draft · Date TBA</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}
