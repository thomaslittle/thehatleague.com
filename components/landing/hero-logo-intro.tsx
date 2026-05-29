"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * The hero card's logo slot. A white 16:9 panel that plays the one-shot
 * intro clip (a coin-flip sting on a white background) in full — its aspect
 * matches the clip so nothing is cropped and the clip's white bg blends into
 * the panel — then fades out to reveal the static THL logo on the same panel.
 *
 * The logo is always the base layer, so if the clip can't autoplay, errors,
 * or its fade-in is frozen (e.g. a backgrounded tab), the logo is what shows.
 *
 * No effects (per the PRD): lifecycle runs off the <video> events
 * (ended / error / canplay) + the wrapper's transitionend; the fade-IN is a
 * pure CSS mount animation so a load-event race can't skip it.
 */
export function HeroLogoIntro() {
  const [phase, setPhase] = useState<"playing" | "fading" | "gone">("playing");
  const finish = () => setPhase((p) => (p === "playing" ? "fading" : p));

  return (
    <div className="relative aspect-video w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]">
      {/* Static logo — resting state, centered on the white panel. */}
      <Image
        src="/brand/thl-logo.png"
        alt="The Hat League"
        fill
        priority
        sizes="(min-width: 1024px) 440px, (min-width: 640px) 45vw, 90vw"
        className="object-contain p-6"
      />

      {/* One-shot intro clip; aspect matches the panel so it fills with no
          crop, then fades out + unmounts to reveal the logo. */}
      {phase !== "gone" && (
        <div
          aria-hidden
          onTransitionEnd={() => {
            if (phase === "fading") setPhase("gone");
          }}
          className={`thl-hero-intro-in absolute inset-0 transition-opacity duration-700 ease-out ${
            phase === "playing" ? "opacity-100" : "opacity-0"
          }`}
        >
          <video
            className="h-full w-full object-cover"
            src="/brand/videos/draft_pick.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={finish}
            onError={finish}
            onCanPlay={(e) => {
              void e.currentTarget.play().catch(finish);
            }}
          />
        </div>
      )}
    </div>
  );
}
