import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Users } from "lucide-react";
import { PageShell } from "@/components/page/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadConversation } from "@/lib/data/social";
import { PersonAvatar } from "@/components/social/person-avatar";
import { MessageList } from "@/components/social/message-list";
import { Composer } from "@/components/social/composer";
import { ThreadLive } from "@/components/social/thread-live";

export const metadata = {
  title: "Conversation",
};

export default async function ThreadPage(props: PageProps<"/messages/[conversationId]">) {
  const { conversationId } = await props.params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signin?redirect=/messages/${conversationId}`);

  const conv = await loadConversation(user.id, conversationId);
  if (!conv) notFound();

  const titleHref =
    conv.kind === "team" && conv.teamSlug
      ? `/teams/${conv.teamSlug}`
      : conv.otherId && conv.subtitle?.startsWith("@")
        ? `/players/${encodeURIComponent(conv.subtitle.slice(1))}`
        : null;

  const Header = (
    <div className="flex items-center gap-3">
      {conv.kind === "team" ? (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: conv.color ?? "var(--color-thl-orange)" }}
        >
          <Users className="h-5 w-5" aria-hidden />
        </span>
      ) : (
        <PersonAvatar name={conv.title} avatarUrl={conv.avatarUrl} size={44} />
      )}
      <div className="min-w-0">
        <div className="truncate text-lg font-bold tracking-tight">{conv.title}</div>
        {conv.subtitle && <div className="truncate text-xs text-neutral-500">{conv.subtitle}</div>}
      </div>
    </div>
  );

  return (
    <PageShell>
      <ThreadLive conversationId={conversationId} />
      <section className="mx-auto max-w-[760px] px-6 py-8 md:px-10">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          ← Inbox
        </Link>

        <div className="mt-4">{titleHref ? <Link href={titleHref}>{Header}</Link> : Header}</div>

        <div className="mt-4 flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <MessageList messages={conv.messages} showSenders={conv.kind === "team"} />
          <Composer conversationId={conversationId} />
        </div>
      </section>
    </PageShell>
  );
}
