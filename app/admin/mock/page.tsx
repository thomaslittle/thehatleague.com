import { requireAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MockLab } from "@/components/admin/mock-lab";

export const metadata = {
  title: "Mock draft lab",
  robots: { index: false, follow: false },
};

export default async function AdminMockPage() {
  await requireAdmin("/admin/mock");
  const supabase = await createSupabaseServerClient();

  const { data: season } = await supabase
    .from("seasons")
    .select("id")
    .eq("slug", "mock-season")
    .maybeSingle();

  let summary: string | null = null;
  if (season) {
    const [{ count: players }, { count: teams }, { count: matches }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_mock", true),
      supabase.from("teams").select("id", { count: "exact", head: true }).eq("season_id", season.id),
      supabase.from("matches").select("id", { count: "exact", head: true }).eq("season_id", season.id),
    ]);
    summary = `${players ?? 0} mock players · ${teams ?? 0} teams · ${matches ?? 0} matches.`;
  }

  return <MockLab exists={Boolean(season)} summary={summary} />;
}
