import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/origin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Use the public origin (x-forwarded-host) rather than request.url's
  // origin. Behind a reverse proxy like Coolify the latter resolves to
  // the container-internal host (e.g. http://0.0.0.0:3000) which would
  // bounce the user to localhost after Supabase finishes the handshake.
  const origin = await siteOrigin();

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/signin?error=no_session`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rl_tracker_url, rank_2v2, rank_3v3, peak_rank")
    .eq("id", user.id)
    .single();

  const hasAnyRank = Boolean(
    profile?.rl_tracker_url ||
      profile?.rank_2v2 ||
      profile?.rank_3v3 ||
      profile?.peak_rank,
  );

  // Brand new user with no rank info → drop them into the onboarding flow.
  // Returning users (or anyone who already touched onboarding) → dashboard.
  const dest = hasAnyRank ? next : "/onboarding";
  return NextResponse.redirect(`${origin}${dest}`);
}
