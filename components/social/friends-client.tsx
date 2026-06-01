"use client";

import Link from "next/link";
import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "./person-avatar";
import { MessageButton } from "./message-button";
import { respondToFriendRequest, removeFriend, type FriendActionState } from "@/app/actions/friends";
import type { PersonCard, FriendRequestCard } from "@/lib/data/social";

function profileHref(username: string | null): string | null {
  return username ? `/players/${encodeURIComponent(username)}` : null;
}

function Row({ person, children }: { person: PersonCard; children: ReactNode }) {
  const href = profileHref(person.username);
  const name = (
    <span className="truncate text-sm font-bold">{person.name}</span>
  );
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-3 py-2.5 dark:border-neutral-800">
      <PersonAvatar name={person.name} avatarUrl={person.avatarUrl} size={40} />
      <div className="min-w-0 flex-1">
        {href ? (
          <Link href={href} className="hover:text-thl-orange">
            {name}
          </Link>
        ) : (
          name
        )}
        {person.username && (
          <div className="truncate text-xs text-neutral-500">@{person.username}</div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </li>
  );
}

export function FriendsClient({
  friends,
  incoming,
  outgoing,
}: {
  friends: PersonCard[];
  incoming: FriendRequestCard[];
  outgoing: FriendRequestCard[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<FriendActionState>) =>
    start(async () => {
      const res = await fn();
      if (res.error) toast.error(res.error);
      else router.refresh();
    });

  return (
    <div className="space-y-8">
      {incoming.length > 0 && (
        <section>
          <h2 className="text-lg font-bold tracking-tight">
            Friend requests <span className="text-thl-orange tabular-nums">{incoming.length}</span>
          </h2>
          <ul className="mt-3 space-y-2">
            {incoming.map((r) => (
              <Row key={r.friendshipId} person={r}>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => respondToFriendRequest(r.friendshipId, true))}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => respondToFriendRequest(r.friendshipId, false))}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Decline
                </Button>
              </Row>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold tracking-tight">
          Friends <span className="text-neutral-400 tabular-nums">{friends.length}</span>
        </h2>
        {friends.length === 0 ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-500 dark:border-neutral-700">
            <Users className="h-5 w-5 text-neutral-400" aria-hidden />
            No friends yet — add someone by username above.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {friends.map((f) => (
              <Row key={f.id} person={f}>
                <MessageButton targetId={f.id} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${f.name}`}
                  disabled={pending}
                  onClick={() => run(() => removeFriend(f.id))}
                >
                  <UserMinus className="h-4 w-4" aria-hidden />
                </Button>
              </Row>
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 && (
        <section>
          <h2 className="text-lg font-bold tracking-tight">Pending sent</h2>
          <ul className="mt-3 space-y-2">
            {outgoing.map((r) => (
              <Row key={r.friendshipId} person={r}>
                <span className="text-xs font-semibold text-neutral-400">Pending</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => removeFriend(r.id))}
                >
                  Cancel
                </Button>
              </Row>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
