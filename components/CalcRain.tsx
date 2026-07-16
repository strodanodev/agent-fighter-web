"use client";

import { useMemo } from "react";
import { usePerfProfile } from "@/lib/perf";

function block(seed: number): string {
  const hex = "0123456789ABCDEF";
  let out = "";
  let n = seed;
  for (let i = 0; i < 48; i++) {
    n = (n * 1103515245 + 12345 + i * 17) >>> 0;
    out += hex[n % 16];
    if (i % 8 === 7) out += "\n";
  }
  return out + out;
}

const COLS = [
  { left: "4%", dur: "16s", delay: "0s", seed: 11 },
  { left: "14%", dur: "21s", delay: "-4s", seed: 29 },
  { left: "26%", dur: "13s", delay: "-2s", seed: 47 },
  { left: "38%", dur: "19s", delay: "-7s", seed: 63 },
  { left: "52%", dur: "15s", delay: "-1s", seed: 81 },
  { left: "64%", dur: "22s", delay: "-9s", seed: 97 },
  { left: "76%", dur: "14s", delay: "-3s", seed: 113 },
  { left: "88%", dur: "18s", delay: "-6s", seed: 131 },
];

/** Background hex rain — calculation / verify aesthetic. */
export default function CalcRain() {
  const { mobile, reducedMotion, saveData } = usePerfProfile();
  const cols = useMemo(() => {
    if (reducedMotion || saveData) return [];
    return mobile ? COLS.filter((_, i) => i % 2 === 0) : COLS;
  }, [mobile, reducedMotion, saveData]);
  const texts = useMemo(() => cols.map((c) => block(c.seed)), [cols]);

  if (!cols.length) return null;

  return (
    <div className="calc-rain" aria-hidden>
      {cols.map((c, i) => (
        <div
          key={c.left}
          className="calc-col animate-calc-scroll"
          style={{
            left: c.left,
            animationDuration: c.dur,
            animationDelay: c.delay,
            color: i % 2 === 0 ? "#2f8fff" : "rgba(255,255,255,0.45)",
          }}
        >
          {texts[i]}
        </div>
      ))}
    </div>
  );
}
