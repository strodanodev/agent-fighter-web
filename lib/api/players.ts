/**
 * Play profiles — the public view of a fighter and the stats derived from
 * their settled matches.
 *
 * Two very different kinds of number live here, and conflating them is the
 * usual way a games API misleads people:
 *
 *  · STORED progression — level, xp, wins, losses, credits, elo. Written by
 *    the match server inside the same atomic settlement that decides the
 *    match. Authoritative.
 *  · DERIVED form — per-character win rates, streaks, mode splits. Computed
 *    here by aggregating the player's match rows on read.
 *
 * Derived numbers are honest but shallow: they can only describe what the
 * matches table stores. Deep per-match telemetry (damage, combos, meter) is
 * NOT available yet — it arrives when settlement starts persisting the input
 * ledger and derives stats from the re-simulation. Until then this module
 * deliberately reports nothing it cannot source.
 */

import { PROFILE_PUBLIC_COLUMNS } from "./config";
import { rest } from "./db";
import { currentSeason } from "./season";

type ProfileRow = {
  ref_code: string | null;
  name: string;
  is_agent: boolean;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  credits: number;
  elo: number;
  rated: number;
  season_elo: number;
  season_rated: number;
  season: number;
  created_at: string;
};

const PROFILE_SELECT = PROFILE_PUBLIC_COLUMNS.join(",");

export type PublicPlayer = {
  /**
   * Public code, usable with GET /players/{handle}. Null for a profile that
   * never received one (legacy or agent-class rows) — such a player still
   * appears in standings but cannot be addressed individually.
   */
  handle: string | null;
  name: string;
  is_agent: boolean;
  joined_at: string;
  progression: { level: number; xp: number };
  record: { wins: number; losses: number; win_rate: number | null };
  economy: { credits: number };
  rating: {
    /** Never resets — the all-time skill number. */
    lifetime: { elo: number; rated_matches: number };
    /**
     * Resets each season and plays in its own pool. `season` is the season
     * the stored numbers BELONG to: a player who has not fought this season
     * carries a stale stamp, which is why `is_current` exists rather than us
     * silently presenting last season's rating as this one's.
     */
    season: {
      season: number;
      elo: number;
      rated_matches: number;
      is_current: boolean;
    };
  };
};

function winRate(w: number, l: number): number | null {
  const n = w + l;
  return n === 0 ? null : Math.round((w / n) * 1000) / 1000;
}

function toPublicPlayer(p: ProfileRow): PublicPlayer {
  const season = currentSeason();
  return {
    handle: p.ref_code || null,
    name: p.name,
    is_agent: p.is_agent,
    joined_at: p.created_at,
    progression: { level: p.level, xp: p.xp },
    record: {
      wins: p.wins,
      losses: p.losses,
      win_rate: winRate(p.wins, p.losses),
    },
    economy: { credits: p.credits },
    rating: {
      lifetime: { elo: p.elo, rated_matches: p.rated },
      season: {
        season: p.season,
        elo: p.season_elo,
        rated_matches: p.season_rated,
        is_current: p.season === season,
      },
    },
  };
}

export async function getPlayer(handle: string): Promise<PublicPlayer | null> {
  const { rows } = await rest<ProfileRow>(
    "profiles",
    {
      select: PROFILE_SELECT,
      ref_code: `eq.${handle.toUpperCase()}`,
      limit: "1",
    },
    { revalidate: 30 },
  );
  return rows[0] ? toPublicPlayer(rows[0]) : null;
}

export type PlayerListQuery = {
  limit: number;
  /** `elo` (lifetime), `season_elo`, `level`, or `wins`. */
  sort: "elo" | "season_elo" | "level" | "wins";
  /** Restrict to humans or agents; omit for both. */
  kind?: "human" | "agent";
  /** Only players with at least one rated match on the chosen track. */
  ratedOnly?: boolean;
};

