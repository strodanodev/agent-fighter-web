/**
 * GET /api/v1/matches/{id} — one settled match, in full.
 *
 * A settled match is immutable: `record_match` is idempotent by match id and
 * never updates a row it already wrote. So this response caches hard, and a
 * consumer may treat a 200 here as permanent.
 */

import { CACHE_IMMUTABLE } from "@/lib/api/config";
import { apiCatch, apiError, apiJson, apiOptions } from "@/lib/api/http";
import { getMatch } from "@/lib/api/matches";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  try {
    const match = await getMatch(id);
    if (!match) {
      return apiError(
        "not_found",
        `No settled match with id "${id}".`,
        "Match ids appear in GET /api/v1/matches. A match that is still in progress has no record yet.",
      );
    }
    return apiJson({ match }, { cache: CACHE_IMMUTABLE });
  } catch (e) {
    return apiCatch(e);
  }
}

export const OPTIONS = apiOptions;
