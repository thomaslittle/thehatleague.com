import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, TYPE, loadOgFonts, ogBackgroundStyle } from "@/lib/og";
import { getActiveSeason } from "@/lib/data/season";
import { loadTeamBySlug } from "@/lib/data/tournament";

export const alt = "The Hat League — team";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const season = await getActiveSeason();
  const data = season ? await loadTeamBySlug(season.id, slug) : null;
  const name = data?.team.name ?? "Team";
  const record = data ? `${data.record.w}–${data.record.l}` : "";

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
          {data?.team.conference ?? "The Hat League"}
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", ...TYPE.marker, fontSize: 130, color: "#f76103" }}>{name}</div>
          {record && (
            <div style={{ display: "flex", ...TYPE.display, fontSize: 64, marginTop: 8 }}>{record}</div>
          )}
        </div>
        <div
          style={{
            ...TYPE.footer,
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <span>thehatleague.com</span>
          <span style={{ color: "#f76103" }}>{season?.name ?? "The Hat League"}</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}
