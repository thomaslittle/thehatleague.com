"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageButton } from "./message-button";
import {
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  type FriendActionState,
} from "@/app/actions/friends";
import type { ProfileSocial } from "@/lib/data/social";

/** Add-friend / request / message actions shown on a player's profile. */
export function ProfileSocialActions({
  targetId,
  targetUsername,
  social,
}: {
  targetId: string;
  targetUsername: string;
  social: ProfileSocial;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<FriendActionState>) =>
    start(async () => {
      const r = await fn();
      if (r.error) toast.error(r.error);
      else router.refresh();
    });

  if (social.status === "self") return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {social.canMessage && <MessageButton targetId={targetId} />}

      {social.status === "none" && (
        <Button size="sm" disabled={pending} onClick={() => run(() => sendFriendRequest(targetUsername))}>
          <UserPlus className="h-3.5 w-3.5" aria-hidden />
          Add friend
        </Button>
      )}

      {social.status === "outgoing" && (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => removeFriend(targetId))}>
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Requested
        </Button>
      )}

      {social.status === "incoming" && social.friendshipId && (
        <>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => run(() => respondToFriendRequest(social.friendshipId!, true))}
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            Accept request
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => run(() => respondToFriendRequest(social.friendshipId!, false))}
          >
            Decline
          </Button>
        </>
      )}

      {social.status === "friends" && (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-thl-orange/15 px-2.5 py-1.5 text-xs font-bold text-thl-orange">
          <Check className="h-3.5 w-3.5" aria-hidden />
          Friends
        </span>
      )}
    </div>
  );
}
