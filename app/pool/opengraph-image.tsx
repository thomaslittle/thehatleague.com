import { ImageResponse } from "next/og";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  TYPE,
  loadLogoDataUri,
  loadOgFonts,
  ogBackgroundStyle,
} from "@/lib/og";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const alt =
  "The Hat League · Season 04 player pool — sign up, get drafted live.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const logoSrc = loadLogoDataUri();

  let totalInPool = 0;
  let captainCount = 0;
  try {
    const supabase = await createSupabaseServerClient();
    const { count: pool } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("in_player_pool", true);
    const { count: caps } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_captain", true);
    totalInPool = pool ?? 0;
    captainCount = caps ?? 0;
  } catch {
    // OG cards must always render; fall back to zeros if Supabase is down.
  }

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
          Player pool · Season 04
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
            <div style={{ display: "flex", ...TYPE.display, fontSize: 92 }}>
              Everyone in the
            </div>
            <div style={{ display: "flex", ...TYPE.marker, fontSize: 132, marginTop: -4 }}>
              lobby.
            </div>
            <div style={{ display: "flex", ...TYPE.body, marginTop: 22, maxWidth: 680 }}>
              The list captains pick from on draft night. Sort by 2v2, 3v3,
              or peak rank.
            </div>

            <div style={{ display: "flex", gap: 56, marginTop: 32 }}>
              <Stat label="In the pool" value={totalInPool} />
              <Stat label="Captains" value={captainCount} />
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
          <span>thehatleague.com/pool</span>
          <span style={{ color: "#f76103" }}>Live · updates instantly</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          fontFamily: "Inter Tight",
          fontSize: 18,
          color: "#9a9a9a",
          letterSpacing: 4,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Inter Tight",
          marginTop: 6,
          fontSize: 84,
          fontWeight: 800,
          color: "#f76103",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
