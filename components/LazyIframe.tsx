"use client";

import { useRef } from "react";
import { useInView } from "@/lib/perf";

/** Mount iframe src only when the frame is near the viewport. */
export default function LazyIframe({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const ready = useInView(host, { rootMargin: "240px", once: true });

  return (
    <div ref={host} className="absolute inset-0">
      {ready ? (
        <iframe
          src={src}
          title={title}
          className={className}
          loading="lazy"
          allow="fullscreen; gamepad; autoplay; clipboard-write"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <p className="font-arcade text-[8px] text-ink-muted">LOADING CABINET…</p>
        </div>
      )}
    </div>
  );
}
