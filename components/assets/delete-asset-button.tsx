"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAsset } from "@/app/actions/assets";

export function DeleteAssetButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label="Delete"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await deleteAsset(id);
          if (res.error) toast.error(res.error);
          else router.refresh();
        })
      }
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
    </Button>
  );
}
