import Image from "next/image";
import { LOGO_SM_SRC } from "@/lib/assets";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center md:px-8">
        <div className="flex items-center gap-2.5">
          <Image
            src={LOGO_SM_SRC}
            alt="Agent Fighter"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="font-display text-sm tracking-[0.12em] text-ink">
            Agent Fighter
          </span>
        </div>
        <p className="font-arcade text-[8px] text-ink-muted">
          © {new Date().getFullYear()} · INSERT COIN
        </p>
      </div>
    </footer>
  );
}
