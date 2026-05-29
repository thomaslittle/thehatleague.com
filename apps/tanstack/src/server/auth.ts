import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import type { User } from "@supabase/supabase-js";

const DISCORD_SCOPES = ["identify", "guilds", "guilds.members.read"].join(" ");

function cleanDiscordUsername(username: string | null | undefined): string | null {
  if (!username) return null;
  return username.replace(/#0+$/, "");
}

/**
 * Brand-new sign-ins occasionally land here before the Supabase auth
 * trigger fires on INSERT — without upserting first, UPDATE matches zero
 * rows and the user gets stuck looping between /onboarding and /dashboard.
 */
async function ensureProfileRow(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  user: User,
): Promise<void> {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawUsername =
    (meta.user_name as string | undefined) ??
    (meta.preferred_username as string | undefined) ??
    (meta.name as string | undefined) ??
    null;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      discord_id: (meta.provider_id as string | undefined) ?? null,
      discord_username: cleanDiscordUsername(rawUsername),
      discord_global_name: (meta.full_name as string | undefined) ?? null,
      discord_avatar_url: (meta.avatar_url as string | undefined) ?? null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
}

function requestOrigin(): string {
  const request = getRequest();
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

export const startDiscordOAuth = createServerFn({ method: "POST" })
  .inputValidator((data: { redirect?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    const next = safeRedirectPath(data.redirect, "/dashboard");
    const supabase = createSupabaseServerClient();
    const callback = `${requestOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
    const { data: oauth, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: callback,
        scopes: DISCORD_SCOPES,
      },
    });
    if (error || !oauth?.url) {
      return {
        ok: false as const,
        message:
          error?.message ?? "Couldn't reach Discord. Please try again.",
      };
    }
    return { ok: true as const, url: oauth.url };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true as const };
});

export const togglePoolMembership = createServerFn({ method: "POST" })
  .inputValidator((data: { wantIn: boolean }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
    await ensureProfileRow(supabase, user);
    const { error } = await supabase
      .from("profiles")
      .update({ in_player_pool: data.wantIn })
      .eq("id", user.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

const SOCIAL_KEYS = [
  "x",
  "twitch",
  "youtube",
  "tiktok",
  "instagram",
] as const;

export const updateProfileCustomization = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { bio: string | null; socials: Record<string, string> }) => data,
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
    await ensureProfileRow(supabase, user);

    const trimmedBio = data.bio?.trim() || null;
    if (trimmedBio && trimmedBio.length > 280) {
      return { ok: false as const, message: "Bio must be 280 characters or less." };
    }

    const links: Record<string, string> = {};
    for (const k of SOCIAL_KEYS) {
      const raw = (data.socials?.[k] ?? "").trim();
      if (!raw) continue;
      if (!/^https?:\/\//i.test(raw)) {
        return {
          ok: false as const,
          message: `${k}: must be a full URL starting with https://`,
        };
      }
      links[k] = raw;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        bio: trimmedBio,
        social_links: Object.keys(links).length ? links : null,
      })
      .eq("id", user.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const getViewer = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, is_admin, is_captain, is_captain_applicant, is_admin_applicant, captain_pitch, admin_pitch, in_player_pool, rl_tracker_url, rank_2v2, rank_3v3, peak_rank, peak_rank_playlist, ranks_updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  let pendingAdminQueue = 0;
  if (profile?.is_admin) {
    const [captainQueue, leagueOpsQueue] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_captain_applicant", true)
        .eq("is_captain", false),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_admin_applicant", true)
        .eq("is_admin", false),
    ]);
    pendingAdminQueue =
      (captainQueue.count ?? 0) + (leagueOpsQueue.count ?? 0);
  }

  return {
    userId: user.id,
    discordUsername: cleanDiscordUsername(profile?.discord_username),
    displayName: profile?.discord_global_name ?? null,
    avatarUrl:
      profile?.profile_avatar_url ?? profile?.discord_avatar_url ?? null,
    isAdmin: !!profile?.is_admin,
    isCaptain: !!profile?.is_captain,
    isCaptainApplicant: !!profile?.is_captain_applicant,
    isAdminApplicant: !!profile?.is_admin_applicant,
    captainPitch: profile?.captain_pitch ?? null,
    adminPitch: profile?.admin_pitch ?? null,
    inPlayerPool: profile?.in_player_pool ?? true,
    trackerUrl: profile?.rl_tracker_url ?? null,
    rank2v2: profile?.rank_2v2 ?? null,
    rank3v3: profile?.rank_3v3 ?? null,
    peakRank: profile?.peak_rank ?? null,
    peakPlaylist: profile?.peak_rank_playlist ?? null,
    ranksUpdatedAt: profile?.ranks_updated_at ?? null,
    pendingAdminQueue,
  };
});

