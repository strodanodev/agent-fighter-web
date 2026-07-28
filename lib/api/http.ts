/**
 * Response plumbing for the public API: one envelope, one error shape, one
 * place that decides caching and CORS.
 *
 * Every consumer of this API is a machine — a betting platform's ingest job,
 * an esports bracket engine, an AI agent reading /llms.txt. So the contract is
 * boring on purpose: snake_case keys everywhere (matching the database and the
 * conventions of every odds feed), an envelope that never changes shape, and
 * errors that are machine-branchable by `code` rather than by parsing prose.
 */

import { API_VERSION, API_DOCS_URL, CACHE_SWR } from "./config";
import { DbNotConfigured, DbUnavailable } from "./db";

/**
 * CORS is wide open because the API is public and read-only. There are no
 * cookies, no credentials, and no mutating verbs, so `*` costs nothing —
 * and it lets a partner call this straight from a browser dashboard.
 */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export type ApiMeta = {
  api_version: string;
  generated_at: string;
  [k: string]: unknown;
};

export type Pagination = {
  limit: number;
  next_cursor: string | null;
  has_more: boolean;
};

/** Machine-branchable error codes. Stable — treat as part of the contract. */
export type ApiErrorCode =
  | "not_found"
  | "bad_request"
  | "upstream_unavailable"
  | "not_configured";

const STATUS_FOR: Record<ApiErrorCode, number> = {
  not_found: 404,
  bad_request: 400,
  upstream_unavailable: 502,
  not_configured: 503,
};

function cacheHeader(seconds: number): string {
  // `public` so the Vercel edge stores it; `s-maxage` is the CDN window while
  // `max-age=0` keeps browsers honest; SWR means a slow upstream serves stale
  // rather than failing. This is the whole free-tier egress strategy.
  if (seconds <= 0) return "no-store";
  return `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${CACHE_SWR}`;
}

export function apiJson(
  body: Record<string, unknown>,
  opts: { cache?: number; status?: number; meta?: Record<string, unknown> } = {},
): Response {
  const meta: ApiMeta = {
    api_version: API_VERSION,
    generated_at: new Date().toISOString(),
    ...(opts.meta ?? {}),
  };
  return Response.json(
    { ...body, meta },
    {
      status: opts.status ?? 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": cacheHeader(opts.cache ?? 0),
        "X-Api-Version": API_VERSION,
      },
    },
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  hint?: string,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(hint ? { hint } : {}),
        docs: API_DOCS_URL,
      },
    },
    {
      status: STATUS_FOR[code],
      headers: {
        ...CORS_HEADERS,
        // Never cache an error: a 502 from a Supabase blip must not pin
        // itself into the CDN for five minutes.
        "Cache-Control": "no-store",
        "X-Api-Version": API_VERSION,
      },
    },
  );
}

/** Preflight. Every route re-exports this so browsers can call us directly. */
export function apiOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Turn a thrown error into the right response.
 *
 * Upstream failures are reported as 502/503 with a stable code so an ingest
 * job can distinguish "retry in a moment" from "you asked for something that
 * does not exist". The underlying message is logged, never echoed: it can
 * contain the PostgREST URL and query, which is nobody's business.
 */
export function apiCatch(e: unknown): Response {
  if (e instanceof DbNotConfigured) {
    return apiError(
      "not_configured",
      "The results database is not configured for this deployment.",
    );
  }
  if (e instanceof DbUnavailable) {
    console.error("[api] upstream unavailable:", e.message);
    return apiError(
      "upstream_unavailable",
      "The results database is temporarily unavailable. Retry shortly.",
    );
  }
  console.error("[api] unhandled:", e);
  return apiError("upstream_unavailable", "Unexpected error serving this request.");
}

/** Clamp a caller-supplied integer into a sane range. */
export function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
