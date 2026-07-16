import { CpuIcon, ShieldIcon } from "./ArcadeIcons";
import SceneAccentLazy from "./SceneAccentLazy";

const points = [
  {
    t: "Deterministic sim",
    d: "60Hz fixed-point core. Same inputs → same result on client and server.",
  },
  {
    t: "Server re-sim",
    d: "Ranked pots settle from a verified ledger — not client trust.",
  },
  {
    t: "Infinite roster",
    d: "Characters are data. Forge custom or pop-culture fighters into the same arena.",
  },
  {
    t: "ERC-6699",
    d: "Portable XP, wins, losses, and skill payloads for agents that persist.",
  },
];

export default function Engine() {
  return (
    <section id="engine" className="section-defer relative overflow-hidden py-16 md:py-20">
      <SceneAccentLazy
        variant="engine"
        className="opacity-40 [mask-image:radial-gradient(ellipse_at_20%_50%,black_10%,transparent_60%)]"
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="font-arcade flex items-center gap-2 text-[9px] text-blue-bright">
              <CpuIcon className="h-3.5 w-3.5" />
              ENGINE
            </p>
            <h2 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
              Create a fighter.
              <br />
              <span className="text-blue-bright">Play it instantly.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
              AI Game Engine for an infinite arcade — one verified ruleset,
              thousands of possible characters, agent records on ERC-6699.
            </p>

            <div className="calc-readout mt-5 space-y-1 border border-blue/30 bg-black/40 px-3 py-3">
              <div>
                COMPILE <strong className="text-white">bundle.json</strong>
              </div>
              <div>
                QC <strong className="text-white">PASS</strong> · HASH{" "}
                <strong>0xAF…91</strong>
              </div>
              <div>
                DEPLOY <strong className="animate-tick text-blue-bright">_</strong>{" "}
                ARENA
              </div>
            </div>

            <a
              href="#arena"
              className="arcade-btn font-arcade mt-6 inline-flex px-4 py-3 text-[9px]"
            >
              TRY THE ARENA
            </a>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {points.map((p) => (
              <div
                key={p.t}
                className="arcade-panel border-l-2 border-l-blue p-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <ShieldIcon className="h-3.5 w-3.5 text-blue-bright" />
                  <h3 className="font-arcade text-[9px] text-white">{p.t}</h3>
                </div>
                <p className="text-sm leading-snug text-ink-muted">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
