"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBallchasingStats, type BallchasingGroupSummary } from "@/lib/ballchasing";

/**
 * League-ops lookup of a ballchasing.com group's aggregated player stats. Used
 * by the control-room ballchasing panel to pull match-night numbers. A group id
 * is the trailing segment of a ballchasing group URL
 * (ballchasing.com/group/<id>).
 */
export interface BallchasingLookupState {
  ok?: boolean;
  error?: string;
  summary?: BallchasingGroupSummary;
}

export async function lookupBallchasingGroup(groupId: string): Promise<BallchasingLookupState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." };
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "League ops only." };

  const id = groupId.trim().replace(/^.*ballchasing\.com\/group\//, "");
  if (!id) return { error: "Enter a ballchasing group id or URL." };
  if (!process.env.BALLCHASING_API_KEY) return { error: "BALLCHASING_API_KEY is not configured." };

  try {
    const summary = await getBallchasingStats({ groupId: id });
    return { ok: true, summary };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ballchasing lookup failed." };
  }
}
