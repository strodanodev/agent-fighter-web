"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * The interactive rage-bait shell: escalating taunts up top, the ticking
 * expiry + "chicken out" non-exit below, with the server-rendered VS tape
 * and ACCEPT DARE anchor passed through as children. Everything here is
 * theater — the countdown resets at UTC midnight and never kills the link,
 * and chickening out only shakes the page.
 */
export default function DareTaunts({
  name,
  initialTaunt,
  children,
}: {
  name: string;
  initialTaunt: string;
  children: ReactNode;
}) {
  const [taunt, setTaunt] = useState(initialTaunt);
  const [clicks, setClicks] = useState(0);
  const [clock, setClock] = useState("--:--:--");
  const [shaking, setShaking] = useState(false);

  const upper = name.toUpperCase();
  const taunts = [
    `Interesting choice. ${upper} figured you'd click that.`,
    "Clicking it twice doesn't make it less embarrassing.",
    `${upper} has been notified. Twice.`,
    "The button is right there. It's red. You can't miss it.",
  ];

  useEffect(() => {
    const tick = () => {
      // "Dare of the day": counts down to the next UTC midnight. Expiry only
      // ever changes the framing — the link works forever by design.
      const now = new Date();
      const midnight = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      );
      let s = Math.max(0, Math.floor((midnight - now.getTime()) / 1000));
      const hh = String(Math.floor(s / 3600)).padStart(2, "0");
      s %= 3600;
      setClock(`${hh}:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const chicken = () => {
    setTaunt(taunts[Math.min(clicks, taunts.length - 1)]);
    setClicks((c) => c + 1);
  };

  return (
    <div
      className={`flex w-full flex-col items-center ${shaking ? "dare-shake" : ""}`}
      onAnimationEnd={() => setShaking(false)}
    >
      <p
        className="mx-auto mb-6 max-w-[60ch] text-center text-sm text-ink-muted md:text-base"
        aria-live="polite"
      >
        {taunt}
      </p>

      {children}

      <div className="font-arcade mt-6 flex items-center gap-2 rounded border border-neon-red/50 bg-[rgba(28,4,16,0.55)] px-4 py-2 text-[10px] text-white md:mt-8 md:text-xs">
        DARE EXPIRES{" "}
        <span className="text-neon-red tabular-nums">{clock}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          chicken();
          setShaking(false);
          requestAnimationFrame(() => setShaking(true));
        }}
        className="mt-3 cursor-pointer border-none bg-transparent text-xs text-ink-muted/60 underline decoration-dotted underline-offset-4 hover:text-ink-muted"
      >
        chicken out →
      </button>
    </div>
  );
}
