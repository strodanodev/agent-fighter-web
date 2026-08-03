/**
 * GET /api/v1/stats — global aggregates: volume, character meta, activity,
 * match integrity, and the current season window.
 *
 * Also the honest place to read EVENT VOLUME before building on this feed.
 * `by_mode` tells a would-be consumer exactly how much human-vs-human material
 * exists versus single-player arcade traffic, which is a very different number.
 */

import { CACHE_LIVE } from "@/lib/api/config";
import { apiCatch, apiJson, apiOptions } from "@/lib/api/http";
import { getGlobalStats } from "@/lib/api/stats";

export const runtime = "nodejs";

export async function GET() {
  try {
    return apiJson({ stats: await getGlobalStats() }, { cache: CACHE_LIVE });
  } catch (e) {
    return apiCatch(e);
  }
}

export const OPTIONS = apiOptions;
