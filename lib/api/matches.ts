/**
 * Match feed — query + public projection.
 *
 * A "match" here is a SETTLED match. Rows only exist once the match server has
 * re-simulated the input ledger and written the verdict, so everything this
 * module returns is already `final` or `void` — there is no half-written state
 * to guard against.
 */

import { PAGE_MAX } from "./config";
import {
  cursorFilter,
  decodeCursor,
  encodeCursor,
  rest,
  type Cursor,
} from "./db";
import { isRated, resolve, type Resolution } from "./resolution";
import { seasonAt, seasonWindow } from "./season";

/** Row shape as stored (see migration 0001 + 0002's `mode`/`fee`). */
type MatchRow = {
  id: string;
  created_at: string;
  mode: string;
  fee: number | null;
  p0: string | null;
  p1: string | null;
  p0_name: string;
  p1_name: string;
  p0_agent: boolean;
  p1_agent: boolean;
  p0_char: string;
  p1_char: string;
  winner: number;
  reason: string;
  rounds0: number;
  rounds1: number;
  end_tick: number;
  state_hash: number | string;
  deviator: number | null;
  engine: string;
};

const MATCH_COLUMNS =
  "id,created_at,mode,fee,p0,p1,p0_name,p1_name,p0_agent,p1_agent,p0_char,p1_char,winner,reason,rounds0,rounds1,end_tick,state_hash,deviator,engine";

export type PublicSide = {
  /** Public handle (`ref_code`). Null for a house AI or an unlinked side. */
  handle: string | null;
  name: string;
  character: string;
  /** True when this side was played by an agent rather than human hands. */
  is_agent: boolean;
  rounds_won: number;
  won: boolean | null;
};

export type PublicMatch = {
  id: string;
  played_at: string;
  season: number;
  mode: string;
  rated: boolean;
  stakes: { entry_fee: number; pot: number; currency: "credits" };
  players: [PublicSide, PublicSide];
  resolution: Resolution;
  duration: { ticks: number; seconds: number };
  /**
   * The trust anchor. `state_hash` is the final hash of the server's own
   * re-simulation of the ledger — two independent parties replaying the same
   * inputs on the same engine must land on this exact number. `engine` pins
   * WHICH build produced it: results are only comparable within an engine
   * version, which is why it travels with every match.
   */
  verification: {
    engine: string;
    state_hash: string;
    verified: boolean;
    desync_side: 0 | 1 | null;
  };
};

function toPublic(
  row: MatchRow,
  handles: Map<string, string>,
): PublicMatch {
  const res = resolve(row);
  const fee = row.fee ?? 0;

  const side = (i: 0 | 1): PublicSide => {
    const sub = i === 0 ? row.p0 : row.p1;
    return {
      handle: (sub && handles.get(sub)) || null,
      name: i === 0 ? row.p0_name : row.p1_name,
      character: i === 0 ? row.p0_char : row.p1_char,
      is_agent: i === 0 ? row.p0_agent : row.p1_agent,
      rounds_won: i === 0 ? row.rounds0 : row.rounds1,
      won:
        res.outcome === "no_contest"
          ? null
          : res.outcome === "draw"
            ? null
            : res.winner_side === i,
    };
  };

  return {
    id: row.id,
    played_at: row.created_at,
    // 0 = played before ranked seasons opened (2026-07-27).
    season: seasonAt(row.created_at),
    mode: row.mode,
    rated: isRated(row),
    stakes: {
      entry_fee: fee,
      // Only a PvP match has two entries committed; a solo/arcade entry fee is
      // consumed by the house, so reporting fee×2 there would invent money.
      pot: row.mode === "wager" ? fee * 2 : fee,
      currency: "credits",
    },
    players: [side(0), side(1)],
    resolution: res,
    duration: {
      ticks: row.end_tick,
      // The sim is a fixed 60 ticks/sec — this conversion is exact, not an
      // estimate, because tick rate is part of the deterministic contract.
      seconds: Math.round(row.end_tick / 60),
    },
    verification: {
      engine: row.engine,
      state_hash: String(row.state_hash),
      verified: res.verified,
      desync_side: res.desync_side,
    },
  };
}

/**
 * Resolve AIR subjects → public handles in ONE extra query.
 *
 * The subject never leaves this function. It is used only as a map key so the
 * emitted match can name a player by `ref_code`, which is already public.
 */
