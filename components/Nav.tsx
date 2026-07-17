"use client";

import Image from "next/image";
import { CoinIcon } from "./ArcadeIcons";
import { LOGO_SM_SRC } from "@/lib/assets";

const links = [
  { href: "#arena", label: "Play" },
  { href: "#fighters", label: "Fighters" },
  { href: "#play", label: "Modes" },
  { href: "#engine", label: "Engine" },
  { href: "#boards", label: "Boards" },
  { href: "#team", label: "Team" },
  { href: "#investors", label: "Investors" },
];

export default function Nav() {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-white/10 bg-[#050a14]/95 md:bg-[#050a14]/88 md:backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <Image
            src={LOGO_SM_SRC}
            alt="Agent Fighter"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="font-display text-base tracking-[0.12em] text-white">
            Agent Fighter
          </span>
        </a>

        <div className="font-arcade hidden items-center gap-2 text-[8px] text-white sm:flex">
          <CoinIcon className="h-3 w-3 text-blue-bright" />
          <span className="animate-credit-pulse">CREDITS ∞</span>
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-arcade text-[8px] text-ink-muted transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#arena"
            className="arcade-btn font-arcade px-3 py-1.5 text-[8px]"
          >
            PLAY
          </a>
        </nav>
      </div>
    </header>
  );
}
