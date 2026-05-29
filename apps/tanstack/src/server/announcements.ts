import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Announcement = {
  id: number;
  slug: string;
  title: string;
  body: string;
  published_at: string | null;
  posted_by: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export const getRecentAnnouncements = createServerFn({ method: "GET" })
  .inputValidator((data: { limit?: number } | undefined) => ({
    limit: data?.limit ?? 6,
  }))
  .handler(async ({ data }): Promise<Announcement[]> => {
    const supabase = createSupabaseServerClient();
    const { data: rows } = await supabase
      .from("announcements")
      .select("*")
      .not("published_at", "is", null)
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(data.limit);
    return (rows ?? []) as Announcement[];
  });

export const getAnnouncementBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<Announcement | null> => {
    const supabase = createSupabaseServerClient();
    const { data: row } = await supabase
      .from("announcements")
      .select("*")
      .eq("slug", data.slug)
      .not("published_at", "is", null)
      .maybeSingle();
    return (row ?? null) as Announcement | null;
  });
