import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";

const exchangeCode = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { code: string; next: string }) => data,
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(data.code);
    if (error) return { ok: false as const, message: error.message };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        ok: false as const,
        message: "Session wasn't created. Please try signing in again.",
      };
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

    return {
      ok: true as const,
      next: hasAnyRank ? data.next : "/onboarding",
    };
  });

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { code?: string; next: string; error?: string } = {
      next: safeRedirectPath(search.next, "/"),
    };
    if (typeof search.code === "string") out.code = search.code;
    if (typeof search.error === "string") out.error = search.error;
    return out;
  },
  loader: async ({ location }) => {
    const search = location.search as {
      code?: string;
      next: string;
      error?: string;
    };
    if (search.error) {
      throw redirect({
        to: "/signin",
        search: { redirect: search.next, error: search.error },
      });
    }
    if (!search.code) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: search.next,
          error: "Discord didn't return an auth code. Please try again.",
        },
      });
    }
    const result = await exchangeCode({
      data: { code: search.code, next: search.next },
    });
    if (!result.ok) {
      throw redirect({
        to: "/signin",
        search: { redirect: search.next, error: result.message },
      });
    }
    throw redirect({ href: result.next });
  },
  component: () => null,
});
