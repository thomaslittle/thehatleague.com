import { createFileRoute } from "@tanstack/react-router";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Admin-only diagnostic: confirms the env vars are loaded, hits Discord
// once with no cache, and reports back exactly what the API returns
// (status + message count + first message shape). Use this when the
// landing-page Clips section is showing the placeholder despite env
// vars being set on the deployment.

interface DebugReport {
  envLoaded: {
    DISCORD_BOT_TOKEN: boolean;
    DISCORD_GUILD_ID: boolean;
    DISCORD_CLIPS_CHANNEL_ID: boolean;
  };
  channelId: string | null;
  guildId: string | null;
  discord:
    | { ok: false; status: number; statusText: string; body: string }
    | {
        ok: true;
        status: number;
        messageCount: number;
        sample: Array<{
          id: string;
          author: string;
          contentPreview: string;
          attachmentTypes: string[];
          embedTypes: string[];
          reactionTotal: number;
        }>;
      };
}

export const Route = createFileRoute("/api/debug/clips")({
  server: {
    handlers: {
      GET: async () => {
        // Admin gate — inline since this is a server route, not a server
        // function, and can't reuse the `assertAdmin()` helper directly.
        const supabase = createSupabaseServerClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return new Response("Unauthorized", { status: 401 });
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile?.is_admin) {
          return new Response("Not found", { status: 404 });
        }

        const token = process.env.DISCORD_BOT_TOKEN;
        const channelId = process.env.DISCORD_CLIPS_CHANNEL_ID ?? null;
        const guildId = process.env.DISCORD_GUILD_ID ?? null;

        const report: DebugReport = {
          envLoaded: {
            DISCORD_BOT_TOKEN: !!token,
            DISCORD_GUILD_ID: !!guildId,
            DISCORD_CLIPS_CHANNEL_ID: !!channelId,
          },
          channelId,
          guildId,
          discord: { ok: false, status: 0, statusText: "no fetch", body: "" },
        };

        if (!token || !channelId) {
          return Response.json(report);
        }

        const res = await fetch(
          `https://discord.com/api/v10/channels/${channelId}/messages?limit=10`,
          {
            headers: {
              Authorization: `Bot ${token}`,
              "User-Agent": "TheHatLeague-Debug",
            },
            cache: "no-store",
          },
        ).catch(() => null);

        if (!res) {
          report.discord = {
            ok: false,
            status: 0,
            statusText: "fetch-failed",
            body: "network error",
          };
          return Response.json(report);
        }

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          report.discord = {
            ok: false,
            status: res.status,
            statusText: res.statusText,
            body: body.slice(0, 500),
          };
          return Response.json(report);
        }

        const json = (await res.json().catch(() => null)) as unknown;
        if (!Array.isArray(json)) {
          report.discord = {
            ok: false,
            status: res.status,
            statusText: "unexpected-shape",
            body: JSON.stringify(json).slice(0, 500),
          };
          return Response.json(report);
        }

        type Msg = {
          id: string;
          author?: { username?: string; global_name?: string };
          content?: string;
          attachments?: Array<{ content_type?: string }>;
          embeds?: Array<{ type?: string }>;
          reactions?: Array<{ count: number }>;
        };

        const sample = (json as Msg[]).slice(0, 5).map((m) => ({
          id: m.id,
          author: m.author?.global_name ?? m.author?.username ?? "?",
          contentPreview: (m.content ?? "").slice(0, 120),
          attachmentTypes:
            m.attachments?.map((a) => a.content_type ?? "?") ?? [],
          embedTypes: m.embeds?.map((e) => e.type ?? "?") ?? [],
          reactionTotal: (m.reactions ?? []).reduce(
            (sum, r) => sum + (r.count ?? 0),
            0,
          ),
        }));

        report.discord = {
          ok: true,
          status: res.status,
          messageCount: (json as Msg[]).length,
          sample,
        };

        return Response.json(report);
      },
    },
  },
});
