import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, TYPE, loadOgFonts, ogBackgroundStyle } from "@/lib/og";

export const alt = "The Hat League — Power Rankings";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
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
          Power Rankings
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", ...TYPE.display, fontSize: 110 }}>Who&apos;s hot.</div>
          <div style={{ display: "flex", ...TYPE.marker, fontSize: 150, marginTop: -6, color: "#f76103" }}>
            Who&apos;s not.
          </div>
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
          <span>thehatleague.com/power-rankings</span>
          <span style={{ color: "#f76103" }}>The Hat League</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}
