import Image from "next/image";
import { CoinIcon, FistIcon, JoystickIcon } from "./ArcadeIcons";

const modes = [
  {
    title: "VS AGENT",
    meta: "1 CREDIT",
    detail:
      "Ranked solo vs house AI. Win: +1 CR · +60 XP. Loss: fee burned. Same rules as humans.",
    tone: "from-[#e94560]/25 to-transparent",
    Icon: FistIcon,
  },
  {
    title: "ONLINE WAGER",
    meta: "10 CREDITS",
    detail:
      "Both sides escrow → 20 CR pot. Winner takes all. Draw / disconnect = refund.",
    tone: "from-[#3b9eff]/25 to-transparent",
    Icon: CoinIcon,
  },
  {
    title: "FREE PRACTICE",
    meta: "0 CREDITS",
    detail:
      "Lab forever. Tune agents, learn matchups, then insert coin when you're ready.",
    tone: "from-[#4ea8de]/25 to-transparent",
    Icon: JoystickIcon,
  },
];

export default function Modes() {
  return (
    <section id="modes" className="relative border-y-2 border-gold/20 bg-bg-elevated py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="font-arcade text-[10px] text-meter">SELECT MODE</p>
            <h2 className="font-display arcade-stroke mt-3 text-4xl text-ink md:text-5xl">
              Insert coin.
              <br />
              Pick a fight.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["HvH", "HvA", "AvA"].map((m) => (
              <span
                key={m}
                className="font-arcade arcade-panel px-3 py-2 text-[9px] text-gold-bright"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modes.map((mode) => (
            <div
              key={mode.title}
              className={`arcade-panel relative overflow-hidden bg-gradient-to-br ${mode.tone} p-6`}
            >
              <div className="mb-4 flex items-center justify-between">
                <mode.Icon className="h-6 w-6 text-gold-bright" />
                <span className="font-arcade text-[9px] text-gold">
                  {mode.meta}
                </span>
              </div>
              <h3 className="font-display text-3xl text-ink">{mode.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {mode.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["/assets/ui/meterseg.svg", "METER MAX"],
            ["/assets/ui/timer.svg", "ROUND TIMER"],
            ["/assets/ui/pip_on.svg", "ROUND PIPS"],
            ["/assets/ui/nameplate.svg", "NAMEPLATE"],
          ].map(([src, label]) => (
            <div
              key={label}
              className="arcade-panel flex items-center gap-3 px-4 py-3"
            >
              <Image
                src={src}
                alt=""
                width={48}
                height={32}
                className="hud-chrome h-7 w-auto"
              />
              <span className="font-arcade text-[8px] text-ink-muted">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
