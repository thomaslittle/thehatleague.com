import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare, Users } from "lucide-react";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadConversations } from "@/lib/data/social";
import { PersonAvatar } from "@/components/social/person-avatar";

export const metadata = {
  title: "Messages",
  description: "Your Hat League direct messages and team chat.",
};

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/messages");

  const conversations = await loadConversations(user.id);

  return (
    <PageShell>
      <RealtimeRefresh
        tables={["conversations", "conversation_reads"]}
        channel={`inbox:${user.id}`}
      />
      <PageHero eyebrow="Inbox" title="Your" accent="messages." subtitle="Direct messages and your team channel, all in one place." />
      <section className="mx-auto max-w-[760px] px-6 pb-24 md:px-10">
        {conversations.length === 0 ? (
          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-neutral-300 px-5 py-10 text-sm text-neutral-500 dark:border-neutral-700">
            <MessagesSquare className="h-5 w-5 text-neutral-400" aria-hidden />
            No conversations yet. Start one from a teammate&apos;s or friend&apos;s profile.
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-thl-orange dark:border-neutral-800"
                >
                  {c.kind === "team" ? (
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: c.color ?? "var(--color-thl-orange)" }}
                    >
                      <Users className="h-5 w-5" aria-hidden />
                    </span>
                  ) : (
                    <PersonAvatar name={c.title} avatarUrl={c.avatarUrl} size={44} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold">{c.title}</span>
                      {c.kind === "team" && (
                        <span className="rounded bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                          Team
                        </span>
                      )}
                      {c.lastActivityLabel && (
                        <span className="ml-auto shrink-0 text-xs text-neutral-400">
                          {c.lastActivityLabel}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-sm text-neutral-500">
                      {c.lastMessage ?? "No messages yet"}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-thl-orange px-1 text-[10px] font-extrabold tabular-nums text-black">
                      {c.unread > 9 ? "9+" : c.unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
