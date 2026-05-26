import type { NextConfig } from "next";

const securityHeaders = [
  // Browsers won't try to guess MIME types — prevents a class of attacks
  // where e.g. a JSON response gets interpreted as HTML.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking guard: pages may only be framed by same-origin documents.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Don't leak full URLs (with query params) to third-party hosts.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny sensor APIs we don't use; opts out of FLoC.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // Strip X-Powered-By: Next.js — version disclosure is free recon for
  // attackers and adds zero value.
  poweredByHeader: false,
  // Server Actions default to a 1 MB request body. Profile avatar/banner
  // uploads run through a Server Action and easily exceed that — bump
  // to 10 MB. Hard cap on what we'll accept; the upload handler should
  // still validate type/size before persisting.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      // Discord-hosted user avatars (delivered through cdn.discordapp.com).
      { protocol: "https", hostname: "cdn.discordapp.com" },
      // YouTube thumbnails for the hype-reel cards.
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
