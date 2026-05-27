import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter_Tight, Permanent_Marker, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { readThemePref } from "@/lib/theme";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";
import { QueryProvider } from "@/components/providers/query-provider";
import { BrandBackdropLayer } from "@/components/page/brand-backdrop";
import { PageProgress } from "@/components/page/page-progress";
import { RouteViewTransition } from "@/components/page/route-view-transition";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thehatleague.com"),
  title: {
    default: `${SITE.name} · Rocket League · ${SITE.seasonLabel}`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "A draft-style Rocket League tournament series for the older crowd. More than mid, less than pro. Sign up, get drafted live on Twitch, bring your hat.",
  openGraph: {
    title: SITE.name,
    description: "More than mid, less than pro.",
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: "More than mid, less than pro.",
    creator: "@hat_dad_gaming",
  },
  icons: {
    icon: [
      { url: "/brand/thl-logo.png", type: "image/png" },
    ],
    apple: { url: "/brand/thl-logo.png", type: "image/png" },
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    types: {
      "application/atom+xml": "/announcements/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  // Explicit width / initialScale — without them, defining a `viewport`
  // export overrides Next's default and the resulting meta tag drops
  // width=device-width, so mobile browsers load the page on a desktop
  // canvas and zoom in.
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await readThemePref();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(
        theme === "dark" && "dark",
        interTight.variable,
        permanentMarker.variable,
        jetbrainsMono.variable,
        geist.variable,
        "h-full font-sans antialiased",
      )}
    >
      <body className="relative min-h-full bg-white text-neutral-900 dark:bg-black dark:text-white">
        <BrandBackdropLayer />
        <a href="#main" className="thl-skip-link">
          Skip to content
        </a>
        <Suspense fallback={null}>
          <PageProgress />
        </Suspense>
        <QueryProvider>
          <RouteViewTransition>{children}</RouteViewTransition>
        </QueryProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
