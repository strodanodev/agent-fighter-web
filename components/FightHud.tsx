import Image from "next/image";

export default function FightHud() {
  return (
    <div aria-hidden className="border-y border-white/15 bg-black/70 py-2.5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 md:gap-5 md:px-8">
        <span className="font-arcade hidden shrink-0 text-[8px] text-white sm:inline">
          P1
        </span>
        <div className="hud-bar-track min-w-0 flex-1">
          <div className="hud-bar-fill-hp" style={{ width: "78%" }} />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 px-1">
          <Image
            src="/assets/ui/pip_on.svg"
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5"
          />
          <Image
            src="/assets/ui/timer.svg"
            alt=""
            width={28}
            height={28}
            className="hud-chrome h-7 w-7"
          />
          <Image
            src="/assets/ui/pip_on.svg"
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5"
          />
        </div>

        <div className="hud-bar-track min-w-0 flex-1">
          <div className="hud-bar-fill-hp danger ml-auto" style={{ width: "54%" }} />
        </div>
        <span className="font-arcade hidden shrink-0 text-[8px] text-blue-bright sm:inline">
          P2
        </span>

        <div className="hud-bar-track hidden w-28 shrink-0 sm:block">
          <div className="hud-bar-fill-meter" style={{ width: "62%" }} />
        </div>
      </div>
    </div>
  );
}
