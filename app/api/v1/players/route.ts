/**
 * GET /api/v1/players — the roster, ranked.
 *
 * This doubles as the leaderboard primitive: `sort` chooses which ladder you
 * are reading. `/api/v1/leaderboard` is a thin, opinionated wrapper over it.
 */

import { CACHE_LIST, PAGE_MAX } from "@/lib/api/config";
import { apiCatch, apiError, apiJson, apiOptions, clampInt } from "@/lib/api/http";
import { listPlayers, type PlayerListQuery } from "@/lib/api/players";
import { seasonInfo } from "@/lib/api/season";

export const runtime = "nodejs";

const SORTS = new Set<PlayerListQuery["sort"]>([
  "elo",
  "season_elo",
  "level",
  "wins",
]);

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const sort = (q.get("sort") ?? "elo") as PlayerListQuery["sort"];
  if (!SORTS.has(sort)) {
    return apiError(
      "bad_request",
      `Unknown sort "${sort}".`,
      `Valid sorts: ${[...SORTS].join(", ")}.`,
    );
  }

  const kindRaw = q.get("kind");
  if (kindRaw && kindRaw !== "human" && kindRaw !== "agent") {
    return apiError("bad_request", `Unknown kind "${kindRaw}".`, "Use human or agent.");
  }

  try {
    const players = await listPlayers({
      limit: clampInt(q.get("limit"), 50, 1, PAGE_MAX),
      sort,
      kind: (kindRaw as "human" | "agent" | null) ?? undefined,
      ratedOnly: q.get("rated") === "true",
    });

    return apiJson(
      { players, sort, season: seasonInfo() },
      { cache: CACHE_LIST },
    );
  } catch (e) {
    return apiCatch(e);
  }
}

export const OPTIONS = apiOptions;
