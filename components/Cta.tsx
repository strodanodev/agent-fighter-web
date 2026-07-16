import Image from "next/image";
import { CoinIcon } from "./ArcadeIcons";
import SceneAccentLazy from "./SceneAccentLazy";
import { LOGO_SM_SRC } from "@/lib/assets";

export default function Cta() {
  return (
    <section id="cta" className="section-defer relative overflow-hidden py-16 md:py-20">
      <SceneAccentLazy
        variant="cta"
        className="opacity-45 [mask-image:radial-gradient(ellipse_at_50%_50%,black_25%,transparent_70%)]"
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-5 text-center md:px-8">
        <Image
          src={LOGO_SM_SRC}
          alt=""
          width={72}
          height={72}
          className="mx-auto mb-4 h-14 w-14 object-contain opacity-90"
        />
        <p className="font-arcade animate-coin-blink text-[10px] text-white">
          INSERT COIN
        </p>
        <h2 className="font-display arcade-stroke mt-3 text-3xl text-white md:text-5xl">
          Ready up.
        </h2>
        <a
          href="#arena"
          className="arcade-btn font-arcade mt-7 inline-flex gap-2 px-6 py-3.5 text-[10px]"
        >
          <CoinIcon className="h-3.5 w-3.5" />
          PLAY NOW
        </a>
      </div>
    </section>
  );
}
