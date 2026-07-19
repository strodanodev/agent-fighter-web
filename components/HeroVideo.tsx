"use client";

import { useEffect, useRef } from "react";
import { HERO_VIDEO_SRC, LOGO_SRC } from "@/lib/assets";
import { useInView, usePerfProfile } from "@/lib/perf";

/** Lazy, desktop-only hero loop — skips on mobile / save-data / reduced motion. */
export default function HeroVideo() {
  const host = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useInView(host, { rootMargin: "200px", once: true });
  const { mobile, saveData, reducedMotion } = usePerfProfile();
  const allow = visible && !mobile && !saveData && !reducedMotion;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (allow) {
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [allow]);

  if (mobile || saveData || reducedMotion) {
    return (
      <div
        ref={host}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(47,143,255,0.22),transparent_55%)]"
        aria-hidden
      />
    );
  }

  return (
    <div ref={host} className="pointer-events-none absolute inset-0" aria-hidden>
      {allow && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-28"
          muted
          loop
          playsInline
          preload="metadata"
          poster={LOGO_SRC}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
