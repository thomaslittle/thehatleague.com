import { createFileRoute } from "@tanstack/react-router";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Uptime health check. Returns 200 only when the app is up AND can reach
 * Supabase; any other state returns 503 so an HTTP probe can flag the
 * deploy.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const startedAt = Date.now();
        let supabaseOk = false;
        let supabaseError: string | null = null;

        try {
          const supabase = createSupabaseServerClient();
          // Cheapest round-trip — count-only, no row payload.
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

        return new Response(JSON.stringify(body), {
          status: supabaseOk ? 200 : 503,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
