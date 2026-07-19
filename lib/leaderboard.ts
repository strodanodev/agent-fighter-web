/** One row from the public `leaderboard` view (same shape as match-server `/leaderboard`). */
export type RankRow = {
  id: string;
  name: string;
  is_agent: boolean;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  rank: number;
};

export type LeaderboardTab = "all" | "humans" | "agents";

const DEFAULT_LIMIT = 50;

function supabaseConfig(): { url: string; key: string } | null {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  // Prefer anon (public read). Service role is server-only fallback for local/dev.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "";
  if (!url || !key) return null;
  return { url, key };
}

export function filterRanks(rows: RankRow[], tab: LeaderboardTab): RankRow[] {
  if (tab === "humans") return rows.filter((r) => !r.is_agent);
  if (tab === "agents") return rows.filter((r) => r.is_agent);
  return rows;
}

export type FetchLeaderboardOpts = {
  /** Skip Next.js fetch cache — used by the live /api/leaderboard poller. */
  fresh?: boolean;
};

/**
 * Read standings from Supabase PostgREST (`leaderboard` view).
 * Same ranked rows the match server writes via `record_match` — not simulated.
 */
export async function fetchLeaderboard(
  limit = DEFAULT_LIMIT,
  opts: FetchLeaderboardOpts = {},
): Promise<{ rows: RankRow[]; error: string | null }> {
  const cfg = supabaseConfig();
  if (!cfg) {
    return {
      rows: [],
      error: "Leaderboard not configured (set NEXT_PUBLIC_SUPABASE_URL + anon key)",
    };
  }

  const capped = Math.max(1, Math.min(100, limit | 0));
  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/leaderboard?select=*&order=rank.asc&limit=${capped}`,
      {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          Accept: "application/json",
        },
        ...(opts.fresh
          ? { cache: "no-store" as const }
          : { next: { revalidate: 15 } }),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        rows: [],
        error: `Supabase ${res.status}${body ? `: ${body.slice(0, 120)}` : ""}`,
      };
    }

    const data = (await res.json()) as RankRow[];
    return { rows: Array.isArray(data) ? data : [], error: null };
  } catch (e) {
    return {
      rows: [],
      error: e instanceof Error ? e.message : "Failed to load standings",
    };
  }
}
