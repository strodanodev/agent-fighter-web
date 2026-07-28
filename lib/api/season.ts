/**
 * Season arithmetic — a TypeScript mirror of the SQL `current_season()`
 * installed by migration 0021_elo.sql.
 *
 * Seasons in Agent Fighter are LAZY: there is no seasons table, no cron and no
 * admin panel. A season number is pure arithmetic over a fixed epoch, and a
 * profile's season columns re-base the first time it settles a match in a new
 * one. A player who sits out a season simply carries a stale stamp and does
 * not appear on that ladder — which is the correct behaviour, achieved by
 * doing nothing.
 *
 * BOTH definitions must agree. If the cadence below ever changes it must
 * change in the migration first, and only ever BEFORE a season boundary has
 * been crossed in production — changing it afterwards renumbers history.
 */

/** Season 1 opens at this instant (migration 0021). */
export const SEASON_EPOCH = Date.UTC(2026, 6, 27, 0, 0, 0); // 2026-07-27T00:00:00Z

/**
 * Season length. 21 days is the ADR 0009 PLACEHOLDER cadence — the owner sets
 * the real number before season 1 closes (2026-08-17).
 */
export const SEASON_DAYS = 21;
const SEASON_MS = SEASON_DAYS * 86_400_000;

export function currentSeason(now: number = Date.now()): number {
  return 1 + Math.floor((now - SEASON_EPOCH) / SEASON_MS);
}

/**
 * The season a HISTORICAL event belongs to, floored at 0.
 *
 * Agent Fighter has settled matches from well before season 1 opened, and the
 * raw arithmetic runs negative on those (two epochs early = season −1), which
 * would be nonsense in a public feed. Season 0 is the documented name for
 * "played before ranked seasons existed" — a real category, not an error.
 *
 * Kept separate from `currentSeason` on purpose: that function is a strict
 * mirror of the SQL, which is only ever evaluated at now() and therefore never
 * needs the clamp. Diverging them here would be a real bug.
 */
export function seasonAt(when: number | string): number {
  const t = typeof when === "number" ? when : Date.parse(when);
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, currentSeason(t));
}

/** UTC window [start, end) of a given season number. */
export function seasonWindow(season: number): { start: string; end: string } {
  const start = SEASON_EPOCH + (season - 1) * SEASON_MS;
  return {
    start: new Date(start).toISOString(),
    end: new Date(start + SEASON_MS).toISOString(),
  };
}

export type SeasonInfo = {
  season: number;
  starts_at: string;
  ends_at: string;
  /** Seconds until this season rolls over. */
  ends_in_seconds: number;
  season_days: number;
};

export function seasonInfo(now: number = Date.now()): SeasonInfo {
  const season = currentSeason(now);
  const { start, end } = seasonWindow(season);
  return {
    season,
    starts_at: start,
    ends_at: end,
    ends_in_seconds: Math.max(0, Math.round((Date.parse(end) - now) / 1000)),
    season_days: SEASON_DAYS,
  };
}
