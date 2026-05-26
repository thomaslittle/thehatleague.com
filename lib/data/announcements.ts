import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/supabase/types";

/**
 * Fetch the latest published announcements. Pinned posts always sort first,
 * then by published_at descending.
 */
export async function getRecentAnnouncements(
  limit = 6,
): Promise<Announcement[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .not("published_at", "is", null)
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAnnouncementBySlug(
  slug: string,
): Promise<Announcement | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  return data;
}
