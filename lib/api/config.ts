/**
 * Agent Fighter public API — shared configuration.
 *
 * The API is OPEN: free, unauthenticated, CORS-open, read-only. It exists so
 * third-party developers, esports organisers, tournament platforms and
 * analytics tools can consume verified match results without asking anyone
 * for a key. Sign-in (AIR) gates only the *personal* surfaces (your own
 * profile tooling), never the public feed.
 *
 * It is served from the MARKETING SITE on purpose, not from the match server.
 * The match server is a single-threaded process whose event loop is the hot
 * path for live fights and whose settlement re-simulation already blocks it —
 * putting a crawlable, pollable read API on it would add latency to real
 * matches. Vercel gives us CDN caching in front of Supabase instead, which is
 * also what keeps the whole thing inside the Supabase free tier (see CACHE_*).
 */

/** Wire version. Breaking changes ship as /api/v2, never as edits to v1. */
export const API_VERSION = "1";

/** Canonical public base for docs + self-referencing links. */
export const API_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://agent-fighter-web.vercel.app"
).replace(/\/$/, "");

export const API_BASE_PATH = `/api/v${API_VERSION}`;
export const API_BASE_URL = `${API_SITE_URL}${API_BASE_PATH}`;
export const API_DOCS_URL = `${API_SITE_URL}/docs/api`;

/** Page sizes. `MAX` is a hard clamp — an unbounded feed is a free-tier bill. */
export const PAGE_DEFAULT = 25;
export const PAGE_MAX = 100;

/**
 * CDN cache windows (seconds).
 *
 * These are the single most important numbers in the whole API. Supabase's
 * free plan allows roughly 5 GB of egress a month; ten partners polling a
 * 50 KB snapshot every 5 seconds is ~260 GB. Vercel's edge absorbs that only
 * if we actually let it — so every response carries an explicit
 * `s-maxage` + `stale-while-revalidate`, and Supabase only ever sees a cache
 * miss. Combined with the delta-shaped /events feed this lands ~0.5 GB/month.
 *
 * `SWR` is deliberately long: a stale-by-a-minute result page is fine, and it
 * means a Supabase blip never becomes an API outage.
 */
export const CACHE_LIVE = 10; // things that move constantly (stats, events)
export const CACHE_LIST = 30; // match lists, leaderboards
export const CACHE_IMMUTABLE = 300; // a settled match never changes
export const CACHE_SWR = 300;

/**
 * PostgREST connection for the PUBLIC API.
 *
 * ANON KEY ONLY — the service-role key is deliberately not a fallback here,
 * even though other parts of this site accept it. The service role BYPASSES
 * RLS, which would make our hand-written column projections the *only* thing
 * standing between a query bug and a full dump of `profiles` (wallet
 * addresses, coach-key hashes, agent ownership). Running the open, crawlable,
 * unauthenticated feed on the anon key keeps RLS as a second line of defence,
 * so a mistake in this codebase degrades to "returns nothing" instead of
 * "returns everything".
 *
 * Even on the anon key, nothing here may `select=*` on profiles: RLS allows
 * reading whole rows, so column safety is still ours to enforce (see
 * PROFILE_PUBLIC_COLUMNS). Belt and braces, on purpose.
 */
export function supabaseConfig(): { url: string; key: string } | null {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  return { url, key };
}

/**
 * The ONLY profile columns that may leave this service.
 *
 * Excluded on purpose and permanently:
 *  · `id`             — the AIR subject (an identity secret in effect). The
 *                       public identifier is `ref_code`, which already rides
 *                       share links and is safe to publish.
 *  · `address`        — the AIR smart-account wallet.
 *  · `agent_key_hash` — coach-key material.
 *  · `owner_sub`      — links an agent to the human who operates it.
 *  · `last_daily`     — login-time telemetry, nobody's business.
 */
export const PROFILE_PUBLIC_COLUMNS = [
  "ref_code",
  "name",
  "is_agent",
  "level",
  "xp",
  "wins",
  "losses",
  "credits",
  "elo",
  "rated",
  "season_elo",
  "season_rated",
  "season",
  "created_at",
] as const;
