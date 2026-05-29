import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { broadcastAnnouncementToDiscord } from "@/server/discord-messaging";

async function assertAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, supabase, userId: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false as const, supabase, userId: null };
  return { ok: true as const, supabase, userId: user.id };
}

export type AdminCaptainApplicant = {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  peak_rank: string | null;
  peak_rank_playlist: string | null;
  rank_2v2: string | null;
  rank_3v3: string | null;
  captain_pitch: string | null;
  updated_at: string;
};

export type AdminCaptain = {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  peak_rank: string | null;
  peak_rank_playlist: string | null;
};

export const getAdminStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const gate = await assertAdmin();
    if (!gate.ok) return null;
    const supabase = gate.supabase;
    const [
      { count: pendingCaptains },
      { count: confirmedCaptains },
      { count: pendingOps },
      { count: totalPool },
      { count: announcementCount },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_captain_applicant", true)
        .eq("is_captain", false),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_captain", true),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_admin_applicant", true)
        .eq("is_admin", false),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("in_player_pool", true),
      supabase
        .from("announcements")
        .select("id", { count: "exact", head: true }),
    ]);
    return {
      pendingCaptains: pendingCaptains ?? 0,
      confirmedCaptains: confirmedCaptains ?? 0,
      pendingOps: pendingOps ?? 0,
      totalPool: totalPool ?? 0,
      announcementCount: announcementCount ?? 0,
    };
  },
);

export const getAdminCaptainQueue = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    pending: AdminCaptainApplicant[];
    confirmed: AdminCaptain[];
  } | null> => {
    const gate = await assertAdmin();
    if (!gate.ok) return null;
    const [{ data: pending }, { data: confirmed }] = await Promise.all([
      gate.supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url, peak_rank, peak_rank_playlist, rank_2v2, rank_3v3, captain_pitch, updated_at",
        )
        .eq("is_captain_applicant", true)
        .eq("is_captain", false)
        .order("updated_at", { ascending: false }),
      gate.supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url, peak_rank, peak_rank_playlist",
        )
        .eq("is_captain", true)
        .order("created_at", { ascending: true }),
    ]);
    return {
      pending: (pending ?? []) as AdminCaptainApplicant[],
      confirmed: (confirmed ?? []) as AdminCaptain[],
    };
  },
);

export const approveCaptain = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("profiles")
      .update({ is_captain: true, is_captain_applicant: false })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const dismissCaptainApplication = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("profiles")
      .update({ is_captain_applicant: false })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const revokeCaptain = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("profiles")
      .update({ is_captain: false })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export type AdminOpsApplicant = {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  admin_pitch: string | null;
  updated_at: string;
};

export type AdminOps = {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
};

export const getAdminOpsQueue = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    pending: AdminOpsApplicant[];
    confirmed: AdminOps[];
  } | null> => {
    const gate = await assertAdmin();
    if (!gate.ok) return null;
    const [{ data: pending }, { data: confirmed }] = await Promise.all([
      gate.supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url, admin_pitch, updated_at",
        )
        .eq("is_admin_applicant", true)
        .eq("is_admin", false)
        .order("updated_at", { ascending: false }),
      gate.supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url",
        )
        .eq("is_admin", true)
        .order("created_at", { ascending: true }),
    ]);
    return {
      pending: (pending ?? []) as AdminOpsApplicant[],
      confirmed: (confirmed ?? []) as AdminOps[],
    };
  },
);

export const approveAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("profiles")
      .update({ is_admin: true, is_admin_applicant: false })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const dismissAdminApplication = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("profiles")
      .update({ is_admin_applicant: false })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("profiles")
      .update({ is_admin: false })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

// ---------- announcements (admin) ---------------------------------------

export type AdminAnnouncement = {
  id: number;
  slug: string;
  title: string;
  body: string;
  pinned: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const getAdminAnnouncements = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminAnnouncement[] | null> => {
    const gate = await assertAdmin();
    if (!gate.ok) return null;
    const { data } = await gate.supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(40);
    return (data ?? []) as AdminAnnouncement[];
  },
);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export const createAnnouncement = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string;
      body: string;
      pinned: boolean;
      isPublishing: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const title = data.title.trim();
    const body = data.body.trim();
    if (title.length < 4) {
      return { ok: false as const, message: "Title needs at least 4 characters." };
    }
    if (body.length < 10) {
      return { ok: false as const, message: "Body needs at least 10 characters." };
    }
    const slug = slugify(title) || `announcement-${Date.now()}`;
    const { error } = await gate.supabase.from("announcements").insert({
      slug,
      title,
      body,
      pinned: data.pinned,
      published_at: data.isPublishing ? new Date().toISOString() : null,
    });
    if (error) return { ok: false as const, message: error.message };

    // Fan out to Discord if a webhook is configured. Silent no-op
    // otherwise. Failures are swallowed — a flaky webhook shouldn't
    // fail the admin form.
    if (data.isPublishing) {
      void broadcastAnnouncementToDiscord({
        title,
        body,
        pinned: data.pinned,
        url: `${env.SITE_URL.replace(/\/$/, "")}/announcements/${slug}`,
      });
    }

    return { ok: true as const, slug };
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("announcements")
      .delete()
      .eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const togglePinAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; nextPinned: boolean }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("announcements")
      .update({ pinned: data.nextPinned })
      .eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

// ---------- players (admin manage) --------------------------------------

export type AdminPlayer = {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  in_player_pool: boolean;
  is_captain: boolean;
  is_admin: boolean;
  peak_rank: string | null;
};

export const getAdminPlayers = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminPlayer[] | null> => {
    const gate = await assertAdmin();
    if (!gate.ok) return null;
    const { data } = await gate.supabase
      .from("profiles")
      .select(
        "id, discord_username, discord_global_name, discord_avatar_url, in_player_pool, is_captain, is_admin, peak_rank",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []) as AdminPlayer[];
  },
);

export const setPlayerInPool = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string; next: boolean }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    const { error } = await gate.supabase
      .from("profiles")
      .update({ in_player_pool: data.next })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const setPlayerAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { profileId: string; next: boolean }) => data)
  .handler(async ({ data }) => {
    const gate = await assertAdmin();
    if (!gate.ok) return { ok: false as const, message: "forbidden" };
    // Self-demote guard: don't let the actor remove their own admin bit.
    if (gate.userId === data.profileId && !data.next) {
      return { ok: false as const, message: "Can't demote yourself." };
    }
    const { error } = await gate.supabase
      .from("profiles")
      .update({ is_admin: data.next })
      .eq("id", data.profileId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });
