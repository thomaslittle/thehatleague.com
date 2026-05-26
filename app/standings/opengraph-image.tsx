import { ImageResponse } from "next/og";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  TYPE,
  loadLogoDataUri,
  loadOgFonts,
  ogBackgroundStyle,
} from "@/lib/og";
import {
  FEDORA_S3,
  SOMBRERO_S3,
} from "@/lib/data/season3-standings";

export const alt =
  "The Hat League · Season 3 Final Standings — two conferences, one hat.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const logoSrc = loadLogoDataUri();
  const sombreroChamp = SOMBRERO_S3[0];
  const fedoraChamp = FEDORA_S3[0];

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
          Season 03 · Final standings
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
            <div style={{ display: "flex", ...TYPE.display, fontSize: 92 }}>
              Two conferences.
            </div>
            <div style={{ display: "flex", ...TYPE.marker, fontSize: 132, marginTop: -4 }}>
              One hat.
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 38,
                gap: 18,
              }}
            >
              <ChampCard
                label="Sombrero · Champ"
                name={sombreroChamp.name}
                record={`${sombreroChamp.w}–${sombreroChamp.l}`}
              />
              <ChampCard
                label="Fedora · Top seed"
                name={fedoraChamp.name}
                record={`${fedoraChamp.w}–${fedoraChamp.l}`}
              />
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={260}
            height={260}
            style={{ display: "block", filter: "drop-shadow(0 30px 60px rgba(247,97,3,0.5))" }}
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
          <span>thehatleague.com/standings</span>
          <span style={{ color: "#f76103" }}>22 teams · 6 brackets</span>
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}

function ChampCard({
  label,
  name,
  record,
}: {
  label: string;
  name: string;
  record: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px",
        borderRadius: 16,
        border: "1px solid rgba(247,97,3,0.40)",
        background: "rgba(247,97,3,0.10)",
        minWidth: 280,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 14,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#f76103",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginTop: 6,
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
          {name}
        </span>
        <span style={{ fontSize: 22, color: "#9a9a9a", fontWeight: 700 }}>
          {record}
        </span>
      </div>
    </div>
  );
}
