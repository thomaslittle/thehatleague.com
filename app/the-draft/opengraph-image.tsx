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
  "The Hat League · Season 04 Draft — live on Twitch. Date TBA.";
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
        <div style={{ ...TYPE.eyebrow, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#f76103", display: "block" }} />
          The Draft · Season 04
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
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            <div style={{ display: "flex", ...TYPE.display, fontSize: 104 }}>
              Captains pick
            </div>
            <div style={{ display: "flex", ...TYPE.marker, fontSize: 140, marginTop: -6 }}>
              live.
            </div>
            <div style={{ display: "flex", ...TYPE.body, marginTop: 26, maxWidth: 680 }}>
              Live-streamed draft. Captains pick their squads in front of
              chat — one round, every player, no second chances.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={300}
            height={300}
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
          <span>thehatleague.com/the-draft</span>
          <span style={{ color: "#f76103" }}>Date · TBA</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}
