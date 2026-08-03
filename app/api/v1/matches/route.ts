/**
 * GET /api/v1/matches — the settled-results feed.
 *
 * This is the endpoint a tournament platform or standings service ingests. It is
 * keyset-paginated and ordered newest-first, so a consumer stores the last
 * `next_cursor` it saw and replays forward from there without ever
 * double-counting or missing a settlement.
 */

import { CACHE_LIST, PAGE_DEFAULT, PAGE_MAX } from "@/lib/api/config";
import { apiCatch, apiError, apiJson, apiOptions, clampInt } from "@/lib/api/http";
import { listMatches } from "@/lib/api/matches";
import { currentSeason } from "@/lib/api/season";

export const runtime = "nodejs";

const MODES = new Set(["wager", "arcade", "solo", "friendly"]);

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const mode = q.get("mode") ?? undefined;
  if (mode && !MODES.has(mode)) {
    return apiError(
      "bad_request",
      `Unknown mode "${mode}".`,
      `Valid modes: ${[...MODES].join(", ")}.`,
    );
  }

  const seasonRaw = q.get("season");
  let season: number | undefined;
  if (seasonRaw) {
    season =
      seasonRaw === "current" ? currentSeason() : clampInt(seasonRaw, 0, 1, 9999);
    if (!season) return apiError("bad_request", `Invalid season "${seasonRaw}".`);
  }

  try {
    const { matches, next_cursor, has_more } = await listMatches({
      limit: clampInt(q.get("limit"), PAGE_DEFAULT, 1, PAGE_MAX),
      cursor: q.get("cursor"),
      mode,
      player: q.get("player") ?? undefined,
      since: q.get("since") ?? undefined,
      ratedOnly: q.get("rated") === "true",
      season,
    });

    return apiJson(
      {
        matches,
        pagination: {
          limit: matches.length,
          next_cursor,
          has_more,
        },
      },
      { cache: CACHE_LIST },
    );
  } catch (e) {
    return apiCatch(e);
  }
}

export const OPTIONS = apiOptions;
