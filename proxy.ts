import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Match every path except static assets, image optimization, favicon,
  // and uptime probes (which are anonymous — no point hitting Supabase
  // auth on every health check from Coolify).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand|api/health|.*\\..*).*)",
  ],
};
