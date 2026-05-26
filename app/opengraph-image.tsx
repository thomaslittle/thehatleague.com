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
            gap: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 720,
            }}
          >
            <div style={{ display: "flex", ...TYPE.display, fontSize: 116 }}>
              The Hat
            </div>
            <div
              style={{
                display: "flex",
                ...TYPE.marker,
                fontSize: 168,
                marginTop: -6,
              }}
            >
              League.
            </div>
            <div style={{ display: "flex", ...TYPE.body, marginTop: 28 }}>
              More than mid, less than pro. A draft-style RL series — sign
              up, get drafted live on Twitch, bring your hat.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={360}
            height={360}
            style={{
              display: "block",
              filter: "drop-shadow(0 30px 60px rgba(247,97,3,0.55))",
            }}
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
          <span>thehatleague.com</span>
          <span style={{ color: "#f76103" }}>Draft · Date TBA</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}
