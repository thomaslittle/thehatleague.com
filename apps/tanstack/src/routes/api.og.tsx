import { createFileRoute } from "@tanstack/react-router";
import { ImageResponse } from "@vercel/og";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const ORANGE = "#f76103";
const DARK = "#0a0a0a";

// The OG endpoint reads brand fonts and the fennec backdrop off disk at
// request time. Three candidate roots are tried in order so the same code
// runs in:
//   1. dev — cwd is `apps/tanstack/`, files at `../../public/...`
//   2. local prod — same cwd, same relative path
//   3. deployed prod — cwd may be the .output/ dir; fall back to a
//      bundled `public/` alongside the output, or an absolute env override.
const PUBLIC_ROOT_CANDIDATES = [
  process.env.THL_PUBLIC_DIR, // explicit override (deploy ergonomics)
  resolve(process.cwd(), "../../public"),
  resolve(process.cwd(), "./public"),
  resolve(process.cwd(), "../public"),
].filter((p): p is string => !!p);

async function readPublic(...segments: string[]): Promise<Buffer> {
  for (const root of PUBLIC_ROOT_CANDIDATES) {
    try {
      return await readFile(resolve(root, ...segments));
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    `og: couldn't find ${segments.join("/")} in any of: ${PUBLIC_ROOT_CANDIDATES.join(", ")}`,
  );
}

let _fonts: { name: string; data: Buffer; weight: 700 | 800 | 400 }[] | null =
  null;

async function loadFonts() {
  if (_fonts) return _fonts;
  const [bold, extra, marker] = await Promise.all([
    readPublic("fonts", "InterTight-Bold.ttf"),
    readPublic("fonts", "InterTight-ExtraBold.ttf"),
    readPublic("fonts", "PermanentMarker-Regular.ttf"),
  ]);
  _fonts = [
    { name: "Inter Tight", data: bold, weight: 700 },
    { name: "Inter Tight", data: extra, weight: 800 },
    { name: "Permanent Marker", data: marker, weight: 400 },
  ];
  return _fonts;
}

let _fennecDataUri: string | null = null;
async function loadFennecBackdrop(): Promise<string> {
  if (_fennecDataUri) return _fennecDataUri;
  const fennec = await readPublic("brand", "thl-fennec.png");
  _fennecDataUri = `data:image/png;base64,${fennec.toString("base64")}`;
  return _fennecDataUri;
}

export const Route = createFileRoute("/api/og")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const title = url.searchParams.get("title") ?? "The Hat League";
        const subtitle =
          url.searchParams.get("subtitle") ??
          "Season 04 · A draft-style Rocket League series";
        const eyebrow = url.searchParams.get("eyebrow") ?? "Season 04";

        const [fonts, fennec] = await Promise.all([
          loadFonts(),
          loadFennecBackdrop(),
        ]);

        return new ImageResponse(
          (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 72,
                color: "#fff",
                fontFamily: "Inter Tight",
                backgroundColor: DARK,
                backgroundImage: [
                  "radial-gradient(ellipse at 18% 8%, rgba(247,97,3,0.45), transparent 55%)",
                  "radial-gradient(ellipse at 90% 100%, rgba(247,97,3,0.18), transparent 55%)",
                  `linear-gradient(180deg, rgba(8,8,8,0.80), rgba(8,8,8,0.90)), url('${fennec}')`,
                ].join(", "),
                backgroundSize: "100% 100%, 100% 100%, cover",
                backgroundPosition: "center, center, 50% 35%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: ORANGE,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: ORANGE,
                  }}
                />
                {eyebrow}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 800,
                    lineHeight: 0.95,
                    letterSpacing: "-0.045em",
                    color: "#fff",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    color: "#a3a3a3",
                    maxWidth: 900,
                    lineHeight: 1.35,
                  }}
                >
                  {subtitle}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 18,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#fff",
                  paddingTop: 24,
                  borderTop: "2px solid rgba(255,255,255,0.08)",
                }}
              >
                thehatleague.com
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    color: ORANGE,
                    fontFamily: "Permanent Marker",
                    fontSize: 28,
                    letterSpacing: 0,
                    textTransform: "none",
                  }}
                >
                  More than mid
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: ORANGE,
                    }}
                  />
                  less than pro
                </div>
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 630,
            fonts,
          },
        );
      },
    },
  },
});
