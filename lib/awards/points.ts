// Central, tunable points economy. One place to adjust how every action scores.
// Awards are idempotent via the `point_events_dedup` index (profile, source,
// ref_type, ref_id) — always pass a ref for repeatable events.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export const POINT_VALUES = {
  matchWin: 50,
  matchPlayed: 10,
  goal: 5,
  assist: 3,
  save: 2,
  demo: 1,
  mvp: 25,
  clip: 10,
  combine: 15,
  predictionCorrect: 10,
  badge: 20,
  champion: 200,
} as const;

export interface AwardPointsInput {
  profileId: string;
  seasonId: string | null;
  source: string;
  points: number;
  refType?: string | null;
  refId?: string | null;
  note?: string | null;
}

/** Idempotent points award. Re-running with the same (profile, source, ref) is a no-op. */
export async function awardPoints(supabase: Client, input: AwardPointsInput): Promise<void> {
  if (!input.points) return;
  await supabase.from("point_events").upsert(
    {
      profile_id: input.profileId,
      season_id: input.seasonId,
      source: input.source,
      points: input.points,
      ref_type: input.refType ?? null,
      ref_id: input.refId ?? null,
      note: input.note ?? null,
    },
    { onConflict: "profile_id,source,ref_type,ref_id", ignoreDuplicates: true },
  );
}
