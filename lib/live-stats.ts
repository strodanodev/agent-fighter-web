import { MATCH_SERVER_URL } from "@/lib/game";

export type LiveStats = {
  /** Match server reachable and answering. */
  matchmaking: "live" | "offline";
  /** Settled matches in Supabase. */
  matches: number;
  /** Lifetime human profiles (is_agent = false). */
  players: number;
  /**
   * Registered agent accounts (profiles.is_agent) — same population that can
   * appear on the Agents leaderboard. Not ephemeral WS sockets.
   */
  agentsOnline: number;
  /** Connected sockets of any kind (humans + agents). */
  online: number;
  queued: number;
  error: string | null;
};

function supabaseConfig(): { url: string; key: string } | null {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "";
  if (!url || !key) return null;
  return { url, key };
}

/** Parse PostgREST Content-Range header (e.g. 0-0/N or * /N) into N. */
function countFromRange(header: string | null): number | null {
  if (!header) return null;
  const m = /\/(\d+|\*)$/.exec(header);
  if (!m || m[1] === "*") return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

async function countRows(
  cfg: { url: string; key: string },
  path: string,
): Promise<number | null> {
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return countFromRange(res.headers.get("content-range"));
  } catch {
    return null;
  }
}

type MatchServerStatus = {
  online?: number;
  agents?: number;
  queued?: number;
};

async function fetchMatchServer(): Promise<{
  live: boolean;
  online: number;
  agents: number;
  queued: number;
}> {
  try {
    const res = await fetch(`${MATCH_SERVER_URL}/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) {
      return { live: false, online: 0, agents: 0, queued: 0 };
    }
    const data = (await res.json()) as MatchServerStatus;
    return {
      live: true,
      online: Number(data.online) || 0,
      agents: Number(data.agents) || 0,
      queued: Number(data.queued) || 0,
    };
  } catch {
    return { live: false, online: 0, agents: 0, queued: 0 };
  }
}

/**
 * Aggregate arena pulse for the landing hero: matchmaking liveness from the
 * match server + lifetime totals from Supabase (same DB the server writes).
 */
export async function fetchLiveStats(): Promise<LiveStats> {
  const cfg = supabaseConfig();
  const [server, matches, players, agents] = await Promise.all([
    fetchMatchServer(),
    cfg ? countRows(cfg, "matches?select=id") : Promise.resolve(null),
    cfg
      ? countRows(cfg, "profiles?select=id&is_agent=eq.false")
      : Promise.resolve(null),
    cfg
      ? countRows(cfg, "profiles?select=id&is_agent=eq.true")
      : Promise.resolve(null),
  ]);

  const errors: string[] = [];
  if (!cfg) errors.push("Supabase not configured");
  else {
    if (matches === null) errors.push("matches count unavailable");
    if (players === null) errors.push("players count unavailable");
    if (agents === null) errors.push("agents count unavailable");
  }
  if (!server.live) errors.push("match server offline");

  return {
    matchmaking: server.live ? "live" : "offline",
    matches: matches ?? 0,
    players: players ?? 0,
    agentsOnline: agents ?? 0,
    online: server.online,
    queued: server.queued,
    error: errors.length ? errors.join("; ") : null,
  };
}
