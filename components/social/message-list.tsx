"use client";

import { useEffect, useRef } from "react";
import { PersonAvatar } from "./person-avatar";
import type { MessageView } from "@/lib/data/social";

/** Scrollable thread of message bubbles; auto-scrolls to the newest on update. */
export function MessageList({
  messages,
  showSenders,
}: {
  messages: MessageView[];
  showSenders: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  // EFFECT JUSTIFICATION: keep the view pinned to the newest message after each
  // render/update — a layout side effect with no render-time equivalent.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "60vh", minHeight: "40vh" }}>
      {messages.length === 0 && (
        <p className="py-10 text-center text-sm text-neutral-500">No messages yet — say hi.</p>
      )}
      {messages.map((m) =>
        m.mine ? (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[78%]">
              <div className="rounded-2xl rounded-br-sm bg-thl-orange px-3.5 py-2 text-sm break-words whitespace-pre-wrap text-black">
                {m.body}
              </div>
              <div className="mt-0.5 text-right text-[10px] text-neutral-400">{m.timeLabel}</div>
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex items-end gap-2">
            <PersonAvatar name={m.senderName} avatarUrl={m.senderAvatarUrl} size={28} />
            <div className="max-w-[78%]">
              {showSenders && (
                <div className="mb-0.5 text-[11px] font-bold text-neutral-500">{m.senderName}</div>
              )}
              <div className="rounded-2xl rounded-bl-sm bg-neutral-100 px-3.5 py-2 text-sm break-words whitespace-pre-wrap dark:bg-neutral-900">
                {m.body}
              </div>
              <div className="mt-0.5 text-[10px] text-neutral-400">{m.timeLabel}</div>
            </div>
          </div>
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
