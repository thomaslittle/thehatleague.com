import { ImageResponse } from "next/og";
import { BG, OG_CONTENT_TYPE, OG_SIZE, TYPE, loadLogoDataUri } from "@/lib/og";
import { getAnnouncementBySlug } from "@/lib/data/announcements";

export const alt = "The Hat League · Announcement";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const a = await getAnnouncementBySlug(slug);
  const logoSrc = loadLogoDataUri();

  const title = a?.title ?? "Announcement";
  const pinned = !!a?.pinned;
  const published = a?.published_at ? new Date(a.published_at) : null;
  const dateLabel =
    published?.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) ?? "";

  // Scale the title font down for long headlines so it never overflows.
  const titleFontSize = title.length > 60 ? 64 : title.length > 36 ? 84 : 104;

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
          {pinned ? "Pinned · From league ops" : "From league ops"}
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
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#9a9a9a",
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              {dateLabel}
            </div>
            <div
              style={{
                ...TYPE.display,
                fontSize: titleFontSize,
              }}
            >
              {title}
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={260}
            height={260}
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
          <span>thehatleague.com</span>
          <span style={{ color: "#f76103" }}>Announcement</span>
        </div>
      </div>
    ),
    size,
  );
}
