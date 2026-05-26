import type { ReactNode } from "react";
import Image from "next/image";

export function PageHero({
  eyebrow,
  title,
  accent,
  subtitle,
  actions,
  children,
}: {
  eyebrow: string;
  /** Plain text portion of the headline. */
  title: ReactNode;
  /** Marker-font accent rendered after the title. */
  accent?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Image
          src="/brand/thl-fennec.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-5 dark:opacity-5"
          style={{ objectPosition: "55% 35%" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white dark:to-black" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(247,97,3,0.20), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-[1320px] px-6 pt-14 pb-12 md:px-10 md:pt-20 md:pb-16">
        <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
          {eyebrow}
        </div>
        <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] font-bold tracking-[-0.035em] md:text-6xl lg:text-7xl">
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
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        {children}
      </div>
    </section>
  );
}
