"use client";

import { useTransition, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openTeamConversation } from "@/app/actions/messages";

/** Opens (or creates) the team's chat channel. Only meaningful for team members. */
export function TeamChatButton({
  teamId,
  label = "Team chat",
  variant = "outline",
  size = "sm",
  className,
}: {
  teamId: string;
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await openTeamConversation(teamId);
          if (res.error || !res.conversationId) {
            toast.error(res.error ?? "Couldn't open team chat.");
            return;
          }
          router.push(`/messages/${res.conversationId}`);
        })
      }
    >
      <Users className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
