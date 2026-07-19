"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CoinIcon } from "./ArcadeIcons";
import { LOGO_SM_SRC } from "@/lib/assets";

const homeSections = [
  { id: "arena", label: "Play" },
  { id: "fighters", label: "Fighters" },
  { id: "play", label: "Modes" },
  { id: "engine", label: "Engine" },
  { id: "boards", label: "Boards" },
  { id: "team", label: "Team" },
  { id: "investors", label: "Investors" },
];

export default function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-white/10 bg-[#050a14]/95 md:bg-[#050a14]/88 md:backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href={onHome ? "#top" : "/"} className="flex items-center gap-2.5">
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
        </Link>

        <div className="font-arcade hidden items-center gap-2 text-[8px] text-white sm:flex">
          <CoinIcon className="h-3 w-3 text-blue-bright" />
          <span className="animate-credit-pulse">CREDITS ∞</span>
        </div>

        <nav className="flex items-center gap-4 md:gap-5">
          <div className="hidden items-center gap-5 md:flex">
            {homeSections.map((link) => (
              <a
                key={link.id}
                href={sectionHref(link.id)}
                className="font-arcade text-[8px] text-ink-muted transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <Link
            href="/docs"
            className={`font-arcade text-[8px] transition-colors ${
              pathname?.startsWith("/docs")
                ? "text-white"
                : "text-ink-muted hover:text-white"
            }`}
          >
            Docs
          </Link>
          <a
            href={sectionHref("arena")}
            className="arcade-btn font-arcade px-3 py-1.5 text-[8px]"
          >
            PLAY
          </a>
        </nav>
      </div>
    </header>
  );
}