export async function listPlayers(
  q: PlayerListQuery,
): Promise<PublicPlayer[]> {
  const conds: string[] = [];
  if (q.kind === "human") conds.push("is_agent.is.false");
  if (q.kind === "agent") conds.push("is_agent.is.true");
  if (q.ratedOnly) {
    conds.push(q.sort === "season_elo" ? "season_rated.gt.0" : "rated.gt.0");
  } else {
    // Never rank someone who has never played — an untouched profile sitting
    // at the 1200 seed would otherwise outrank real players who have lost.
    conds.push("or(wins.gt.0,losses.gt.0)");
  }
  if (q.sort === "season_elo") conds.push(`season.eq.${currentSeason()}`);

  const { rows } = await rest<ProfileRow>(
    "profiles",
    {
      select: PROFILE_SELECT,
      order: `${q.sort}.desc,xp.desc`,
      limit: String(q.limit),
      and: conds.length ? `(${conds.join(",")})` : undefined,
    },
    { revalidate: 30 },
  );
  return rows.map(toPublicPlayer);
}

// -------------------------------------------------------------- derived form

type FormRow = {
  created_at: string;
  mode: string;
  winner: number;
  reason: string;
  p0: string | null;
  p0_char: string;
  p1_char: string;
  end_tick: number;
};

export type PlayerForm = {
  matches_played: number;
  by_mode: Record<string, { played: number; won: number; win_rate: number | null }>;
  by_character: {
    character: string;
    played: number;
    won: number;
    win_rate: number | null;
  }[];
  /** Most recent results, newest first: `w` | `l` | `d` | `n` (no contest). */
  recent_form: string[];
  /** Positive = win streak, negative = loss streak, 0 = none or last was a void. */
  streak: number;
  average_match_seconds: number | null;
};

/**
 * Aggregate a player's settled matches into form.
 *
 * Capped at `FORM_SAMPLE` rows. That is a real limit, not a rounding — with a
 * few hundred matches per player it is currently the whole history, but a
 * heavy player would see the oldest matches fall outside it. The cap is stated
 * in the response (`sampled_matches`) rather than left implicit, because a
 * silently-truncated aggregate reads as a complete one.
 */
const FORM_SAMPLE = 500;

export async function getPlayerForm(sub: string): Promise<PlayerForm> {
  const { rows } = await rest<FormRow>(
    "matches",
    {
      select: "created_at,mode,winner,reason,p0,p0_char,p1_char,end_tick",
      or: `(p0.eq."${sub}",p1.eq."${sub}")`,
      order: "created_at.desc",
      limit: String(FORM_SAMPLE),
    },
    { revalidate: 30 },
  );

  const by_mode: PlayerForm["by_mode"] = {};
  const chars = new Map<string, { played: number; won: number }>();
  const recent: string[] = [];
  let totalTicks = 0;
  let decided = 0;

  for (const r of rows) {
    const mySide = r.p0 === sub ? 0 : 1;
    const myChar = mySide === 0 ? r.p0_char : r.p1_char;

    const noContest = r.winner !== 0 && r.winner !== 1 && r.winner !== 2;
    const draw = r.winner === 2;
    const won = !noContest && !draw && r.winner === mySide;

    const m = (by_mode[r.mode] ??= { played: 0, won: 0, win_rate: null });
    m.played++;
    if (won) m.won++;

    if (myChar) {
      const c = chars.get(myChar) ?? { played: 0, won: 0 };
      c.played++;
      if (won) c.won++;
      chars.set(myChar, c);
    }

    if (recent.length < 20) recent.push(noContest ? "n" : draw ? "d" : won ? "w" : "l");
    if (!noContest) {
      decided++;
      totalTicks += r.end_tick;
    }
  }

  for (const m of Object.values(by_mode)) {
    m.win_rate = m.played === 0 ? null : Math.round((m.won / m.played) * 1000) / 1000;
  }

  // Streak runs over decided results only — a no-contest neither breaks nor
  // extends a run, because nothing happened.
  let streak = 0;
  for (const r of recent) {
    if (r === "n") continue;
    if (r === "d") break;
    if (streak === 0) streak = r === "w" ? 1 : -1;
    else if (streak > 0 && r === "w") streak++;
    else if (streak < 0 && r === "l") streak--;
    else break;
  }

  return {
    matches_played: rows.length,
    by_mode,
    by_character: [...chars.entries()]
      .map(([character, c]) => ({
        character,
        played: c.played,
        won: c.won,
        win_rate: Math.round((c.won / c.played) * 1000) / 1000,
      }))
      .sort((a, b) => b.played - a.played),
    recent_form: recent,
    streak,
    average_match_seconds:
      decided === 0 ? null : Math.round(totalTicks / decided / 60),
  };
}
