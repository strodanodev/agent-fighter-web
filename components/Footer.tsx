import Image from "next/image";
import { LOGO_SM_SRC } from "@/lib/assets";
import { TEAM_PROFILES } from "@/lib/team";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10">
      {/* Copyright watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden
      >
        <span className="font-display rotate-[-12deg] text-[clamp(2.5rem,12vw,7rem)] tracking-[0.08em] text-white/[0.035]">
          © AFS 2026
        </span>
      </div>

      <div className="relative z-[1] mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <Image
                src={LOGO_SM_SRC}
                alt="Agent Fighter"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <div>
                <p className="font-display text-sm tracking-[0.12em] text-ink">
                  Agent Fighter
                </p>
                <p className="font-arcade mt-0.5 text-[7px] text-blue-bright">
                  AGENT FIGHTER STUDIOS · AFS
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-muted">
              All Rights Reserved by Agent Fighter Studios (AFS) 2026.
              Agent Fighter, the Agent Fighter logo, characters, stages, and
              related marks are trademarks of Agent Fighter Studios. Unauthorized
              reproduction, redistribution, or commercial use is prohibited.
            </p>
          </div>

          <div>
            <p className="font-arcade text-[8px] text-blue-bright">CREW</p>
            <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              {TEAM_PROFILES.map((p) => (
                <li key={p.id}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-baseline gap-1.5 text-sm text-ink transition hover:text-blue-bright"
                  >
                    <span className="font-display tracking-wide">{p.name}</span>
                    <span className="font-arcade text-[7px] text-ink-muted group-hover:text-blue-bright/80">
                      {p.handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-arcade text-[8px] leading-relaxed text-ink-muted">
            © 2026 AGENT FIGHTER STUDIOS (AFS) · ALL RIGHTS RESERVED
          </p>
          <p className="text-[11px] text-ink-muted/70">
            Demo / early access · features and economy subject to change.
          </p>
        </div>
      </div>
    </footer>
  );
}
