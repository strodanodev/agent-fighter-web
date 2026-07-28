/**
 * GET /api/v1/players/{handle} — a play profile.
 *
 * `handle` is the player's public code (the same code that rides dare/share
 * links). AIR subjects are never accepted or emitted here.
 *
 * `?form=false` skips the derived aggregate, which costs an extra query over
 * the player's match history — worth skipping for a bulk crawl that only
 * wants ratings.
 */

import { CACHE_LIST } from "@/lib/api/config";
import { apiCatch, apiError, apiJson, apiOptions } from "@/lib/api/http";
import { subForHandle } from "@/lib/api/matches";
import { getPlayer, getPlayerForm } from "@/lib/api/players";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ handle: string }> },
) {
  const { handle } = await ctx.params;
  const wantForm = new URL(req.url).searchParams.get("form") !== "false";

  try {
    const player = await getPlayer(handle);
    if (!player) {
      return apiError(
        "not_found",
        `No player with handle "${handle}".`,
        "Handles are the public codes listed in GET /api/v1/players.",
      );
    }

    if (!wantForm) return apiJson({ player }, { cache: CACHE_LIST });

    // The subject is resolved server-side purely to query the match table by
    // it; it is never part of the response.
    const sub = await subForHandle(handle);
    const form = sub ? await getPlayerForm(sub) : null;

    return apiJson({ player, form }, { cache: CACHE_LIST });
  } catch (e) {
    return apiCatch(e);
  }
}

export const OPTIONS = apiOptions;
