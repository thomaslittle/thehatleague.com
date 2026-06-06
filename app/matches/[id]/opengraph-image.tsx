import { ImageResponse } from "next/og";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  TYPE,
  loadOgFonts,
  ogBackgroundStyle,
} from "@/lib/og";
import { loadMatch } from "@/lib/data/tournament";

export const alt = "The Hat League — match";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await loadMatch(id);
  const match = data?.match;
  const home = match?.home?.name ?? "TBD";
  const away = match?.away?.name ?? "TBD";
  const isFinal = match?.status === "final";
  const homeWon = match?.winnerTeamId === match?.home?.id;

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
          {match?.conference ?? "League"}
          {match?.week ? ` · Week ${match.week}` : ""} · {isFinal ? "Final" : "Matchup"}
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", ...TYPE.marker, fontSize: 84, color: isFinal && homeWon ? "#f76103" : "#fff", maxWidth: 420, textAlign: "right" }}>
            {home}
          </div>
          <div style={{ display: "flex", ...TYPE.display, fontSize: 120 }}>
            {isFinal ? `${match?.homeScore}–${match?.awayScore}` : "vs"}
          </div>
          <div style={{ display: "flex", ...TYPE.marker, fontSize: 84, color: isFinal && !homeWon ? "#f76103" : "#fff", maxWidth: 420 }}>
            {away}
          </div>
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
          <span style={{ color: "#f76103" }}>The Hat League</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}
