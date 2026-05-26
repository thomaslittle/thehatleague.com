import { ImageResponse } from "next/og";
import { BG, OG_CONTENT_TYPE, OG_SIZE, TYPE, loadLogoDataUri } from "@/lib/og";

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
          background: BG.page,
          color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: 64,
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
            <div style={{ ...TYPE.display, fontSize: 112 }}>
              Captains pick live.
            </div>
            <div style={{ ...TYPE.display, fontSize: 112, color: "#f76103" }}>
              One night.
            </div>
            <div style={{ ...TYPE.body, marginTop: 28, maxWidth: 680 }}>
              Live-streamed draft. Captains pick their squads in front of
              chat — one round, every player, no second chances.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={300} height={300} style={{ display: "block" }} />
        </div>

        <div
          style={{
            ...TYPE.footer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span>thehatleague.com/the-draft</span>
          <span style={{ color: "#f76103" }}>Date · TBA</span>
        </div>
      </div>
    ),
    size,
  );
}
