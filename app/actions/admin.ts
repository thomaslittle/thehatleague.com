"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { broadcastAnnouncementToDiscord } from "@/lib/discord/messaging";
import { env } from "@/lib/env";

/** Promote an applicant to captain. */
export async function approveCaptain(formData: FormData) {
  await requireAdmin("/admin/captains");
  const profileId = String(formData.get("profile_id") ?? "").trim();
  if (!profileId) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ is_captain: true, is_captain_applicant: false })
    .eq("id", profileId);

  revalidatePath("/admin/captains");
  revalidatePath("/captains");
  revalidatePath("/pool");
}

/** Reject an application — clears the applicant flag, keeps the pitch
 *  on file in case they reapply. */
export async function dismissCaptainApplication(formData: FormData) {
  await requireAdmin("/admin/captains");
  const profileId = String(formData.get("profile_id") ?? "").trim();
  if (!profileId) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ is_captain_applicant: false })
    .eq("id", profileId);

  revalidatePath("/admin/captains");
  revalidatePath("/captains");
}

/** Demote a captain (e.g. they had to step down). */
export async function revokeCaptain(formData: FormData) {
  await requireAdmin("/admin/captains");
  const profileId = String(formData.get("profile_id") ?? "").trim();
  if (!profileId) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ is_captain: false })
    .eq("id", profileId);

  revalidatePath("/admin/captains");
  revalidatePath("/captains");
}

// ---------- announcements ------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface CreateAnnouncementState {
  ok?: boolean;
  error?: string;
}

export async function createAnnouncement(
  _prev: CreateAnnouncementState | undefined,
  formData: FormData,
): Promise<CreateAnnouncementState> {
  await requireAdmin("/admin/announcements");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const pinned = formData.get("pinned") === "on";
  const action = String(formData.get("publish_mode") ?? "publish");

  if (title.length < 4) return { error: "Title needs at least 4 characters." };
  if (body.length < 10) return { error: "Body needs at least 10 characters." };

  const supabase = await createSupabaseServerClient();
  const slug = slugify(title) || `announcement-${Date.now()}`;

  const isPublishing = action !== "draft";
  const { error } = await supabase.from("announcements").insert({
    slug,
    title,
    body,
    pinned,
    published_at: isPublishing ? new Date().toISOString() : null,
  });

  if (error) {
    return { error: error.message };
  }

  // Fan out to Discord if a webhook is configured. Silent no-op otherwise.
  if (isPublishing) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    const origin = host ? `${proto}://${host}` : env.SITE_URL;
    void broadcastAnnouncementToDiscord({
      title,
      body,
      pinned,
      url: `${origin}/announcements/${slug}`,
    });
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/admin/announcements?ok=1");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin("/admin/announcements");
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
}

export async function togglePinAnnouncement(formData: FormData) {
  await requireAdmin("/admin/announcements");
  const id = Number(formData.get("id") ?? 0);
  const pinned = formData.get("pinned") === "on";
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("announcements")
    .update({ pinned: !pinned })
    .eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
}
