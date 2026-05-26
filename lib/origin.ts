import { headers } from "next/headers";
import { env } from "@/lib/env";

/**
 * Public origin of the current request. Used to build absolute callback
 * URLs (OAuth, OG cards, webhooks) that must point at the public hostname
 * rather than the container-internal one.
 *
 * Order of precedence:
 *   1. x-forwarded-host + x-forwarded-proto (Coolify / Vercel / nginx etc.)
 *   2. host header
 *   3. NEXT_PUBLIC_SITE_URL fallback
 *
 * Always returns a value — defaults to env.SITE_URL when no headers exist
 * (server actions invoked outside a request context, tests, etc.).
 */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return env.SITE_URL;
}
