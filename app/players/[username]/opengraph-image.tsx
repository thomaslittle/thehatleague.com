import { ImageResponse } from "next/og";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  TYPE,
  loadLogoDataUri,
  loadOgFonts,
  loadRankIconDataUri,
  ogBackgroundStyle,
} from "@/lib/og";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanDiscordUsername } from "@/lib/discord/name";

export const alt = "The Hat League · Player profile";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;
  const handle = decodeURIComponent(username);
  const logoSrc = loadLogoDataUri();

  const supabase = await createSupabaseServerClient();
  const { data: player } = await supabase
    .from("profiles")
    .select(
      "discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, profile_banner_url, rank_2v2, rank_3v3, peak_rank, peak_rank_playlist, is_captain, is_captain_applicant",
    )
    .ilike("discord_username", handle)
    .maybeSingle();

  const displayName =
    player?.discord_global_name ??
    cleanDiscordUsername(player?.discord_username) ??
    handle;
  const at = cleanDiscordUsername(player?.discord_username) ?? handle;
  // Prefer the user's custom-uploaded avatar/banner when present; fall
  // back to Discord's CDN avatar and the default fennec backdrop.
  const avatar =
    player?.profile_avatar_url ?? player?.discord_avatar_url ?? null;
  const banner = player?.profile_banner_url ?? null;
  const captainTag = player?.is_captain
    ? "Captain · Season 04"
    : player?.is_captain_applicant
      ? "Captain application · pending"
      : "Player · Season 04";

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
          padding: 64,
          ...ogBackgroundStyle(banner ? { backdrop: banner } : undefined),
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
          {captainTag}
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 48,
            paddingTop: 32,
            paddingBottom: 40,
          }}
        >
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatar}
              alt=""
              width={240}
              height={240}
              style={{
                width: 240,
                height: 240,
                borderRadius: 999,
                border: "4px solid rgba(247,97,3,0.5)",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 240,
                height: 240,
                borderRadius: 999,
                background: "#f76103",
                color: "#000",
                fontSize: 96,
                fontWeight: 900,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "Permanent Marker",
                fontSize: 96,
                fontWeight: 400,
                lineHeight: 0.92,
                color: "#fff",
                textShadow: "-2px 2px 0 #f76103",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: "#9a9a9a",
                marginTop: 6,
              }}
            >
              @{at}
            </div>

            <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
              <RankChip
                label="2v2"
                value={player?.rank_2v2 ?? "—"}
                icon={loadRankIconDataUri(player?.rank_2v2)}
              />
              <RankChip
                label="3v3"
                value={player?.rank_3v3 ?? "—"}
                icon={loadRankIconDataUri(player?.rank_3v3)}
              />
              <RankChip
                label={`Peak${player?.peak_rank_playlist ? " · " + player.peak_rank_playlist : ""}`}
                value={player?.peak_rank ?? "—"}
                icon={loadRankIconDataUri(player?.peak_rank)}
                highlight
              />
            </div>
          </div>
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
          <span>thehatleague.com/players/{at}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={48}
            height={48}
            style={{ display: "block" }}
          />
        </div>
      </div>
    ),
    { ...size, fonts: loadOgFonts() },
  );
}

function RankChip({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "14px 18px",
        borderRadius: 14,
        border: highlight
          ? "1px solid rgba(247,97,3,0.45)"
          : "1px solid rgba(255,255,255,0.12)",
        background: highlight
          ? "rgba(247,97,3,0.12)"
          : "rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: highlight ? "#f76103" : "#9a9a9a",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 6,
        }}
      >
        {icon && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={icon}
            alt=""
            // Source PNGs are 150×100 — keep that 3:2 ratio so the
            // diamond/star/crown shapes aren't horizontally squashed.
            width={60}
            height={40}
            style={{ width: 60, height: 40, display: "block" }}
          />
        )}
        <span
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 800,
            color: highlight ? "#f76103" : "#fff",
            letterSpacing: -0.5,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
