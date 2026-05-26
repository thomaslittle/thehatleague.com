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
  "The Hat League · Captains — the ones doing the picking.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const logoSrc = loadLogoDataUri();

  let confirmed = 0;
  let pending = 0;
  try {
    const supabase = await createSupabaseServerClient();
    const { count: c } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_captain", true);
    const { count: p } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_captain_applicant", true)
      .eq("is_captain", false);
    confirmed = c ?? 0;
    pending = p ?? 0;
  } catch {
    // Always render the card even when Supabase is unreachable.
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
          Captains · Season 04
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            paddingTop: 32,
            paddingBottom: 44,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ display: "flex", ...TYPE.display, fontSize: 96 }}>
              The ones doing
            </div>
            <div style={{ display: "flex", ...TYPE.marker, fontSize: 132, marginTop: -4 }}>
              the picking.
            </div>
            <div style={{ display: "flex", gap: 56, marginTop: 36 }}>
              <Stat label="Confirmed" value={confirmed} />
              <Stat label="Applications" value={pending} />
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
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span>thehatleague.com/captains</span>
          <span style={{ color: "#f76103" }}>Applications open</span>
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
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#9a9a9a",
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
        {String(value)}
      </div>
    </div>
  );
}
