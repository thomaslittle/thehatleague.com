"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Swords } from "lucide-react";
import { registerForFnf, leaveFnf } from "@/app/actions/fnf";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-base font-bold tracking-tight transition-all disabled:opacity-60";

const PRIMARY =
  "bg-gradient-to-r from-thl-orange to-amber-500 text-white shadow-lg shadow-thl-orange/30 hover:shadow-xl hover:shadow-thl-orange/40 hover:-translate-y-0.5 active:translate-y-0";

/** Join / leave control for the tournament. Discord sign-in gates it. */
export function RegisterButton({
  tournamentId,
  isAuthenticated,
  isRegistered,
  locked,
}: {
  tournamentId: string;
  isAuthenticated: boolean;
  isRegistered: boolean;
  /** Registration closed (teams already generated). */
  locked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <a
        href="/signin?redirect=/friday-nite-fights"
        className={cn(BASE, PRIMARY)}
      >
        <Swords className="size-5" /> Connect Discord to enter
      </a>
    );
  }

  if (locked && !isRegistered) {
    return (
      <span
        className={cn(
          BASE,
          "cursor-not-allowed border border-neutral-300 text-neutral-500 dark:border-neutral-700",
        )}
      >
        Registration closed
      </span>
    );
  }

  if (isRegistered && locked) {
    return (
      <span
        className={cn(
          BASE,
          "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        )}
      >
        <Check className="size-5" /> You&apos;re entered
      </span>
    );
  }

  const onClick = () => {
    startTransition(async () => {
      const res = isRegistered
        ? await leaveFnf(tournamentId)
        : await registerForFnf(tournamentId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          isRegistered ? "You're out — see you next week." : "You're in! 🎉",
        );
        router.refresh();
      }
    });
  };

  if (isRegistered) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={onClick}
        className={cn(
          BASE,
          "border border-neutral-300 text-neutral-700 hover:border-red-400/60 hover:bg-red-500/5 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-300",
        )}
      >
        {pending ? "…" : "Drop out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className={cn(BASE, PRIMARY)}
    >
      <Swords className="size-5" />
      {pending ? "Entering…" : "Enter Friday Nite Fights"}
    </button>
  );
}
