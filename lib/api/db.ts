/**
 * Thin PostgREST reader + keyset pagination.
 *
 * Deliberately not the supabase-js client: this service only ever issues
 * anonymous GETs against two public-read tables, and a `fetch` wrapper keeps
 * the marketing site's bundle free of a database SDK it would otherwise ship
 * to no purpose.
 */

import { supabaseConfig } from "./config";

export class DbUnavailable extends Error {}
export class DbNotConfigured extends Error {}

/**
 * Run a PostgREST query.
 *
 * `exact` count is opt-in per call: it makes Postgres do a full count, which
 * is fine on tables this size but pointless on a cursor-paginated feed where
 * nobody reads the total. Ask for it only where the number is displayed.
 */
export async function rest<T>(
  table: string,
  params: Record<string, string | undefined>,
  opts: { count?: "exact"; revalidate?: number } = {},
): Promise<{ rows: T[]; total: number | null }> {
  const cfg = supabaseConfig();
  if (!cfg) throw new DbNotConfigured("Supabase is not configured");

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) qs.set(k, v);

  const headers: Record<string, string> = {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
    Accept: "application/json",
  };
  if (opts.count) headers.Prefer = `count=${opts.count}`;

  let res: Response;
  try {
    res = await fetch(`${cfg.url}/rest/v1/${table}?${qs}`, {
      headers,
      // Next's own fetch cache sits UNDER the CDN cache. A short window here
      // collapses duplicate upstream reads during a burst; the CDN header set
      // in http.ts is what actually protects Supabase egress.
      next: { revalidate: opts.revalidate ?? 10 },
    });
  } catch (e) {
    throw new DbUnavailable(`upstream fetch failed: ${String(e)}`);
  }

  if (!res.ok) {
    throw new DbUnavailable(`upstream ${res.status}: ${await res.text()}`);
  }

  const rows = (await res.json()) as T[];
  return { rows, total: countFromRange(res.headers.get("content-range")) };
}

/** Parse PostgREST's `0-24/812` range header into the total. */
function countFromRange(header: string | null): number | null {
  if (!header) return null;
  const m = /\/(\d+|\*)$/.exec(header);
  if (!m || m[1] === "*") return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

// ------------------------------------------------------------------ cursors

/**
 * Keyset (not offset) pagination on `(created_at, id)`.
 *
 * Offset pagination is wrong for a results feed: new matches land at the head
 * constantly, so page 2 of an offset scan silently repeats or skips rows the
 * moment anything settles mid-crawl. A keyset cursor is stable under writes,
 * which is exactly what an ingest job replaying from its last-seen position
 * needs.
 *
 * The cursor is opaque base64url on purpose — partners must not build logic on
 * its internals, so we keep the freedom to change the sort key later.
 */
export type Cursor = { createdAt: string; id: string };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(`${c.createdAt}|${c.id}`, "utf8").toString("base64url");
}

export function decodeCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  try {
    const text = Buffer.from(raw, "base64url").toString("utf8");
    const sep = text.lastIndexOf("|");
    if (sep <= 0) return null;
    const createdAt = text.slice(0, sep);
    const id = text.slice(sep + 1);
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

/**
 * The PostgREST `or=` filter implementing "strictly older than the cursor".
 *
 * The tie-breaker on `id` matters more than it looks: two matches settling in
 * the same microsecond would otherwise be split across a page boundary, and
 * one of them would never be delivered to a paginating consumer.
 */
export function cursorFilter(c: Cursor): string {
  return `(created_at.lt.${c.createdAt},and(created_at.eq.${c.createdAt},id.lt.${c.id}))`;
}
