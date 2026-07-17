import { REFERRAL_CREDITS } from "@/lib/dare";
import { gameHref } from "@/lib/game";

/**
 * Homepage promo for referral dares: every signed-in player has a shareable
 * /dare/<code> page ("I DARE YOU TO BEAT ME") — both sides earn credits when
 * a friend accepts. The link itself is copied in-game (title screen, D).
 */
export default function DareCallout() {
  return (
    <section id="dare" className="section-defer relative overflow-hidden py-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_20%,rgba(255,61,110,0.14),transparent_60%)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-5 text-center md:px-8">
        <p className="font-arcade animate-coin-blink text-[10px] text-neon-red">
          ⚠ REFERRAL DARES
        </p>
        <h2 className="font-display mt-3 -skew-x-3 text-3xl text-white md:text-5xl">
          <span className="arcade-stroke">I dare you</span>{" "}
          <span className="dare-stroke-red text-neon-red">to beat me.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-sm text-ink-muted md:text-base">
          Every fighter gets a shareable dare page — your record, your main,
          and one red button your friends can&apos;t ignore. When someone
          accepts and signs up,{" "}
          <span className="font-semibold text-neon-yellow">
            you both get +{REFERRAL_CREDITS} credits
          </span>
          . Consider it their consolation prize.
        </p>
        <a
          href={gameHref({ screen: "title" })}
          className="dare-cta font-display mt-8 inline-flex rounded px-8 py-3.5 text-lg md:text-xl"
          target="_blank"
          rel="noreferrer"
        >
          GET MY DARE LINK
        </a>
        <p className="font-arcade mt-4 text-[8px] text-ink-muted md:text-[9px]">
          SIGN IN ON THE TITLE SCREEN · PRESS D — DARE A FRIEND · LINK COPIED
        </p>
      </div>
    </section>
  );
}
