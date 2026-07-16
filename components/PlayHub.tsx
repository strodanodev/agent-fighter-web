import Image from "next/image";
import { FistIcon, JoystickIcon, RankIcon } from "./ArcadeIcons";
import { gameHref } from "@/lib/game";

const entries = [
  {
    href: gameHref({ screen: "select", mode: "cpu" }),
    title: "SELECT CHARACTER",
    sub: "Open the real fighter select grid",
    Icon: JoystickIcon,
    accent: "text-meter",
    hud: "/assets/ui/portrait.svg",
  },
  {
    href: gameHref({ screen: "play", mode: "cpu" }),
    title: "PLAY NOW",
    sub: "VS Agent · insert coin · fight",
    Icon: FistIcon,
    accent: "text-p1",
    hud: "/assets/ui/timer.svg",
    primary: true,
  },
  {
    href: gameHref({ screen: "ranks" }),
    title: "LEADERBOARDS",
    sub: "Live in-game standings · ALL / HUMANS / AGENTS",
    Icon: RankIcon,
    accent: "text-gold-bright",
    hud: "/assets/ui/nameplate.svg",
  },
];

export default function PlayHub() {
  return (
    <section id="play" className="relative border-y-2 border-gold/30 bg-[#020810] py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-arcade text-[9px] text-meter">IN-GAME</p>
            <h2 className="font-display arcade-stroke mt-1 text-2xl text-ink md:text-3xl">
              Jump into the cabinet
            </h2>
          </div>
          <p className="font-arcade text-[8px] text-ink-muted">
            OPENS THE REAL CLIENT · NOT A MOCK
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {entries.map((e, i) => (
            <a
              key={e.title}
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`arcade-panel group relative flex flex-col justify-between p-5 transition hover:shadow-[0_0_32px_rgba(255,229,102,0.25)] ${
                e.primary ? "bg-gradient-to-br from-[#ffe566]/15 via-[#3b9eff]/20 to-transparent" : ""
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <e.Icon className={`h-7 w-7 ${e.accent}`} />
                <Image
                  src={e.hud}
                  alt=""
                  width={48}
                  height={32}
                  className="hud-chrome h-7 w-auto opacity-80"
                />
              </div>
              <div>
                <h3 className="font-display text-xl tracking-wider text-ink group-hover:text-yellow md:text-2xl">
                  {e.title}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{e.sub}</p>
              </div>
              <div className="mt-4">
                <div className="hud-bar-track h-2 border-yellow/40">
                  <div
                    className={
                      i === 0
                        ? "hud-bar-fill-meter"
                        : i === 1
                          ? "hud-bar-fill-super"
                          : "hud-bar-fill-hp"
                    }
                    style={{ width: i === 1 ? "100%" : `${55 + i * 18}%` }}
                  />
                </div>
                <span className="font-arcade mt-2 block text-[8px] text-yellow">
                  ENTER →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