const PITCH_MIN = 40;
const PITCH_MAX = 1200;

export const applyForCaptain = createServerFn({ method: "POST" })
  .inputValidator((data: { pitch: string }) => data)
  .handler(async ({ data }) => {
    const pitch = (data.pitch ?? "").trim();
    if (pitch.length < PITCH_MIN) {
      return {
        ok: false as const,
        message: `Tell us a bit more — at least ${PITCH_MIN} characters.`,
      };
    }
    if (pitch.length > PITCH_MAX) {
      return {
        ok: false as const,
        message: `Trim it to under ${PITCH_MAX} characters.`,
      };
    }
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
    await ensureProfileRow(supabase, user);
    const { error } = await supabase
      .from("profiles")
      .update({ is_captain_applicant: true, captain_pitch: pitch })
      .eq("id", user.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const withdrawCaptainApplication = createServerFn({
  method: "POST",
}).handler(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
  const { error } = await supabase
    .from("profiles")
    .update({ is_captain_applicant: false })
    .eq("id", user.id);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
});

export const applyForLeagueOps = createServerFn({ method: "POST" })
  .inputValidator((data: { pitch: string }) => data)
  .handler(async ({ data }) => {
    const pitch = (data.pitch ?? "").trim();
    if (pitch.length < PITCH_MIN) {
      return {
        ok: false as const,
        message: `Tell us a bit more — at least ${PITCH_MIN} characters.`,
      };
    }
    if (pitch.length > PITCH_MAX) {
      return {
        ok: false as const,
        message: `Trim it to under ${PITCH_MAX} characters.`,
      };
    }
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
    await ensureProfileRow(supabase, user);
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin_applicant: true, admin_pitch: pitch })
      .eq("id", user.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const withdrawLeagueOpsApplication = createServerFn({
  method: "POST",
}).handler(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin_applicant: false })
    .eq("id", user.id);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
});

import { getTrackerRanks, TRACKER_URL_RE } from "@/lib/tracker";

export const submitOnboarding = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      trackerUrl: string;
      rank2v2: string;
      rank3v3: string;
      peakRank: string;
      peakPlaylist?: string;
      inPlayerPool: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
    await ensureProfileRow(supabase, user);

    if (!TRACKER_URL_RE.test(data.trackerUrl)) {
      return { ok: false as const, message: "Invalid tracker URL." };
    }
    if (!data.rank2v2 || !data.rank3v3 || !data.peakRank) {
      return { ok: false as const, message: "All three ranks are required." };
    }

    // Route through the tracker-adapter interface so when adapter #2
    // lands (automated scrape), this handler doesn't change. Today the
    // manual adapter just echoes the user-supplied values back.
    let ranks;
    try {
      ranks = await getTrackerRanks({
        trackerUrl: data.trackerUrl,
        manual: {
          rank2v2: data.rank2v2,
          rank3v3: data.rank3v3,
          peakRank: data.peakRank,
          peakPlaylist: (data.peakPlaylist as never) ?? null,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Couldn't read your tracker profile. Try again in a moment.";
      return { ok: false as const, message };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        rl_tracker_url: ranks.trackerUrl,
        rank_2v2: ranks.rank2v2,
        rank_3v3: ranks.rank3v3,
        peak_rank: ranks.peakRank,
        peak_rank_playlist: ranks.peakPlaylist,
        in_player_pool: data.inPlayerPool,
        ranks_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const skipOnboarding = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, message: "Your session expired. Please sign in again." };
    await ensureProfileRow(supabase, user);
    const { error } = await supabase
      .from("profiles")
      .update({ in_player_pool: true })
      .eq("id", user.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  },
);
