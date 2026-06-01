"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishPowerRankings } from "@/app/actions/tournament";

/** League-ops button: auto-publish the next power-ranking week from standings. */
export function PublishPowerRankings({ seasonId }: { seasonId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await publishPowerRankings(seasonId, {});
          if (res.error) toast.error(res.error);
          else toast.success(`Published rankings (${res.created} teams)`);
        })
      }
    >
      Publish from standings
    </Button>
  );
}
