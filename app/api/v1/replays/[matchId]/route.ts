/**
 * GET /api/v1/replays/{matchId} — the input ledger for a match, for playback.
 *
 * SIGN-IN REQUIRED. This is the only authenticated endpoint in the v1 API, and
 * the only one that touches the service key. Send an AIR access token as
 * `Authorization: Bearer <token>`.
 *
 * Not every match has one: ledgers are stored for human-vs-human WAGER matches
 * only (ADR 0010). Arcade and solo are fought against a pinned AI and store
 * nothing, which is why a 404 here says so explicitly rather than looking like
 * a failure.
 */

import { apiError, apiJson, apiOptions, CORS_HEADERS } from "@/lib/api/http";
import {
  NotAuthenticated,
  REPLAY_ASSET_BASE,
  ReplayUnavailable,
  getReplay,
  requireAirSession,
} from "@/lib/api/replays";

export const runtime = "nodejs";
// Never cached, at any layer: the response is gated on the CALLER's identity,
// and a shared cache in front of a per-identity resource is how one user ends
// up served another user's authorisation.
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ matchId: string }> },
) {
  const { matchId } = await ctx.params;

  try {
    await requireAirSession(req.headers.get("authorization"));
  } catch (e) {
    if (e instanceof NotAuthenticated) {
      return new Response(
        JSON.stringify({
          error: {
            code: "unauthorized",
            message: "Sign in with AIR to watch replays.",
            docs: "https://agent-fighter-web.vercel.app/docs/api",
          },
        }),
        {
          status: 401,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
      );
    }
    return apiError(
      "upstream_unavailable",
      "Could not verify your session. Try again shortly.",
    );
  }

  try {
    const row = await getReplay(matchId);
    if (!row) {
      return apiError(
        "not_found",
        `No replay stored for match "${matchId}".`,
        "Ledgers are kept for human-vs-human wager matches only — arcade and solo matches are fought against a pinned AI and store none.",
      );
    }

    return apiJson(
      {
        replay: {
          match_id: row.match_id,
          ledger: row.ledger,
          pin: row.pin,
          engine: row.engine,
          protocol: row.protocol,
          codec_version: row.codec_version,
          ticks: row.ticks,
          seconds: Math.round(row.ticks / 60),
          digest: row.digest,
          recorded_at: row.created_at,
          /** Where the player fetches character art from. */
          asset_base: REPLAY_ASSET_BASE,
        },
      },
      { cache: 0 },
    );
  } catch (e) {
    if (e instanceof ReplayUnavailable) {
      console.error("[replays]", e.message);
      return apiError("upstream_unavailable", "Replay storage is unavailable.");
    }
    console.error("[replays] unhandled:", e);
    return apiError("upstream_unavailable", "Could not load that replay.");
  }
}

export const OPTIONS = apiOptions;
