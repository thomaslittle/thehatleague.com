import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Disable any caching — uptime probes want live signal.
export const dynamic = "force-dynamic";

/**
 * Uptime health check. Returns 200 only when the app is up AND can reach
 * Supabase; any other state returns 503 so Coolify (or any HTTP probe)
 * can flag the deploy.
 */
export async function GET() {
  const startedAt = Date.now();
  let supabaseOk = false;
  let supabaseError: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    // Cheapest possible round-trip — just confirm we can talk to Postgres.
    // RLS-public, count-only, no row payload.
    const { error } = await supabase
      .from("historical_player_stats")
      .select("id", { count: "exact", head: true })
      .limit(1);
    supabaseOk = !error;
    if (error) supabaseError = error.message;
  } catch (err) {
    supabaseError =
      err instanceof Error ? err.message : "unknown supabase error";
  }

  const body = {
    ok: supabaseOk,
    status: supabaseOk ? "healthy" : "degraded",
    checks: {
      app: true,
      supabase: { ok: supabaseOk, error: supabaseError },
    },
    elapsedMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: supabaseOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
