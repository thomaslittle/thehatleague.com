import { redirect } from "next/navigation";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadFriends, loadFriendRequests } from "@/lib/data/social";
import { AddFriendForm } from "@/components/social/add-friend-form";
import { FriendsClient } from "@/components/social/friends-client";

export const metadata = {
  title: "Friends",
  description: "Your Hat League friends and requests.",
};

export default async function FriendsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/friends");

  const [friends, requests] = await Promise.all([
    loadFriends(user.id),
    loadFriendRequests(user.id),
  ]);

  return (
    <PageShell>
      <RealtimeRefresh tables={["friendships"]} channel={`friends:${user.id}`} />
      <PageHero
        eyebrow="Your circle"
        title="Friends &"
        accent="rivals."
        subtitle="Add other members, manage requests, and jump straight into a DM."
      />
      <section className="mx-auto max-w-[860px] px-6 pb-24 md:px-10">
        <AddFriendForm />
        <div className="mt-8">
          <FriendsClient
            friends={friends}
            incoming={requests.incoming}
            outgoing={requests.outgoing}
          />
        </div>
      </section>
    </PageShell>
  );
}
