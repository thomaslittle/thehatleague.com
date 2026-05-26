import { PageShell } from "./page-shell";
import { cn } from "@/lib/cn";

export async function PageSkeleton({
  eyebrow,
  variant = "hero",
}: {
  eyebrow: string;
  variant?: "hero" | "list" | "form";
}) {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-[1320px] px-6 pt-14 pb-12 md:px-10 md:pt-20 md:pb-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            {eyebrow}
          </div>
          <div className="mt-5 grid gap-3">
            <Shimmer className="h-12 w-2/3 md:h-16" />
            <Shimmer className="h-12 w-1/2 md:h-16" />
          </div>
          <div className="mt-7 grid max-w-2xl gap-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-11/12" />
            <Shimmer className="h-4 w-3/4" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        {variant === "list" ? (
          <ul
            className={cn(
              "grid gap-3 md:grid-cols-2 lg:grid-cols-3",
              "[counter-reset:thl-skeleton]",
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex items-start gap-3">
                  <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
                  <div className="grid flex-1 gap-2">
                    <Shimmer className="h-4 w-2/3" />
                    <Shimmer className="h-3 w-1/3" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Shimmer className="h-12 rounded-xl" />
                  <Shimmer className="h-12 rounded-xl" />
                  <Shimmer className="h-12 rounded-xl" />
                </div>
              </li>
            ))}
          </ul>
        ) : variant === "form" ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="grid gap-5">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-12 w-full rounded-xl" />
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-12 w-full rounded-xl" />
              <Shimmer className="h-12 w-44 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Shimmer className="h-64 rounded-3xl" />
            <Shimmer className="h-64 rounded-3xl" />
          </div>
        )}
      </section>
    </PageShell>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200/70 dark:bg-neutral-800/70",
        className,
      )}
    />
  );
}
