/**
 * GET /api/v1/openapi.json — machine-readable spec.
 *
 * Hand-written rather than generated. That is a deliberate choice: the spec is
 * part of the public contract, so it should change only when someone decides
 * it changes — not as a side effect of a refactor.
 */

import {
  API_BASE_URL,
  API_DOCS_URL,
  API_VERSION,
  CACHE_IMMUTABLE,
  PAGE_MAX,
} from "@/lib/api/config";
import { CORS_HEADERS } from "@/lib/api/http";
import { apiOptions } from "@/lib/api/http";

export const runtime = "nodejs";

const param = (
  name: string,
  description: string,
  schema: Record<string, unknown> = { type: "string" },
) => ({ name, in: "query", description, schema, required: false });

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Agent Fighter Results API",
      version: API_VERSION,
      description:
        "Free, open, unauthenticated access to verified match results, play profiles and standings for Agent Fighter.\n\n" +
        "Every ranked result is derived by re-simulating the match's full input ledger on a deterministic engine — the winner is computed, not reported. " +
        "Settle only on matches whose `resolution.settlement` is `final`; `void` is a no-contest and should refund.",
      contact: { url: API_DOCS_URL },
      license: { name: "Open access" },
    },
    servers: [{ url: API_BASE_URL }],
    paths: {
      "/": {
        get: {
          summary: "Service discovery",
          description:
            "What this API is, what it can be trusted for, and where every other endpoint lives.",
          responses: { "200": { description: "Service descriptor" } },
        },
      },
      "/matches": {
        get: {
          summary: "List settled matches",
          description:
            "Newest first, keyset-paginated. Store `pagination.next_cursor` and replay forward from it; the cursor is stable under concurrent writes.",
          parameters: [
            param("limit", `1-${PAGE_MAX}, default 25`, {
              type: "integer",
              minimum: 1,
              maximum: PAGE_MAX,
              default: 25,
            }),
            param("cursor", "Opaque cursor from a previous response"),
            param("mode", "Filter by mode", {
              type: "string",
              enum: ["wager", "arcade", "solo", "friendly"],
            }),
            param("player", "Public player handle"),
            param("since", "ISO-8601 timestamp, exclusive lower bound", {
              type: "string",
              format: "date-time",
            }),
            param("rated", "Only decided human-vs-human ranked pvp matches", {
              type: "boolean",
            }),
            param("season", "Season number, or 'current'"),
          ],
          responses: { "200": { description: "A page of matches" } },
        },
      },
      "/matches/{id}": {
        get: {
          summary: "Get one settled match",
          description: "Immutable once written; safe to cache indefinitely.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "The match" },
            "404": { description: "No settled match with that id" },
          },
        },
      },
      "/players": {
        get: {
          summary: "List players, ranked",
          parameters: [
            param("sort", "Ladder to sort by", {
              type: "string",
              enum: ["elo", "season_elo", "level", "wins"],
              default: "elo",
            }),
            param("kind", "Restrict population", {
              type: "string",
              enum: ["human", "agent"],
            }),
            param("rated", "Only players with a rated match", { type: "boolean" }),
            param("limit", `1-${PAGE_MAX}, default 50`, { type: "integer" }),
          ],
          responses: { "200": { description: "Ranked players" } },
        },
      },
      "/players/{handle}": {
        get: {
          summary: "Get a play profile",
          description:
            "Progression, record, lifetime + season ratings, and derived form (per-character win rates, streak, mode splits).",
          parameters: [
            {
              name: "handle",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            param("form", "false skips the derived aggregate", { type: "boolean" }),
          ],
          responses: {
            "200": { description: "The profile" },
            "404": { description: "No such handle" },
          },
        },
      },
      "/leaderboard": {
        get: {
          summary: "Standings",
          description:
            "`season` ranks season Elo (resets each season, its own pool). `lifetime` never resets. `level` is playtime, not skill.",
          parameters: [
            param("board", "Which ladder", {
              type: "string",
              enum: ["season", "lifetime", "level"],
              default: "season",
            }),
            param("kind", "Restrict population", {
              type: "string",
              enum: ["human", "agent"],
            }),
            param("include_unrated", "Include players with no rated match", {
              type: "boolean",
            }),
            param("limit", `1-${PAGE_MAX}, default 50`, { type: "integer" }),
          ],
          responses: { "200": { description: "Standings with computed ranks" } },
        },
      },
      "/stats": {
        get: {
          summary: "Global aggregates",
          description:
            "Volume by mode, character meta, daily activity, match integrity, season window. Read `by_mode` before building on this feed: it reports how much human-vs-human material actually exists.",
          responses: { "200": { description: "Aggregates" } },
        },
      },
      "/season": {
        get: {
          summary: "Season window",
          parameters: [param("season", "Season number, or 'current'")],
          responses: { "200": { description: "Season descriptor" } },
        },
      },
    },
    components: {
      schemas: {
        Resolution: {
          type: "object",
          description:
            "The settlement contract. Branch on `outcome` and `settlement` (closed enums); treat `method` as open.",
          properties: {
            outcome: { type: "string", enum: ["decided", "draw", "no_contest"] },
            settlement: {
              type: "string",
              enum: ["final", "void", "provisional"],
              description:
                "final = never changes. void = no contest, refund. provisional = not yet re-simulated, never settle on it.",
            },
            method: {
              type: "string",
              description:
                "Open enum. Currently: ko_or_timeout, desync_forfeit, forfeit, draw, no_contest.",
            },
            winner_side: {
              type: ["integer", "null"],
              enum: [0, 1, null],
            },
            verified: {
              type: "boolean",
              description:
                "True when the server derived this result by re-simulating the full ledger, rather than awarding it because a side vanished.",
            },
            desync_side: {
              type: ["integer", "null"],
              description:
                "A side whose reported state hashes diverged from the server re-simulation and was convicted. This is the anti-cheat firing.",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  enum: [
                    "not_found",
                    "bad_request",
                    "upstream_unavailable",
                    "not_configured",
                  ],
                },
                message: { type: "string" },
                hint: { type: "string" },
                docs: { type: "string" },
              },
            },
          },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": `public, max-age=0, s-maxage=${CACHE_IMMUTABLE}, stale-while-revalidate=3600`,
    },
  });
}

export const OPTIONS = apiOptions;
