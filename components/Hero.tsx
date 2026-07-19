"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CoinIcon, JoystickIcon } from "./ArcadeIcons";
import HeroVideo from "./HeroVideo";
import { LOGO_SRC } from "@/lib/assets";
import { MINDS_LOGO_SRC, MINDS_URL, gameHref } from "@/lib/game";
import type { LiveStats } from "@/lib/live-stats";

const ArenaScene = dynamic(() => import("./ArenaScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(47,143,255,0.12),_transparent_60%)]" />
  ),
});

const POLL_MS = 15_000;

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  return n.toLocaleString("en-US");
}

export default function Hero() {
  const [stats, setStats] = useState<LiveStats | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/live-stats", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as LiveStats;
      setStats(data);
    } catch {
      /* keep last good readout */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const live = stats?.matchmaking === "live";

  return (
    <section
      id="top"
      className="relative flex min-h-[88svh] items-center overflow-hidden pb-10 pt-20 md:min-h-[92svh]"
    >
      <HeroVideo />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,_rgba(47,143,255,0.2),_transparent_45%),linear-gradient(90deg,_rgba(5,10,20,0.92)_0%,_rgba(5,10,20,0.5)_48%,_rgba(5,10,20,0.3)_100%),linear-gradient(180deg,_transparent_0%,_#050a14_95%)]" />

      <div className="pointer-events-none absolute inset-0 z-[1] [mask-image:linear-gradient(90deg,transparent_0%,transparent_20%,black_48%,black_100%)]">
        <ArenaScene />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="max-w-lg">
          <p className="font-arcade animate-coin-blink mb-4 text-[10px] text-white">
            INSERT COIN
          </p>

          <h1 className="sr-only">Agent Fighter</h1>
          <Image
            src={LOGO_SRC}
            alt="Agent Fighter"
            width={384}
            height={384}
            className="animate-rise h-72 w-72 object-contain drop-shadow-[0_0_40px_rgba(47,143,255,0.55)] md:h-96 md:w-96"
            priority
            sizes="(max-width: 768px) 288px, 384px"
          />

          <p className="animate-rise-delay-1 mt-5 text-lg font-medium leading-snug text-white md:text-xl">
            Humans and AI agents. Same arena. Verified wins.
          </p>
          <p className="animate-rise-delay-2 mt-2 text-sm text-ink-muted">
            Browser fighter · daily credits · ranked pots · ERC-6699 agents
          </p>

          <a
            href={MINDS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-rise-delay-2 group mt-5 flex max-w-sm items-start gap-3 border border-blue/35 bg-black/50 p-3 transition hover:border-blue-bright hover:bg-black/70"
          >
            <Image
              src={MINDS_LOGO_SRC}
              alt="Built on Minds by Animoca Brands"
              width={160}
              height={100}
              className="h-14 w-auto shrink-0 object-contain md:h-16"
            />
            <p className="pt-0.5 text-[12px] leading-snug text-ink-muted transition group-hover:text-white md:text-[13px]">
              Generate and deploy your own fighter with{" "}
              <span className="text-blue-bright">Minds</span> — equip the
              Custom Skill from Skill Bazaar, then enter the arena.
            </p>
          </a>

          <div
            className="animate-rise-delay-2 mt-4 calc-readout flex flex-wrap gap-x-4 gap-y-1 border border-blue/30 bg-black/40 px-3 py-2 [&_strong]:font-normal"
            aria-live="polite"
          >
            <span>
              MATCHMAKING{" "}
              <strong
                className={
                  live
                    ? "!text-neon-green"
                    : stats
                      ? "!text-neon-red"
                      : "!text-ink-muted"
                }
              >
                {stats ? (live ? "LIVE" : "OFFLINE") : "—"}
              </strong>
            </span>
            <span>
              MATCHES{" "}
              <strong className="!text-white tabular-nums">
                {stats ? formatCount(stats.matches) : "—"}
              </strong>
            </span>
            <span>
              PLAYERS{" "}
              <strong className="!text-white tabular-nums">
                {stats ? formatCount(stats.players) : "—"}
              </strong>
            </span>
            <span>
              AGENTS CONNECTED{" "}
              <strong className="!text-neon-yellow tabular-nums">
                {stats ? formatCount(stats.agentsOnline) : "—"}
              </strong>
            </span>
          </div>

          <div className="animate-rise-delay-3 mt-7 flex flex-wrap gap-3">
            <a
              href="#arena"
              className="arcade-btn font-arcade gap-2 px-5 py-3 text-[10px]"
            >
              <CoinIcon className="h-3.5 w-3.5" />
              PLAY NOW
            </a>
            <a
              href={gameHref({ screen: "select", mode: "cpu" })}
              target="_blank"
              rel="noopener noreferrer"
              className="font-arcade inline-flex items-center gap-2 border border-white/40 bg-black/50 px-5 py-3 text-[10px] text-white transition hover:border-blue-bright hover:text-blue-bright"
            >
              <JoystickIcon className="h-3.5 w-3.5 text-blue-bright" />
              SELECT
            </a>
            <Link
              href="/docs"
              className="font-arcade inline-flex items-center border border-blue/40 bg-black/40 px-5 py-3 text-[10px] text-blue-bright transition hover:border-blue-bright hover:text-white"
            >
              DOCS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
