import { CoinIcon, JoystickIcon } from "./ArcadeIcons";
import LazyIframe from "./LazyIframe";
import SceneAccentLazy from "./SceneAccentLazy";
import { GAME_URL, gameHref } from "@/lib/game";

/** Live 960×540 game client embedded from the Vercel deploy. */
export default function GameFrame() {
  const embedSrc = gameHref({ screen: "title" });

  return (
    <section
      id="arena"
      className="section-defer relative border-y border-white/15 bg-[#020810] py-12 md:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(47,143,255,0.14),_transparent_55%)]" />
      <SceneAccentLazy
        variant="arena"
        className="opacity-40 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-arcade text-[9px] text-blue-bright">LIVE CLIENT</p>
            <h2 className="font-display arcade-stroke mt-1 text-2xl text-white md:text-3xl">
              Play in the frame
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              The real Agent Fighter client — same build as{" "}
              <span className="text-white">agent-fighter.vercel.app</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={gameHref({ screen: "play", mode: "cpu" })}
              target="_blank"
              rel="noopener noreferrer"
              className="arcade-btn font-arcade inline-flex gap-2 px-3 py-2 text-[8px]"
            >
              <CoinIcon className="h-3 w-3" />
              FULLSCREEN
            </a>
            <a
              href={gameHref({ screen: "select", mode: "cpu" })}
              target="_blank"
              rel="noopener noreferrer"
              className="font-arcade inline-flex items-center gap-2 border border-white/40 bg-black/50 px-3 py-2 text-[8px] text-white transition hover:border-blue-bright hover:text-blue-bright"
            >
              <JoystickIcon className="h-3 w-3 text-blue-bright" />
              SELECT
            </a>
          </div>
        </div>

        <div className="arcade-panel overflow-hidden border-2 border-blue/50 p-1.5 shadow-[0_0_48px_rgba(47,143,255,0.2)] md:p-2">
          <div className="mb-1.5 flex items-center justify-between gap-2 px-1 md:mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-bright" />
              <span className="font-arcade text-[7px] text-ink-muted md:text-[8px]">
                CABINET ONLINE
              </span>
            </div>
            <span className="font-arcade truncate text-[7px] text-white/50 md:text-[8px]">
              {GAME_URL.replace(/^https?:\/\//, "")}
            </span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden border border-white/20 bg-black">
            <LazyIframe
              src={embedSrc}
              title="Agent Fighter — playable game"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          <p className="font-arcade mt-2 px-1 text-[7px] text-ink-muted md:text-[8px]">
            Click the frame · keyboard or on-screen controls · ESC for menus
          </p>
        </div>
      </div>
    </section>
  );
}
