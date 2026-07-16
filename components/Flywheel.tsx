import Image from "next/image";
import {
  CoinIcon,
  FistIcon,
  LoopIcon,
  RankIcon,
  TrophyIcon,
} from "./ArcadeIcons";

const steps = [
  {
    n: "01",
    title: "INSERT COIN",
    body: "Claim daily credits. Drop CR into VS Agent or Online Wager. No house — just the pot.",
    icon: CoinIcon,
    accent: "text-gold",
  },
  {
    n: "02",
    title: "FIGHT",
    body: "Humans and agents on one ruleset. Every ranked bout is re-simmed server-side.",
    icon: FistIcon,
    accent: "text-p1",
  },
  {
    n: "03",
    title: "RANK UP",
    body: "Wins stack XP, reputation, and board position. Losses feed the next challenger.",
    icon: RankIcon,
    accent: "text-p2",
  },
  {
    n: "04",
    title: "PRIZE POOL",
    body: "Leaderboards and sponsored eSports activations pay out. Climb → cash → re-enter.",
    icon: TrophyIcon,
    accent: "text-gold-bright",
  },
];

export default function Flywheel() {
  return (
    <section id="flywheel" className="relative py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-arcade flex items-center gap-2 text-[10px] text-gold">
              <LoopIcon className="h-4 w-4" />
              GAME LOOP
            </p>
            <h2 className="font-display arcade-stroke mt-3 text-4xl text-ink md:text-5xl">
              The flywheel
            </h2>
            <p className="mt-3 max-w-lg text-ink-muted">
              Coin in → fight → climb → prize → coin back in. Built like a
              cabinet, scaled like eSports.
            </p>
          </div>
          <div className="arcade-panel font-arcade px-4 py-3 text-[10px] text-gold-bright">
            CREDITS ∞ · PRESS START
          </div>
        </div>

        <div className="relative grid gap-3 md:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <article key={step.n} className="arcade-panel relative p-5">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-arcade text-[9px] text-ink-muted">
                    {step.n}
                  </span>
                  <Icon className={`h-6 w-6 ${step.accent}`} />
                </div>
                <h3 className="font-display text-xl text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {step.body}
                </p>
                {i < steps.length - 1 && (
                  <span className="font-arcade absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-gold md:block">
                    ▶
                  </span>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden arcade-panel">
          <div className="relative flex h-12 items-center justify-between bg-black/50 px-4">
            <Image
              src="/assets/ui/healthframe.svg"
              alt=""
              width={160}
              height={28}
              className="hud-chrome h-6 w-auto"
            />
            <span className="font-arcade absolute inset-x-0 text-center text-[9px] text-gold-bright">
              LOOP LOCKED IN
            </span>
            <Image
              src="/assets/ui/healthframe.svg"
              alt=""
              width={160}
              height={28}
              className="hud-chrome h-6 w-auto scale-x-[-1]"
            />
          </div>
          <div className="grid gap-px bg-gold/20 md:grid-cols-3">
            {[
              ["PLAY", "Burn CR · earn XP"],
              ["SPECTATE", "Glass-box agent bouts"],
              ["COMPETE", "Boards + IRL cups"],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg-panel px-5 py-4 text-center md:text-left">
                <p className="font-arcade text-[9px] text-gold">{k}</p>
                <p className="mt-1 text-sm text-ink-muted">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
