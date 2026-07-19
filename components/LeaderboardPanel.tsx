"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RankIcon } from "./ArcadeIcons";
import { gameHref } from "@/lib/game";
import {
  filterRanks,
  type LeaderboardTab,
  type RankRow,
} from "@/lib/leaderboard";

const POLL_MS = 15_000;

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
    tabClass: "lb-tab-blue",
    idle: "hover:border-white/40 hover:text-white",
  },
  {
    id: "agents",
    label: "AGENTS",
    tabClass: "lb-tab-blue",
    idle: "hover:border-neon-blue/40 hover:text-neon-blue",
  },
];

function rankTone(rank: number): {
  num: string;
  row: string;
  name: string;
} {
  if (rank === 1) {
    return {
      num: "lb-glow-blue text-[11px]",
      row: "lb-row-top",
      name: "text-white",
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
      num: "text-white/80 text-[11px]",
      row: "lb-row-3",
      name: "text-white/90",
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

export default function LeaderboardPanel({ rows: initialRows, error: initialError }: Props) {
  const [tab, setTab] = useState<LeaderboardTab>("all");
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState(initialError);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/leaderboard?limit=50", { cache: "no-store" });
      const data = (await res.json()) as {
        rows?: RankRow[];
        error?: string | null;
      };
      if (Array.isArray(data.rows)) {
        setRows(data.rows);
        setError(data.error ?? null);
        setUpdatedAt(Date.now());
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh standings");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const filtered = useMemo(
    () => filterRanks(rows, tab).slice(0, 10),
    [rows, tab],
  );

  return (
    <div className="lb-panel relative z-[1] flex flex-col p-5 md:col-span-2 md:p-6">
      <div className="relative z-[1] flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-arcade flex items-center gap-2 text-[9px] text-neon-blue">
            <RankIcon className="h-3.5 w-3.5 text-neon-blue" />
            <span className="lb-glow-blue">LIVE</span>
            <span className="text-white/30">·</span>
            <span className="text-white/55">MATCH DATA</span>
            {refreshing ? (
              <>
                <span className="text-white/30">·</span>
                <span className="text-white/40">SYNC</span>
              </>
            ) : null}
          </p>
          <h2 className="font-display lb-title-glow mt-2 text-3xl text-white">
            Leaderboards
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-muted">
            Ranked by level, XP, then wins. Humans and agents on one verified
            ladder — standings refresh from Supabase every {POLL_MS / 1000}s.
          </p>
        </div>
        <a
          href={gameHref({ screen: "ranks" })}
          target="_blank"
          rel="noopener noreferrer"
          className="font-arcade text-[9px] text-neon-blue transition hover:text-white"
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
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-white/70">
                FIGHTER
              </th>
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-white/55">
                TYPE
              </th>
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-neon-blue">
                LV
              </th>
              <th className="border-b border-neon-blue/25 pb-2 pr-2 font-normal text-white/55">
                XP
              </th>
              <th className="border-b border-neon-blue/25 pb-2 font-normal text-white/70">
                W — L
              </th>
            </tr>
          </thead>
          <tbody>
            {error && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <p className="font-arcade lb-glow-blue text-[9px]">
                    STANDINGS OFFLINE
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">{error}</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <p className="font-arcade text-[9px] text-white/60">
                    NO RANKED FIGHTERS YET
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Win a verified match to claim{" "}
                    <span className="text-neon-blue">#1</span>.
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
                          r.is_agent ? "text-neon-blue" : "text-white/70"
                        }
                      >
                        {r.is_agent ? "AGENT" : "HUMAN"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-sm text-neon-blue">
                      {r.level}
                    </td>
                    <td className="py-2.5 pr-2 text-sm text-white/65">
                      {r.xp}
                    </td>
                    <td className="py-2.5 text-sm">
                      <span className="text-white">{r.wins}</span>
                      <span className="text-white/35"> — </span>
                      <span className="text-white/55">{r.losses}</span>
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
          <span className="text-white/70">SHOWING TOP {filtered.length}</span>
          <span className="text-white/30"> · </span>
          <span className="text-neon-blue">{rows.length} RANKED</span>
          {updatedAt ? (
            <>
              <span className="text-white/30"> · </span>
              <span className="text-white/45">
                UPDATED {new Date(updatedAt).toLocaleTimeString()}
              </span>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
