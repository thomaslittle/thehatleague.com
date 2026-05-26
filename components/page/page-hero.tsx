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
          className="object-cover opacity-10 dark:opacity-10"
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
      <div className="relative mx-auto max-w-[1320px] px-6 pt-12 pb-10 md:px-10 md:pt-20 md:pb-16">
        <div className="text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase md:text-xs md:tracking-[0.28em]">
          {eyebrow}
        </div>
        <h1 className="mt-3 max-w-3xl text-[2.25rem] leading-[1] font-bold tracking-[-0.03em] sm:text-5xl md:mt-4 md:text-6xl md:leading-[0.95] md:tracking-[-0.035em] lg:text-7xl">
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
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 md:mt-6 md:text-lg dark:text-neutral-400">
            {subtitle}
          </p>
        )}
        {actions && (
          <div className="mt-7 grid grid-cols-1 gap-3 [&>a]:w-full [&>button]:w-full [&>a]:justify-center [&>button]:justify-center sm:flex sm:flex-wrap sm:[&>a]:w-auto sm:[&>button]:w-auto md:mt-8">
            {actions}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
