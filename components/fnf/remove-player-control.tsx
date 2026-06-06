"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removePlayer } from "@/app/actions/fnf";

/** Admin-only "remove from tournament" button shown on an entered player's
 *  card. Confirms before removing so it can't be hit by accident. */
export function RemovePlayerControl({
  tournamentId,
  profileId,
  name,
}: {
  tournamentId: string;
  profileId: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        aria-label={`Remove ${name} from the tournament`}
        title="Remove from tournament"
        onClick={() => setOpen(true)}
        className="absolute -top-1.5 -right-1.5 z-10 inline-flex size-5 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-400 shadow-sm transition hover:border-red-400 hover:bg-red-500 hover:text-white dark:border-neutral-700 dark:bg-neutral-900"
      >
        <X className="size-3" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border border-neutral-200 bg-white p-6 sm:max-w-md dark:border-neutral-800 dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>Remove {name}?</DialogTitle>
            <DialogDescription>
              They&apos;ll be taken out of this tournament (and any team they
              were placed on). They can re-enter while registration is open.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await removePlayer(tournamentId, profileId);
                  if (res.error) toast.error(res.error);
                  else {
                    toast.success(`${name} removed.`);
                    setOpen(false);
                    router.refresh();
                  }
                })
              }
            >
              <X className="size-3.5" />
              Remove player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
