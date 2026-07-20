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
      {/* CSS bloom + hex cages — atmosphere even without WebGL */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="animate-glow absolute -right-8 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-blue/25 blur-3xl" />
        <div className="absolute right-[12%] top-[28%] h-48 w-48 rounded-full bg-neon-yellow/15 blur-2xl" />
        <div className="absolute right-[22%] bottom-[18%] h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <svg
          className="absolute right-[4%] top-1/2 hidden h-[340px] w-[340px] -translate-y-1/2 opacity-50 md:block"
          viewBox="0 0 200 200"
          fill="none"
        >
          <polygon
            points="100,12 178,56 178,144 100,188 22,144 22,56"
            stroke="rgba(47,143,255,0.55)"
            strokeWidth="1.2"
            className="animate-tick"
          />
          <polygon
            points="100,28 164,64 164,136 100,172 36,136 36,64"
            stroke="rgba(217,164,65,0.45)"
            strokeWidth="1"
          />
          <polygon
            points="100,48 146,74 146,126 100,152 54,126 54,74"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.8"
          />
          <circle
            cx="100"
            cy="100"
            r="22"
            stroke="rgba(110,182,255,0.35)"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            className="animate-credit-pulse"
          />
        </svg>
      </div>

      <div className="relative z-[1] mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-8 grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_260px] md:gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="font-arcade text-[9px] text-blue-bright">HOW IT WORKS</p>
            <h2 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
              Coin → fight → climb
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
            <p className="mt-3 max-w-md font-arcade text-[7px] leading-relaxed text-white/45">
              $DARE IN → CREDITS OUT · WIN THE POT · CLIMB THE BOARD
            </p>
          </div>

          {/* Hero token stage — WebGL coin inside a finished hex/diamond cage */}
          <div className="relative mx-auto h-44 w-44 md:mx-0 md:h-52 md:w-full">
            <div className="absolute inset-0 rounded-full bg-blue/30 blur-2xl" />
            <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(217,164,65,0.18),transparent_62%)]" />

            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 200 200"
              fill="none"
              aria-hidden
            >
              <defs>
                <filter
                  id="token-cage-glow"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                >
                  <feGaussianBlur stdDeviation="2.2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer hex */}
              <polygon
                points="100,14 174,56 174,144 100,186 26,144 26,56"
                stroke="rgba(47,143,255,0.75)"
                strokeWidth="1.6"
                filter="url(#token-cage-glow)"
              />
              {/* Inner hex track */}
              <polygon
                points="100,28 160,64 160,136 100,172 40,136 40,64"
                stroke="rgba(110,182,255,0.35)"
                strokeWidth="1"
                strokeDasharray="5 7"
                className="animate-credit-pulse"
              />

              {/* Diamond cage with corner brackets (not a lone rotated box) */}
              <g
                stroke="rgba(255,229,102,0.85)"
                strokeWidth="1.8"
                strokeLinecap="square"
                filter="url(#token-cage-glow)"
              >
                <path d="M100 42 L158 100 L100 158 L42 100 Z" />
                {/* Corner ticks */}
                <path d="M100 42 L100 54" />
                <path d="M158 100 L146 100" />
                <path d="M100 158 L100 146" />
                <path d="M42 100 L54 100" />
                {/* Vertex caps */}
                <path d="M92 50 L100 42 L108 50" />
                <path d="M150 92 L158 100 L150 108" />
                <path d="M92 150 L100 158 L108 150" />
                <path d="M50 92 L42 100 L50 108" />
              </g>

              {/* Core ring */}
              <circle
                cx="100"
                cy="100"
                r="38"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1"
              />
              <circle
                cx="100"
                cy="100"
                r="46"
                stroke="rgba(47,143,255,0.4)"
                strokeWidth="1.2"
                strokeDasharray="2 6"
                className="animate-tick"
              />

              {/* Cardinal pips */}
              {[
                [100, 20],
                [180, 100],
                [100, 180],
                [20, 100],
              ].map(([x, y]) => (
                <circle
                  key={`${x}-${y}`}
                  cx={x}
                  cy={y}
                  r="2.2"
                  fill="rgba(255,229,102,0.9)"
                />
              ))}
            </svg>

            <SceneAccentLazy
              variant="loop"
              className="opacity-100 [mask-image:radial-gradient(circle_at_50%_48%,black_52%,transparent_82%)]"
            />
            <p className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 font-arcade text-[7px] tracking-[0.22em] text-neon-yellow/85 drop-shadow-[0_0_10px_rgba(255,229,102,0.55)]">
              $TOKEN
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {modes.map((m) => (
            <a
              key={m.title}
              href={m.href}
              target="_blank"
              rel="noopener noreferrer"
              className="arcade-panel group p-5 transition hover:border-white/50 hover:shadow-[0_0_28px_rgba(47,143,255,0.18)]"
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
