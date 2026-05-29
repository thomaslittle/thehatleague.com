import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  accent?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  accent,
  subtitle,
  actions,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(247,97,3,0.28), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1320px] px-6 pt-16 pb-12 md:px-10 md:pt-24 md:pb-16">
        <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-5xl leading-[0.95] font-bold tracking-[-0.045em] text-neutral-900 sm:text-6xl md:text-7xl dark:text-white">
          {title}
          {accent && (
            <>
              {" "}
              <span className="font-marker font-normal text-thl-orange">
                {accent}
              </span>
            </>
          )}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-lg text-neutral-600 md:text-xl dark:text-neutral-400">
            {subtitle}
          </p>
        )}
        {actions && (
          <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </section>
  );
}
