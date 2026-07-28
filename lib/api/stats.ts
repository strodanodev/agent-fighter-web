/**
 * Global aggregates — powers both `GET /api/v1/stats` and the public data
 * console.
 *
 * Computed on read from a bounded sample rather than stored as rollups. That
 * is the right trade at this data size (hundreds of matches, one Supabase
 * round trip behind a CDN cache) and the wrong one at a hundred thousand — at
 * which point this module becomes a materialised view refreshed on settle.
 * The sample bound is REPORTED, never silent: a consumer must be able to tell
 * a complete aggregate from a windowed one.
 */

import { rest } from "./db";
import { currentSeason, seasonInfo, type SeasonInfo } from "./season";

/** Matches scanned for the aggregate. */
const STATS_SAMPLE = 1000;

type StatRow = {
  created_at: string;
  mode: string;
  fee: number | null;
  winner: number;
  reason: string;
  deviator: number | null;
  p0_char: string;
  p1_char: string;
  p0_agent: boolean;
  p1_agent: boolean;
  end_tick: number;
};

export type CharacterStat = {
  character: string;
  picks: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  /** Share of all character slots in the sample, 0–1. */
  pick_rate: number;
};

export type GlobalStats = {
  sample: { matches_scanned: number; truncated: boolean; limit: number };
  season: SeasonInfo;
  totals: {
    matches: number;
    players: number;
    agents: number;
    decided: number;
    draws: number;
    no_contests: number;
    rated: number;
  };
  by_mode: Record<string, number>;
  by_character: CharacterStat[];
  activity: { date: string; matches: number }[];
  duration: { average_seconds: number | null; median_seconds: number | null };
  economy: { credits_staked: number };
  integrity: {
    verified: number;
    forfeits: number;
    desync_convictions: number;
    /** Share of decided matches derived by full re-simulation, 0–1. */
    verified_rate: number | null;
  };
};

export async function getGlobalStats(): Promise<GlobalStats> {
  const [sample, playerCounts] = await Promise.all([
    rest<StatRow>(
      "matches",
      {
        select:
          "created_at,mode,fee,winner,reason,deviator,p0_char,p1_char,p0_agent,p1_agent,end_tick",
        order: "created_at.desc",
        limit: String(STATS_SAMPLE),
      },
      { count: "exact", revalidate: 30 },
    ),
    countPlayers(),
  ]);

  const rows = sample.rows;
  const by_mode: Record<string, number> = {};
  const chars = new Map<string, { picks: number; wins: number; losses: number }>();
  const perDay = new Map<string, number>();
  const durations: number[] = [];

  let decided = 0;
  let draws = 0;
  let noContests = 0;
  let rated = 0;
  let verified = 0;
  let forfeits = 0;
  let desyncs = 0;
  let staked = 0;

  for (const r of rows) {
    by_mode[r.mode] = (by_mode[r.mode] ?? 0) + 1;

    const isNoContest = r.winner !== 0 && r.winner !== 1 && r.winner !== 2;
    const isDraw = r.winner === 2;
    if (isNoContest) noContests++;
    else if (isDraw) draws++;
    else decided++;

    if (r.reason === "verified") verified++;
    if (r.reason === "forfeit") forfeits++;
    if (r.deviator === 0 || r.deviator === 1) desyncs++;

    if (
      r.mode === "wager" &&
      r.reason === "verified" &&
      (r.winner === 0 || r.winner === 1) &&
      !r.p0_agent &&
      !r.p1_agent
    ) {
      rated++;
    }

    // Only a two-sided wager actually puts credits at risk on both sides.
    if (r.mode === "wager") staked += (r.fee ?? 0) * 2;

    for (const [i, id] of [r.p0_char, r.p1_char].entries()) {
      if (!id) continue;
      const c = chars.get(id) ?? { picks: 0, wins: 0, losses: 0 };
      c.picks++;
      if (!isNoContest && !isDraw) {
        if (r.winner === i) c.wins++;
        else c.losses++;
      }
      chars.set(id, c);
    }

    const day = r.created_at.slice(0, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);

    if (!isNoContest && r.end_tick > 0) durations.push(r.end_tick / 60);
  }

  const totalSlots = [...chars.values()].reduce((a, c) => a + c.picks, 0) || 1;

  durations.sort((a, b) => a - b);
  const median =
    durations.length === 0
      ? null
      : Math.round(durations[Math.floor(durations.length / 2)]);
  const average =
    durations.length === 0
      ? null
      : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

  return {
    sample: {
      matches_scanned: rows.length,
      truncated: (sample.total ?? rows.length) > rows.length,
      limit: STATS_SAMPLE,
    },
    season: seasonInfo(),
    totals: {
      matches: sample.total ?? rows.length,
      players: playerCounts.humans,
      agents: playerCounts.agents,
      decided,
      draws,
      no_contests: noContests,
      rated,
    },
    by_mode,
    by_character: [...chars.entries()]
      .map(([character, c]) => ({
        character,
        picks: c.picks,
        wins: c.wins,
        losses: c.losses,
        win_rate:
          c.wins + c.losses === 0
            ? null
            : Math.round((c.wins / (c.wins + c.losses)) * 1000) / 1000,
        pick_rate: Math.round((c.picks / totalSlots) * 1000) / 1000,
      }))
      .sort((a, b) => b.picks - a.picks),
    activity: lastDays(perDay, 21),
    duration: { average_seconds: average, median_seconds: median },
    economy: { credits_staked: staked },
    integrity: {
      verified,
      forfeits,
      desync_convictions: desyncs,
      verified_rate:
        decided === 0 ? null : Math.round((verified / decided) * 1000) / 1000,
    },
  };
}

/**
 * A dense day series, zero-filled.
 *
 * Sparse activity data draws a lying chart: skipping empty days compresses a
 * quiet week into a line that looks as busy as a loud one. Zero-filling makes
 * a gap read as a gap.
 */
function lastDays(
  perDay: Map<string, number>,
  days: number,
): { date: string; matches: number }[] {
  const out: { date: string; matches: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i),
    );
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, matches: perDay.get(key) ?? 0 });
  }
  return out;
}

/** Head-count humans and agents without pulling either table's rows. */
async function countPlayers(): Promise<{ humans: number; agents: number }> {
  const [h, a] = await Promise.all([
    rest<unknown>(
      "profiles",
      { select: "ref_code", is_agent: "is.false", limit: "1" },
      { count: "exact", revalidate: 60 },
    ),
    rest<unknown>(
      "profiles",
      { select: "ref_code", is_agent: "is.true", limit: "1" },
      { count: "exact", revalidate: 60 },
    ),
  ]);
  return { humans: h.total ?? 0, agents: a.total ?? 0 };
}

/** Season number for an arbitrary settle time (used by the match projection). */
export { currentSeason };
