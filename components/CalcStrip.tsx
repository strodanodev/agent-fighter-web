"use client";

import { useEffect, useState } from "react";

function Digits({ value, pad = 6 }: { value: number; pad?: number }) {
  const s = String(value).padStart(pad, "0");
  return (
    <span className="inline-flex gap-[1px] text-white tabular-nums">
      {s.split("").map((d, i) => (
        <span key={`${i}-${d}`} className="digit-window w-[0.65em] text-center">
          <span
            className="digit-stack"
            style={{ animationDelay: `${(i % 5) * 0.12}s` }}
          >
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
            <span>0</span>
          </span>
        </span>
      ))}
    </span>
  );
}

const HASH =
  "af3c91e0  ·  state.hash=0x7B2A…F91  ·  re-sim OK  ·  ledgerΔ=+1  ·  tick=60  ·  xp=004820  ·  erc6699.verify=PASS  ·  ";

export default function CalcStrip() {
  const [tick, setTick] = useState(4820);
  const [fps] = useState(60);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % 1000000);
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative z-[2] border-y border-blue/40 bg-[#040c18]/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-8">
        <div className="calc-readout flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            TICK <strong>{fps}</strong>
            <span className="animate-tick">_</span>
          </span>
          <span>
            HASH <Digits value={tick} />
          </span>
          <span className="hidden sm:inline">
            VERIFY <strong className="text-white">PASS</strong>
          </span>
          <span className="hidden md:inline">
            FRAME <Digits value={(tick * 7) % 10000} pad={4} />
          </span>
        </div>
        <div className="calc-readout hidden text-blue-bright lg:block">
          ERC-6699 · RE-SIM ACTIVE
        </div>
      </div>
      <div className="hash-tape">
        <div className="hash-tape-inner">
          <span>{HASH}</span>
          <span>{HASH}</span>
        </div>
      </div>
    </div>
  );
}
