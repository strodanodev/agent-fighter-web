/**
 * GET /api/v1/season — the current season and its UTC window.
 *
 * Seasons are pure arithmetic over a fixed epoch (no season table, no cron),
 * so this endpoint is a computation, not a query — it stays correct even if
 * the database is unreachable.
 */

import { CACHE_LIVE } from "@/lib/api/config";
import { apiError, apiJson, apiOptions } from "@/lib/api/http";
import { currentSeason, seasonInfo, seasonWindow } from "@/lib/api/season";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("season");
  const n = raw && raw !== "current" ? Number(raw) : currentSeason();

  if (!Number.isInteger(n) || n < 1) {
    return apiError("bad_request", `Invalid season "${raw}".`);
  }

  const current = currentSeason();
  const w = seasonWindow(n);

  return apiJson(
    {
      season: {
        season: n,
        starts_at: w.start,
        ends_at: w.end,
        is_current: n === current,
        status: n < current ? "closed" : n === current ? "open" : "scheduled",
      },
      current: seasonInfo(),
    },
    { cache: CACHE_LIVE },
  );
}

export const OPTIONS = apiOptions;
