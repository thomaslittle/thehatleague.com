"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Keep the Friday Nite Fights view live. Registrations, teams, matches and
 * status all change from multiple players reporting at once, so we subscribe
 * to every FNF table and refresh the server-rendered tree on any change.
 *
 * EFFECT JUSTIFICATION: Supabase Realtime needs a long-lived channel tied to
 * the component lifetime; there's no render-time equivalent. We debounce
 * bursts (a round completing fires many row events) into a single refresh.
 */
export function FnfRealtime() {
  const router = useRouter();
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };
    const channel = supabase
      .channel(`fnf:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "fnf_matches" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "fnf_teams" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "fnf_team_members" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "fnf_registrations" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "fnf_tournaments" }, refresh)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [router]);
  return null;
}
