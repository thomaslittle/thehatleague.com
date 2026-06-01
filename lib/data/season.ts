import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Season } from "@/lib/supabase/types";

/**
 * Resolve the "current" season for the CURRENT VIEWER.
 *
 * Admin-only mock mode: while a `mock-*` season exists, admins are routed to it
 * (so they can test the whole site with demo data) while the public continues to
 * see the real active season — mock data never leaks to signups/visitors. Public
 * resolution: the explicitly active non-mock season, else the latest non-mock.
 *
 * Wrapped in React `cache` so the many server components that call it during one
 * render share a single resolution per request (it's per-request, so different
 * viewers still resolve independently).
 */
export const getActiveSeason = cache(async (): Promise<Season | null> => {
  const supabase = await createSupabaseServerClient();

  // Admins testing a mock draft see the mock season; nobody else does.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.is_admin) {
      const { data: mock } = await supabase
        .from("seasons")
        .select("*")
        .like("slug", "mock-%")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mock) return mock;
    }
  }

  const { data: active } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .not("slug", "like", "mock-%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (active) return active;

  const { data: latest } = await supabase
    .from("seasons")
    .select("*")
    .not("slug", "like", "mock-%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return latest ?? null;
});

export async function getSeasonBySlug(slug: string): Promise<Season | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("seasons")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}
