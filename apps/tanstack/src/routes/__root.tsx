import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/server/auth";
import { readTheme } from "@/server/theme";
import { getTwitchLive } from "@/server/twitch";
import { getRecentAnnouncements } from "@/server/announcements";
import { getPoolCount } from "@/server/pool";
import appCss from "@/styles/app.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "The Hat League · Season 04" },
      {
        name: "description",
        content:
          "The Hat League — a draft-style Rocket League tournament series for hat dads.",
      },
      { name: "theme-color", content: "#f76103" },
      // Open Graph defaults — per-route head() overrides extend these.
      { property: "og:site_name", content: "The Hat League" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "The Hat League · Season 04" },
      {
        property: "og:description",
        content:
          "A draft-style Rocket League tournament series for hat dads. More than mid, less than pro.",
      },
      {
        property: "og:image",
        content:
          "/api/og?title=The+Hat+League&subtitle=A+draft-style+Rocket+League+series&eyebrow=Season+04",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      // Twitter card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Hat League · Season 04" },
      {
        name: "twitter:description",
        content:
          "A draft-style Rocket League tournament series for hat dads.",
      },
      {
        name: "twitter:image",
        content:
          "/api/og?title=The+Hat+League&subtitle=A+draft-style+Rocket+League+series&eyebrow=Season+04",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/brand/thl-logo.png" },
      { rel: "apple-touch-icon", href: "/brand/thl-logo.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  loader: async () => {
    const [viewer, theme, twitch, announcements, poolCount] =
      await Promise.all([
        getViewer(),
        readTheme(),
        getTwitchLive(),
        getRecentAnnouncements({ data: { limit: 1 } }),
        getPoolCount(),
      ]);
    const headline = announcements[0]
      ? { slug: announcements[0].slug, title: announcements[0].title }
      : null;
    return { viewer, theme, twitch, headline, poolCount };
  },
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = useRouteContext({ from: "__root__" });
  const { viewer, theme, twitch, headline, poolCount } =
    Route.useLoaderData();
  return (
    <RootDocument theme={theme}>
      <QueryClientProvider client={queryClient}>
        <a href="#main" className="thl-skip-link">
          Skip to content
        </a>
        <SiteHeader
          initialViewer={viewer}
          initialTheme={theme}
          initialTwitch={twitch}
          headlineAnnouncement={headline}
          navCounts={{ "/pool": poolCount }}
        />
        <Outlet />
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({
  children,
  theme,
}: {
  children: ReactNode;
  theme: "light" | "dark";
}) {
  return (
    <html
      lang="en"
      className={"h-full antialiased " + (theme === "dark" ? "dark" : "")}
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-full bg-white text-neutral-900 dark:bg-black dark:text-white">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
