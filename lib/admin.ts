import "server-only";

import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/**
 * Resolve the current user's profile and refuse the request if they are
 * not an admin. Non-signed-in → /signin?redirect=.... Signed-in but not
 * admin → 404 (we don't want to leak that the /admin surface exists).
 */
export async function requireAdmin(redirectPath: string): Promise<Profile> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/signin?redirect=${encodeURIComponent(redirectPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    notFound();
  }
  return profile;
}
