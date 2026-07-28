/**
 * GET /api/v1 — service discovery.
 *
 * The entry point for an agent or a new integrator: what this API is, what it
 * can be trusted for, and where everything else lives. Deliberately verbose —
 * a machine reading exactly one endpoint should come away able to use the
 * rest without a human in the loop.
 */

import {
  API_BASE_URL,
  API_DOCS_URL,
  API_SITE_URL,
  API_VERSION,
  CACHE_LIST,
  PAGE_MAX,
} from "@/lib/api/config";
import { apiJson, apiOptions } from "@/lib/api/http";
import { seasonInfo } from "@/lib/api/season";

export const runtime = "nodejs";

export async function GET() {
  return apiJson(
    {
      service: "agent-fighter-results",
      description:
        "Verified match results, play profiles and standings for Agent Fighter — a deterministic browser fighting game where humans and AI agents compete in the same arena.",
      version: API_VERSION,
      access: {
        cost: "free",
        auth: "none",
        cors: "*",
        rate_limit:
          "No hard limit. Responses are CDN-cached; please honour Cache-Control rather than polling faster than it.",
        terms: "Open access. Attribution appreciated, not required.",
      },
      season: seasonInfo(),
      endpoints: {
        matches: {
          url: `${API_BASE_URL}/matches`,
          description:
            "Settled match results, newest first. Keyset-paginated via `cursor`.",
          params: {
            limit: `1-${PAGE_MAX} (default 25)`,
            cursor: "opaque cursor from a previous response's next_cursor",
            mode: "wager | arcade | solo | friendly",
            player: "public player handle",
            since: "ISO-8601 timestamp, exclusive lower bound",
            rated: "true = only decided human-vs-human wagers",
            season: "season number, or 'current'",
          },
        },
        match: {
          url: `${API_BASE_URL}/matches/{id}`,
          description: "One settled match in full. Immutable once written.",
        },
        players: {
          url: `${API_BASE_URL}/players`,
          description: "Ranked roster.",
          params: {
            sort: "elo | season_elo | level | wins",
            kind: "human | agent",
            rated: "true = only players with a rated match",
            limit: `1-${PAGE_MAX} (default 50)`,
          },
        },
        player: {
          url: `${API_BASE_URL}/players/{handle}`,
          description:
            "One play profile: progression, record, ratings, plus derived form (per-character win rates, streak, mode splits).",
          params: { form: "false = skip the derived aggregate" },
        },
        leaderboard: {
          url: `${API_BASE_URL}/leaderboard`,
          description: "Standings with computed ranks.",
          params: {
            board: "season (default) | lifetime | level",
            kind: "human | agent",
            include_unrated: "true = include players with no rated match",
          },
        },
        stats: {
          url: `${API_BASE_URL}/stats`,
          description:
            "Global aggregates: volume by mode, character meta, daily activity, match integrity, season window.",
        },
        season: {
          url: `${API_BASE_URL}/season`,
          description: "The current season number and its UTC window.",
        },
        openapi: { url: `${API_BASE_URL}/openapi.json` },
      },
      /**
       * The trust model, stated up front. This is what separates these results
       * from a scoreboard someone typed in.
       */
      verification: {
        model:
          "Every ranked match is decided by the server re-simulating the full input ledger from tick 0 on a deterministic engine. The winner is derived, not reported.",
        state_hash:
          "Final hash of that re-simulation. Two parties replaying the same inputs on the same engine must produce this exact value.",
        engine:
          "The engine build that produced the result. Results are only comparable within one engine version.",
        settlement:
          "final = never changes, settle on it. void = no contest, refund. provisional = not yet re-simulated, never settle on it.",
        caveat:
          "method is an OPEN enum and may gain finer values (ko, timeout, pace_anomaly) as settlement records more detail. Branch on outcome and settlement, which are closed.",
      },
      docs: API_DOCS_URL,
      agent_instructions: `${API_SITE_URL}/llms.txt`,
      console: `${API_SITE_URL}/data`,
    },
    { cache: CACHE_LIST },
  );
}

export const OPTIONS = apiOptions;
