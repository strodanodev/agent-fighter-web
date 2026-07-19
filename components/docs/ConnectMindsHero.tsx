import Image from "next/image";
import {
  CONNECT_URL,
  GAME_URL,
  MINDS_LOGO_SVG,
  MINDS_URL,
  SKILL_BAZAAR_URL,
} from "@/lib/game";

const STEPS = [
  {
    n: "01",
    t: "Sign in once",
    d: "Play Agent Fighter with AIR — that creates your account.",
    href: GAME_URL,
    cta: "Open game",
  },
  {
    n: "02",
    t: "Mint your agent key",
    d: "Open /connect, sign in, copy the afk_… key (shown once).",
    href: CONNECT_URL,
    cta: "Mint key",
  },
  {
    n: "03",
    t: "Create a Mind",
    d: "On Minds, create a Mind and link Telegram — that’s your chat coach.",
    href: MINDS_URL,
    cta: "Open Minds",
  },
  {
    n: "04",
    t: "Connect Agent Fighter",
    d: "My Connections → Agent Fighter → paste your key.",
    href: MINDS_URL,
    cta: null,
  },
  {
    n: "05",
    t: "Enable Coach & train",
    d: "Equip Agent Fighter Coach from Skill Bazaar, then chat: “set up my agent — aggressive rushdown”.",
    href: SKILL_BAZAAR_URL,
    cta: "Skill Bazaar",
  },
] as const;

export default function ConnectMindsHero() {
  return (
    <section
      id="connect-minds"
      aria-labelledby="connect-minds-title"
      className="relative overflow-hidden rounded-sm border border-blue/40 bg-[#070f1c]"
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(57,79,149,0.45), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(47,143,255,0.18), transparent 50%), linear-gradient(180deg, rgba(47,143,255,0.06), transparent 40%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-bright/70 to-transparent"
        aria-hidden
      />

      <div className="relative z-[1] p-6 md:p-8 lg:p-10">
        {/* Brand lockup */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-arcade text-[8px] tracking-[0.2em] text-blue-bright">
              START HERE
            </p>
            <Image
              src={MINDS_LOGO_SVG}
              alt="Built on Minds by Animoca Brands"
              width={320}
              height={132}
              className="mt-4 h-auto w-[min(100%,280px)] text-white md:w-[320px]"
              priority
              unoptimized
            />
            <h1
              id="connect-minds-title"
              className="font-display arcade-stroke mt-5 text-2xl text-white md:text-3xl"
            >
              Connect Minds
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted md:text-[15px]">
              Coach your fighter by chatting with a Mind. Paste one key — your
              agent’s style updates from Telegram.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
            <a
              href={MINDS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="arcade-btn font-arcade px-5 py-3 text-[9px]"
            >
              OPEN MINDS
            </a>
            <a
              href={CONNECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-arcade inline-flex items-center justify-center border border-white/30 bg-black/40 px-5 py-3 text-[9px] text-white transition hover:border-blue-bright hover:text-blue-bright"
            >
              MINT KEY
            </a>
          </div>
        </div>

        {/* Steps */}
        <ol className="mt-8 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="group flex flex-col border border-white/10 bg-black/35 p-4 transition hover:border-blue/50 hover:bg-black/50"
            >
              <span className="font-arcade text-[8px] text-blue-bright">
                {step.n}
              </span>
              <h2 className="font-display mt-2 text-base leading-tight text-white">
                {step.t}
              </h2>
              <p className="mt-1.5 flex-1 text-[12px] leading-snug text-ink-muted">
                {step.d}
              </p>
              {step.cta && (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-arcade mt-3 inline-flex text-[7px] text-blue-bright transition group-hover:text-white"
                >
                  {step.cta} →
                </a>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-5 text-[12px] text-ink-muted/80">
          Once a style is saved, press{" "}
          <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-white">
            V
          </kbd>{" "}
          in solo/arcade for AUTO — your coached agent takes the pad.
        </p>
      </div>
    </section>
  );
}
