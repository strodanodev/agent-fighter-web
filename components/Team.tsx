"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CrownIcon, CpuIcon, ShieldIcon } from "./ArcadeIcons";
import SceneAccentLazy from "./SceneAccentLazy";
import { TEAM, type TeamMember } from "@/lib/team";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?#@$%&*";

function scramble(len: number) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
  }
  return out;
}

function ScrambleText({
  length,
  className,
  intervalMs = 80,
}: {
  length: number;
  className?: string;
  intervalMs?: number;
}) {
  const [text, setText] = useState(() => "?".repeat(length));

  useEffect(() => {
    const id = window.setInterval(() => {
      setText(scramble(length));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs]);

  return (
    <span className={className} aria-label="classified">
      {text}
    </span>
  );
}

function MemberCard({ member, delay }: { member: TeamMember; delay: number }) {
  const mystery = Boolean(member.mystery);

  return (
    <article
      className={`arcade-panel group relative overflow-hidden p-4 ${
        mystery ? "team-mystery" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`relative h-16 w-16 shrink-0 overflow-hidden border-2 bg-black/50 ${
            mystery
              ? "animate-mystery-glitch border-blue/50"
              : "border-white/20 group-hover:border-blue-bright/70"
          }`}
        >
          <Image
            src={member.avatar}
            alt={mystery ? "Classified operative" : member.name}
            fill
            className={`object-cover ${mystery ? "animate-mystery-static" : ""}`}
            sizes="64px"
            unoptimized
          />
          {mystery && (
            <div
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(47,143,255,0.12)_2px,rgba(47,143,255,0.12)_4px)]"
              aria-hidden
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {mystery ? (
            <>
              <h3 className="font-display text-lg leading-none text-blue-bright">
                <ScrambleText length={5} intervalMs={70 + delay * 0.05} />
              </h3>
              <p className="font-arcade mt-1.5 text-[8px] text-ink-muted">
                <ScrambleText length={6} intervalMs={95 + delay * 0.04} />
                <span className="text-white/30"> / </span>
                <ScrambleText length={6} intervalMs={110 + delay * 0.03} />
              </p>
              <p className="mt-1 text-[11px] text-ink-muted/70">Slot encrypted</p>
            </>
          ) : (
            <>
              <h3 className="font-display text-lg leading-none text-white group-hover:text-blue-bright">
                {member.name}
              </h3>
              <p className="font-arcade mt-1.5 text-[8px] text-blue-bright">
                {member.role}
                <span className="text-white/35"> / </span>
                <span className="text-ink-muted">{member.focus}</span>
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

const groupIcons = {
  exec: CrownIcon,
  agents: CpuIcon,
  advisors: ShieldIcon,
} as const;

export default function Team() {
  return (
    <section id="team" className="section-defer relative overflow-hidden py-16 md:py-20">
      <SceneAccentLazy
        variant="team"
        className="opacity-30 [mask-image:radial-gradient(ellipse_at_50%_20%,black_10%,transparent_65%)]"
      />
      <div className="relative z-[1] mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-10">
          <p className="font-arcade text-[9px] text-blue-bright">CREW</p>
          <h2 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
            Team
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
            Humans, agents, and encrypted seats — building the infinite arcade.
          </p>
        </div>

        <div className="space-y-10">
          {TEAM.map((group) => {
            const Icon =
              groupIcons[group.id as keyof typeof groupIcons] ?? ShieldIcon;
            return (
              <div key={group.id}>
                <p className="font-arcade mb-3 flex items-center gap-2 text-[9px] text-white">
                  <Icon className="h-3.5 w-3.5 text-blue-bright" />
                  {group.label}
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((member, i) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      delay={i * 120}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
