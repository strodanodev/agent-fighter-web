/**
 * Referral dares ("I DARE YOU TO BEAT ME") — landing-side data access.
 *
 * A dare link is /dare/<ref_code>; stats come from the public `player_stats`
 * view (supabase/migrations/0005_referrals.sql), which covers ANY player by
 * code — the `leaderboard` view is top-100 only. Redemption itself happens
 * in the game (+25 credits each, settled by the match server); this module
 * only reads public data for the page + OG image.
 */

/** Mirrors REFERRAL_CREDITS in the match server / 0005_referrals.sql. */
export const REFERRAL_CREDITS = 25;

/** Canonical origin of THIS landing site (metadataBase for OG image URLs). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://agent-fighter-web.vercel.app";

/** Mirrors TAUNT_MAX in the game client — keeps links and OG layout sane. */
export const TAUNT_MAX = 90;

/**
 * The sender's own trash talk, carried on the link as ?t=. Free text by
 * design (their name is on it) — only whitespace and length are normalized.
 */
export function normalizeTaunt(raw: string | string[] | undefined | null): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.replace(/\s+/g, " ").trim().slice(0, TAUNT_MAX);
  return t.length >= 2 ? t : null;
}

export type DareStats = {
  id: string;
  refCode: string;
  name: string;
  isAgent: boolean;
  level: number;
  wins: number;
  losses: number;
  /** Leaderboard rank — null outside the top 100. */
  rank: number | null;
  /** Most-played character id — null before their first match. */
  mainChar: string | null;
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

/** Ref codes are stored uppercase; sanitize before hitting PostgREST. */
export function normalizeDareCode(raw: string): string | null {
  const code = decodeURIComponent(raw ?? "").trim().toUpperCase();
  return /^[A-Z0-9-]{3,40}$/.test(code) ? code : null;
}

/**
 * Look up the daring player by ref code. `null` = unknown code or Supabase
 * unavailable — the page renders a generic dare instead of failing.
 */
export async function fetchDareStats(rawCode: string): Promise<DareStats | null> {
  const code = normalizeDareCode(rawCode);
  const cfg = supabaseConfig();
  if (!code || !cfg) return null;

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/player_stats?ref_code=eq.${encodeURIComponent(code)}&limit=1`,
      {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    const row = rows?.[0];
    if (!row) return null;
    return {
      id: String(row.id ?? ""),
      refCode: String(row.ref_code ?? code),
      name: String(row.name ?? "A FIGHTER"),
      isAgent: Boolean(row.is_agent),
      level: Number(row.level ?? 1),
      wins: Number(row.wins ?? 0),
      losses: Number(row.losses ?? 0),
      rank: row.rank == null ? null : Number(row.rank),
      mainChar: row.main_char ? String(row.main_char) : null,
    };
  } catch {
    return null;
  }
}

/** "17 wins. You'd be number 18." — the math insult, zero-safe. */
export function tauntFor(stats: DareStats | null): string {
  if (!stats || stats.wins + stats.losses === 0) {
    return "Undefeated. Technically. Go ahead — say you were lagging.";
  }
  return `${stats.name.toUpperCase()} has ${stats.wins} win${stats.wins === 1 ? "" : "s"}. You'd be number ${stats.wins + 1}. Go ahead — say you were lagging.`;
}

export function winRate(stats: DareStats): number | null {
  const total = stats.wins + stats.losses;
  return total > 0 ? Math.round((stats.wins / total) * 100) : null;
}
