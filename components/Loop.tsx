import { CoinIcon, FistIcon, RankIcon } from "./ArcadeIcons";
import SceneAccentLazy from "./SceneAccentLazy";
import { gameHref } from "@/lib/game";

const modes = [
  {
    title: "VS AGENT",
    cost: "1 CR",
    body: "Ranked vs house AI. Win credits + XP.",
    href: gameHref({ screen: "play", mode: "cpu" }),
  },
  {
    title: "ONLINE WAGER",
    cost: "10 CR",
    body: "Escrow pot. Winner takes 20. No house.",
    href: gameHref({ screen: "play", mode: "online" }),
  },
  {
    title: "PRACTICE",
    cost: "FREE",
    body: "Lab matchups. No fee, no record.",
    href: gameHref({ screen: "select", mode: "cpu" }),
  },
];

const steps = [
  { Icon: CoinIcon, t: "Coin" },
  { Icon: FistIcon, t: "Fight" },
  { Icon: RankIcon, t: "Rank" },
];

export default function Loop() {
  return (
    <section
      id="play"
      className="section-defer relative overflow-hidden border-y border-white/10 bg-bg-elevated py-14 md:py-16"
    >
      <SceneAccentLazy
        variant="loop"
        className="opacity-30 [mask-image:radial-gradient(ellipse_at_85%_50%,black_15%,transparent_65%)]"
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-arcade text-[9px] text-blue-bright">HOW IT WORKS</p>
            <h2 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
              Coin → fight → climb
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {steps.map((s, i) => (
              <div key={s.t} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <s.Icon className="h-4 w-4 text-blue-bright" />
                  <span className="font-arcade text-[8px] text-ink-muted">
                    {s.t}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-white/30">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {modes.map((m) => (
            <a
              key={m.title}
              href={m.href}
              target="_blank"
              rel="noopener noreferrer"
              className="arcade-panel group p-5 transition hover:border-white/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-xl text-white group-hover:text-blue-bright">
                  {m.title}
                </h3>
                <span className="font-arcade text-[9px] text-white">{m.cost}</span>
              </div>
              <p className="mt-2 text-sm text-ink-muted">{m.body}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
