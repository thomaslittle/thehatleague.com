import { ImageResponse } from "next/og";
import { BG, OG_CONTENT_TYPE, OG_SIZE, TYPE, loadLogoDataUri } from "@/lib/og";
import { HISTORICAL_PLAYERS } from "@/lib/data/historical-player-stats";

export const alt =
  "The Hat League · Season 3 Leaderboards — every hat, every stat.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const logoSrc = loadLogoDataUri();
  const goalsLeader = [...HISTORICAL_PLAYERS].sort(
    (a, b) => b.goals - a.goals,
  )[0];

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
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#f76103",
              display: "block",
            }}
          />
          Season 03 · Leaderboards
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
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ ...TYPE.display, fontSize: 108 }}>Every hat,</div>
            <div style={{ ...TYPE.display, fontSize: 108, color: "#f76103" }}>
              every stat.
            </div>

            <div
              style={{
                marginTop: 40,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "18px 22px",
                borderRadius: 18,
                border: "1px solid rgba(247,97,3,0.40)",
                background: "rgba(247,97,3,0.10)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#f76103",
                }}
              >
                Goals leader
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: -1,
                }}
              >
                {goalsLeader.name}
              </div>
              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#f76103",
                  lineHeight: 1,
                }}
              >
                {String(goalsLeader.goals)}
              </div>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={280}
            height={280}
            style={{ display: "block" }}
          />
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
          <span>thehatleague.com/leaderboards</span>
          <span style={{ color: "#f76103" }}>60 players · 5 categories</span>
        </div>
      </div>
    ),
    size,
  );
}