async function handlesFor(rows: MatchRow[]): Promise<Map<string, string>> {
  const subs = [
    ...new Set(rows.flatMap((r) => [r.p0, r.p1]).filter((s): s is string => !!s)),
  ];
  if (subs.length === 0) return new Map();

  const { rows: profiles } = await rest<{ id: string; ref_code: string | null }>(
    "profiles",
    {
      select: "id,ref_code",
      // PostgREST `in.(...)` — quote each value so subs containing commas or
      // colons (`agent:<uuid>`) survive the filter intact.
      id: `in.(${subs.map((s) => `"${s}"`).join(",")})`,
      limit: String(subs.length),
    },
    { revalidate: 60 },
  );

  const map = new Map<string, string>();
  for (const p of profiles) if (p.ref_code) map.set(p.id, p.ref_code);
  return map;
}

export type MatchQuery = {
  limit: number;
  cursor: string | null;
  /** Filter to one mode (`wager`, `arcade`, `solo`). */
  mode?: string;
  /** Only matches involving this public handle. */
  player?: string;
  /** ISO timestamp lower bound (exclusive). */
  since?: string;
  /** Only competitively-rated matches (decided human-vs-human ranked pvp). */
  ratedOnly?: boolean;
  season?: number;
};

export async function listMatches(q: MatchQuery): Promise<{
  matches: PublicMatch[];
  next_cursor: string | null;
  has_more: boolean;
}> {
  const limit = Math.min(PAGE_MAX, Math.max(1, q.limit));

  /**
   * Every filter is composed into ONE top-level `and=(…)` group.
   *
   * PostgREST honours a single `or=` per request, and this endpoint has three
   * independent sources of disjunction (the keyset cursor, the "either side is
   * this player" test, and rated-mode narrowing). Expressing them all as
   * conjuncts inside one `and=` group — with `or(…)` nested where needed — is
   * the only composition that cannot silently drop a constraint when filters
   * are combined.
   */
  const conds: string[] = [];

  if (q.mode) conds.push(`mode.eq.${q.mode}`);
  if (q.since) conds.push(`created_at.gt.${q.since}`);

  const cur: Cursor | null = decodeCursor(q.cursor);
  if (cur) conds.push(`or${cursorFilter(cur)}`);

  if (q.ratedOnly) {
    // Mirror of migration 0021's rated rule, expressed as filters so the
    // database does the narrowing rather than shipping rows we discard.
    conds.push(
      "mode.eq.wager",
      "reason.eq.verified",
      "winner.in.(0,1)",
      "p0_agent.is.false",
      "p1_agent.is.false",
    );
  }

  if (q.player) {
    const sub = await subForHandle(q.player);
    // An unknown handle is an empty feed, not an error — a partner polling a
    // player who has not played yet should get [] and carry on.
    if (!sub) return { matches: [], next_cursor: null, has_more: false };
    // Quoted: AIR subjects can be `agent:<uuid>`, and an unquoted value would
    // let a stray separator escape into the filter grammar.
    conds.push(`or(p0.eq."${sub}",p1.eq."${sub}")`);
  }

  if (q.season) {
    const w = seasonWindow(q.season);
    conds.push(`created_at.gte.${w.start}`, `created_at.lt.${w.end}`);
  }

  const params: Record<string, string | undefined> = {
    select: MATCH_COLUMNS,
    order: "created_at.desc,id.desc",
    // Over-fetch by one: the extra row tells us whether another page exists
    // without paying for an exact count on every request.
    limit: String(limit + 1),
    and: conds.length ? `(${conds.join(",")})` : undefined,
  };

  const { rows } = await rest<MatchRow>("matches", params, { revalidate: 10 });

  const has_more = rows.length > limit;
  const page = has_more ? rows.slice(0, limit) : rows;
  const handles = await handlesFor(page);
  const last = page[page.length - 1];

  return {
    matches: page.map((r) => toPublic(r, handles)),
    next_cursor:
      has_more && last
        ? encodeCursor({ createdAt: last.created_at, id: last.id })
        : null,
    has_more,
  };
}

export async function getMatch(id: string): Promise<PublicMatch | null> {
  const { rows } = await rest<MatchRow>(
    "matches",
    { select: MATCH_COLUMNS, id: `eq.${id}`, limit: "1" },
    // A settled match is immutable, so this can cache hard.
    { revalidate: 300 },
  );
  const row = rows[0];
  if (!row) return null;
  return toPublic(row, await handlesFor([row]));
}

/** Public handle → AIR subject. Internal only; the sub is never emitted. */
export async function subForHandle(handle: string): Promise<string | null> {
  const { rows } = await rest<{ id: string }>(
    "profiles",
    { select: "id", ref_code: `eq.${handle.toUpperCase()}`, limit: "1" },
    { revalidate: 60 },
  );
  return rows[0]?.id ?? null;
}
