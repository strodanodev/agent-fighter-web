/**
 * GET /api/v1/leaderboard — standings.
 *
 * Two ladders, and the distinction is the whole point:
 *  · `board=season` (default) ranks SEASON Elo, reset each season, in its own
 *    self-contained pool. This is the competitive ladder.
 *  · `board=lifetime` ranks lifetime Elo, which never resets.
 *  · `board=level` ranks progression (playtime), which is NOT skill and is
 *    offered only because it is what the in-game board has always shown.
 *
 * Ranks are computed here rather than read from the `leaderboard` view: that
 * view ranks on level/xp and exposes the AIR subject, neither of which belongs
 * in a public competitive feed.
 */

import { CACHE_LIST, PAGE_MAX } from "@/lib/api/config";
import { apiCatch, apiError, apiJson, apiOptions, clampInt } from "@/lib/api/http";
import { listPlayers, type PublicPlayer } from "@/lib/api/players";
import { seasonInfo } from "@/lib/api/season";

export const runtime = "nodejs";

type Board = "season" | "lifetime" | "level";
const BOARDS = new Set<Board>(["season", "lifetime", "level"]);

const SORT_FOR: Record<Board, "season_elo" | "elo" | "level"> = {
  season: "season_elo",
  lifetime: "elo",
  level: "level",
};

function ratingOf(p: PublicPlayer, board: Board): number {
  if (board === "season") return p.rating.season.elo;
  if (board === "lifetime") return p.rating.lifetime.elo;
  return p.progression.level;
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const board = (q.get("board") ?? "season") as Board;
  if (!BOARDS.has(board)) {
    return apiError(
      "bad_request",
      `Unknown board "${board}".`,
      `Valid boards: ${[...BOARDS].join(", ")}.`,
    );
  }

  const kindRaw = q.get("kind");
  if (kindRaw && kindRaw !== "human" && kindRaw !== "agent") {
    return apiError("bad_request", `Unknown kind "${kindRaw}".`, "Use human or agent.");
  }

  try {
    const players = await listPlayers({
      limit: clampInt(q.get("limit"), 50, 1, PAGE_MAX),
      sort: SORT_FOR[board],
      kind: (kindRaw as "human" | "agent" | null) ?? undefined,
      // An Elo board only means anything for players who have actually been
      // rated; without this the seed rating fills the top of an empty ladder.
      ratedOnly: board !== "level" && q.get("include_unrated") !== "true",
    });

    // Standard competition ranking (1,2,2,4) — equal ratings share a rank
    // rather than being ordered by an arbitrary tiebreak the caller can't see.
    let lastRating: number | null = null;
    let lastRank = 0;
    const standings = players.map((player, i) => {
      const rating = ratingOf(player, board);
      const rank = rating === lastRating ? lastRank : i + 1;
      lastRating = rating;
      lastRank = rank;
      return { rank, rating, player };
    });

    return apiJson(
      { board, standings, season: seasonInfo() },
      { cache: CACHE_LIST },
    );
  } catch (e) {
    return apiCatch(e);
  }
}

export const OPTIONS = apiOptions;
