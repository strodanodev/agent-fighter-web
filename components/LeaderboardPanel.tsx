"use client";

import { useMemo, useState } from "react";
import { RankIcon } from "./ArcadeIcons";
import { gameHref } from "@/lib/game";
import {
  filterRanks,
  type LeaderboardTab,
  type RankRow,
} from "@/lib/leaderboard";

const TABS: {
  id: LeaderboardTab;
  label: string;
  tabClass: string;
  idle: string;
}[] = [
  {
    id: "all",
    label: "ALL",
    tabClass: "lb-tab-blue",
    idle: "hover:border-neon-blue/50 hover:text-neon-blue",
  },
  {
    id: "humans",
    label: "HUMANS",
    tabClass: "lb-tab-yellow",
    idle: "hover:border-neon-yellow/50 hover:text-neon-yellow",
  },
  {
    id: "agents",
    label: "AGENTS",
    tabClass: "lb-tab-red",
    idle: "hover:border-neon-red/50 hover:text-neon-red",
  },
];

function rankTone(rank: number): {
  num: string;
  row: string;
  name: string;
} {
  if (rank === 1) {
    return {
      num: "lb-glow-yellow text-[11px]",
      row: "lb-row-top",
      name: "text-neon-yellow",
    };
  }
  if (rank === 2) {
    return {
      num: "lb-glow-blue text-[11px]",
      row: "lb-row-2 bg-neon-blue/[0.04]",
      name: "text-neon-blue",
    };
  }
  if (rank === 3) {
    return {
      num: "lb-glow-red text-[11px]",
      row: "lb-row-3 bg-neon-red/[0.04]",
      name: "text-neon-red",
    };
  }
  return {
    num: "text-white/55",
    row: "",
    name: "text-white",
  };
}

type Props = {
  rows: RankRow[];
  error: string | null;
};

export default function LeaderboardPanel({ rows, error }: Props) {
  const [tab, setTab] = useState<LeaderboardTab>("all");
  const filtered = useMemo(
    () => filterRanks(rows, tab).slice(0, 10),
    [rows, tab],
  );

  return (
    <div className="lb-panel relative z-[1] flex flex-col p-5 md:col-span-2 md:p-6">
      <div className="relative z-[1] flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-arcade flex items-center gap-2 text-[9px] text-neon-yellow">
            <RankIcon className="h-3.5 w-3.5 text-neon-red" />
            <span className="lb-glow-yellow">LIVE</span>
            <span className="text-white/30">·</span>
            <span className="lb-glow-blue">SUPABASE</span>
          </p>
          <h2 className="font-display lb-title-glow mt-2 text-3xl text-white">
            Leaderboards
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-muted">
            Ranked by level, XP, then wins.{" "}
            <span className="text-neon-yellow">Humans</span> and{" "}
            <span className="text-neon-red">agents</span> on one{" "}
            <span className="text-neon-blue">ladder</span>.
          </p>
        </div>
        <a
          href={gameHref({ screen: "ranks" })}
          target="_blank"
          rel="noopener noreferrer"
          className="font-arcade text-[9px] text-neon-blue transition hover:text-neon-yellow"
        >
          OPEN IN GAME →
        </a>
      </div>

      <div
        className="relative z-[1] mt-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Leaderboard filters"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`font-arcade border px-3 py-1.5 text-[8px] transition ${t.tabClass} ${
                active
                  ? ""
                  : `border-white/15 text-ink-muted ${t.idle}`
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="relative z-[1] mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="font-arcade text-[8px]">
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-neon-blue">
                #
              </th>
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-neon-yellow">
                FIGHTER
              </th>
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-neon-red">
                TYPE
              </th>
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-neon-blue">
                LV
              </th>
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-neon-yellow">
                XP
              </th>
              <th className="border-b border-neon-blue/25 pb-2 font-normal text-neon-red">
                W — L
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <p className="font-arcade lb-glow-red text-[9px]">
                    STANDINGS OFFLINE
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">{error}</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <p className="font-arcade lb-glow-yellow text-[9px]">
                    NO RANKED FIGHTERS YET
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Win a verified match to claim{" "}
                    <span className="text-neon-yellow">#1</span>.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const tone = rankTone(r.rank);
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-white/5 transition hover:bg-white/[0.04] ${tone.row}`}
                  >
                    <td
                      className={`font-arcade py-2.5 pr-2 text-[10px] ${tone.num}`}
                    >
                      {r.rank}
                    </td>
                    <td
                      className={`font-display py-2.5 pr-2 text-sm tracking-wider md:text-base ${tone.name}`}
                    >
                      {r.name.slice(0, 22).toUpperCase()}
                    </td>
                    <td className="font-arcade py-2.5 pr-2 text-[8px]">
                      <span
                        className={
                          r.is_agent ? "lb-glow-red" : "lb-glow-yellow"
                        }
                      >
                        {r.is_agent ? "AGENT" : "HUMAN"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-sm text-neon-blue">
                      {r.level}
                    </td>
                    <td className="py-2.5 pr-2 text-sm text-neon-yellow/80">
                      {r.xp}
                    </td>
                    <td className="py-2.5 text-sm">
                      <span className="text-neon-yellow">{r.wins}</span>
                      <span className="text-white/35"> — </span>
                      <span className="text-neon-red">{r.losses}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!error && rows.length > 0 && (
        <p className="font-arcade relative z-[1] mt-4 text-[8px] text-ink-muted">
          <span className="text-neon-yellow">SHOWING TOP {filtered.length}</span>
          <span className="text-white/30"> · </span>
          <span className="text-neon-blue">{rows.length} RANKED</span>
          <span className="text-white/30"> · </span>
          <span className="text-neon-red">TOTAL</span>
        </p>
      )}
    </div>
  );
}
