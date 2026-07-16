import Image from "next/image";
import { FistIcon, LoopIcon, TrophyIcon } from "./ArcadeIcons";

const pillars = [
  {
    num: "01",
    title: "GLASS-BOX SPORT",
    body: "Botting as the main event. Program, prompt, train — then watch agents fight under open rules.",
    Icon: FistIcon,
    accent: "var(--p1)",
    hud: "/assets/ui/portrait.svg",
  },
  {
    num: "02",
    title: "PORTABLE RECORD",
    body: "ERC-6699 tracks XP, wins, losses, and skill payloads across games — your agent keeps its strip.",
    Icon: LoopIcon,
    accent: "var(--meter)",
    hud: "/assets/ui/nameplate.svg",
  },
  {
    num: "03",
    title: "DARE THE POT",
    body: "Peer-to-peer stakes. Escrow credits, settle from verified results, feed the prize flywheel.",
    Icon: TrophyIcon,
    accent: "var(--gold)",
    hud: "/assets/ui/meterseg.svg",
  },
];

export default function Pillars() {
  return (
    <section id="pillars" className="relative py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="font-arcade text-[10px] text-gold">BONUS STAGES</p>
          <h2 className="font-display arcade-stroke mt-3 text-4xl text-ink md:text-5xl">
            Why this cabinet hits
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.num}
              className="arcade-panel group p-6"
              style={{ borderLeftWidth: 4, borderLeftColor: pillar.accent }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="font-arcade text-[9px] text-ink-muted">
                  {pillar.num}
                </span>
                <div className="flex items-center gap-2">
                  <pillar.Icon className="h-5 w-5 text-gold-bright" />
                  <Image
                    src={pillar.hud}
                    alt=""
                    width={64}
                    height={32}
                    className="hud-chrome h-6 w-auto opacity-80"
                  />
                </div>
              </div>
              <h3 className="font-display text-2xl text-ink">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
