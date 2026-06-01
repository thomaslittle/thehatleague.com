"use client";

import { useTransition, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startDm } from "@/app/actions/messages";

/** Opens (or starts) a DM with a user and navigates to the thread. */
export function MessageButton({
  targetId,
  label = "Message",
  variant = "outline",
  size = "sm",
  className,
}: {
  targetId: string;
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
          const res = await startDm(targetId);
          if (res.error || !res.conversationId) {
            toast.error(res.error ?? "Couldn't open chat.");
            return;
          }
          router.push(`/messages/${res.conversationId}`);
        })
      }
    >
      <MessageSquare className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Button>
  );
}
