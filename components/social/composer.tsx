"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/app/actions/messages";

/** Message composer — Enter to send, Shift+Enter for a newline. */
export function Composer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    start(async () => {
      const res = await sendMessage(conversationId, text);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Message…"
        className="max-h-40 min-h-[2.5rem] flex-1 resize-none"
      />
      <Button type="submit" size="icon" disabled={pending || !body.trim()} aria-label="Send">
        <SendHorizontal className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}
