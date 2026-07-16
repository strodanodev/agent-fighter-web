"use client";

import Image from "next/image";
import { useState } from "react";
import { FistIcon, JoystickIcon } from "./ArcadeIcons";
import SceneAccentLazy from "./SceneAccentLazy";
import {
  ADD_YOUR_AGENT,
  FIGHTERS,
  MINDS_LOGO_SRC,
  MINDS_URL,
  SKILL_BAZAAR_URL,
  gameHref,
  isAddAgent,
  portraitSrc,
  type FighterCard,
  type RosterCard,
} from "@/lib/game";

const ADD_STEPS = [
  {
    n: "01",
    t: "Create a Mind",
    d: "Launch your agent on Animoca Minds — free, no install.",
  },
  {
    n: "02",
    t: "Equip Custom Skill",
    d: "Grab the Custom Skill from Skill Bazaar to forge a fighter.",
  },
  {
    n: "03",
    t: "Deploy & fight",
    d: "Generate your fighter and drop it into the Agent Fighter arena.",
  },
] as const;

export default function Featured() {
  const featured = FIGHTERS.find((f) => f.featured) ?? FIGHTERS[0]!;
  const [active, setActive] = useState<RosterCard>(featured);
  const roster = FIGHTERS.filter((f) => !f.disabled);

  return (
    <section id="fighters" className="section-defer relative py-10 md:py-12">
      <SceneAccentLazy
        variant="fighters"
        className="opacity-35 [mask-image:linear-gradient(90deg,transparent,black_30%,black_70%,transparent)]"
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-arcade text-[9px] text-blue-bright">ROSTER</p>
            <h2 className="font-display arcade-stroke mt-1 text-2xl text-white md:text-3xl">
              Fighters
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(ADD_YOUR_AGENT)}
              className={`inline-flex items-center gap-2 border px-2 py-1 transition ${
                isAddAgent(active)
                  ? "border-blue-bright bg-black shadow-[0_0_18px_rgba(47,143,255,0.55)]"
                  : "animate-minds-pulse border-blue-bright/80 bg-black/80 hover:border-blue-bright"
              }`}
            >
              <Image
                src={MINDS_LOGO_SRC}
                alt="Built on Minds by Animoca Brands"
                width={96}
                height={60}
                className="h-9 w-auto object-contain"
                unoptimized
              />
              <span className="font-arcade text-[7px] leading-tight text-blue-bright">
                ADD YOUR
                <br />
                AGENT
              </span>
            </button>
            <a
              href={gameHref({ screen: "select", mode: "cpu" })}
              target="_blank"
              rel="noopener noreferrer"
              className="font-arcade text-[9px] text-blue-bright transition hover:text-white"
            >
              OPEN SELECT →
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
          {isAddAgent(active) ? (
            <AddAgentPreview />
          ) : (
            <FighterPreview fighter={active} />
          )}

          <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-9">
            {roster.map((f) => {
              const on = f.id === active.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActive(f)}
                  className={`relative aspect-[3/4] overflow-hidden border-2 bg-black/40 transition ${
                    on
                      ? "border-white shadow-[0_0_14px_rgba(47,143,255,0.45)]"
                      : "border-white/10 hover:border-blue/60"
                  }`}
                >
                  <Image
                    src={portraitSrc(f.id)}
                    alt={f.name}
                    fill
                    className="object-cover object-top"
                    sizes="96px"
                    unoptimized
                  />
                  <span className="font-arcade absolute inset-x-0 bottom-0 bg-black/80 py-0.5 text-center text-[6px] text-ink">
                    {f.name}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActive(ADD_YOUR_AGENT)}
              aria-label="Add your Agent with Animoca Minds"
              className={`relative aspect-[3/4] overflow-hidden border-2 transition ${
                isAddAgent(active)
                  ? "border-blue-bright bg-[#1a3a8a]/55 shadow-[0_0_22px_rgba(47,143,255,0.65)]"
                  : "animate-minds-pulse border-blue-bright bg-[#12306e]/70 hover:bg-[#1a3a8a]/50"
              }`}
            >
              <span className="font-arcade absolute top-1 right-1 z-10 bg-blue px-1 py-0.5 text-[5px] text-white shadow-[0_0_8px_rgba(47,143,255,0.8)]">
                NEW
              </span>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black px-1">
                <Image
                  src={MINDS_LOGO_SRC}
                  alt="Built on Minds by Animoca Brands"
                  width={96}
                  height={64}
                  className="h-auto w-[90%] max-w-[80px] object-contain"
                  unoptimized
                />
                <span className="font-arcade text-center text-[5px] leading-tight text-blue-bright sm:text-[6px]">
                  ADD YOUR
                  <br />
                  AGENT
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FighterPreview({ fighter }: { fighter: FighterCard }) {
  return (
    <div className="arcade-panel arcade-panel-static relative h-44 w-full shrink-0 overflow-hidden sm:h-48 md:h-auto md:w-40 lg:w-44">
      <Image
        src={portraitSrc(fighter.id)}
        alt={fighter.name}
        fill
        className="object-cover object-top"
        sizes="176px"
        unoptimized
        priority
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5">
        <p className="font-arcade text-[7px] text-blue-bright">{fighter.tag}</p>
        <h3 className="font-display text-lg leading-none text-white">
          {fighter.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-muted">
          {fighter.blurb}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <a
            href={gameHref({
              screen: "select",
              mode: "cpu",
              char: fighter.id,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="arcade-btn font-arcade gap-1 px-2 py-1 text-[7px]"
          >
            <JoystickIcon className="h-2.5 w-2.5" />
            SELECT
          </a>
          <a
            href={gameHref({
              screen: "play",
              mode: "cpu",
              char: fighter.id,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="font-arcade inline-flex items-center gap-1 border border-white/40 bg-white/5 px-2 py-1 text-[7px] text-white"
          >
            <FistIcon className="h-2.5 w-2.5" />
            FIGHT
          </a>
        </div>
      </div>
    </div>
  );
}

function AddAgentPreview() {
  return (
    <div className="arcade-panel relative flex w-full shrink-0 flex-col overflow-hidden border-blue-bright bg-[#0a1840] shadow-[0_0_28px_rgba(47,143,255,0.45)] md:w-56 lg:w-64">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, rgba(47,143,255,0.5), transparent 55%), linear-gradient(180deg, rgba(47,143,255,0.12), transparent 40%)",
        }}
      />
      <div className="relative flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <Image
            src={MINDS_LOGO_SRC}
            alt="Built on Minds by Animoca Brands"
            width={160}
            height={100}
            className="h-14 w-auto object-contain object-left md:h-16"
            unoptimized
            priority
          />
          <span className="font-arcade shrink-0 bg-blue px-1.5 py-0.5 text-[6px] text-white">
            NEW
          </span>
        </div>
        <p className="font-arcade mt-2.5 text-[7px] text-blue-bright">
          BUILD YOUR FIGHTER
        </p>
        <h3 className="font-display mt-0.5 text-lg leading-none text-white">
          Add your Agent
        </h3>
        <p className="mt-1.5 text-[11px] leading-snug text-ink-muted">
          Build a custom fighter with a Mind, then equip the Custom Skill from
          Skill Bazaar to deploy it in-game.
        </p>

        <ol className="mt-3 space-y-2">
          {ADD_STEPS.map((s) => (
            <li key={s.n} className="flex gap-2">
              <span className="font-arcade shrink-0 text-[7px] text-blue-bright">
                {s.n}
              </span>
              <div className="min-w-0">
                <p className="font-arcade text-[7px] leading-tight text-white">
                  {s.t}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-ink-muted">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <a
            href={MINDS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="arcade-btn font-arcade gap-1 px-2 py-1 text-[7px]"
          >
            OPEN MINDS
          </a>
          <a
            href={SKILL_BAZAAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-arcade inline-flex items-center gap-1 border border-blue-bright/60 bg-blue/15 px-2 py-1 text-[7px] text-blue-bright transition hover:border-blue-bright hover:bg-blue/30 hover:text-white"
          >
            SKILL BAZAAR
          </a>
        </div>
      </div>
    </div>
  );
}
