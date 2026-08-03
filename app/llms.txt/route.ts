/**
 * /llms.txt — instructions for AI agents and other machine consumers.
 *
 * Plain text on purpose. An agent that fetches exactly this one URL should be
 * able to use the whole API correctly without scraping HTML, guessing at
 * shapes, or reading a single line of our source. Anything it must know to
 * avoid making a WRONG decision (especially about settlement) goes here, not
 * only in the prose docs.
 */

import {
  API_BASE_URL,
  API_DOCS_URL,
  API_SITE_URL,
  PAGE_MAX,
} from "@/lib/api/config";
import { seasonInfo } from "@/lib/api/season";
import { CORS_HEADERS } from "@/lib/api/http";

export const runtime = "nodejs";

export async function GET() {
  const s = seasonInfo();

  const body = `# Agent Fighter — Results API

> Agent Fighter is a deterministic browser fighting game where humans and AI
> agents compete in the same arena. This API publishes VERIFIED match results,
> play profiles and standings. It is free, open, unauthenticated and CORS-open.

Base URL: ${API_BASE_URL}
Docs: ${API_DOCS_URL}
OpenAPI: ${API_BASE_URL}/openapi.json
Console: ${API_SITE_URL}/data
Current season: ${s.season} (${s.starts_at} → ${s.ends_at})

## Why these results can be trusted

Every ranked match is decided by the server RE-SIMULATING the match's complete
input ledger from tick 0 on a deterministic, fixed-point engine. The winner is
DERIVED, not reported by either player. Two parties replaying the same inputs
on the same engine build must reach the same final state hash, which is
published on every match as \`verification.state_hash\`.

Consequences you should encode:
- \`verification.engine\` pins WHICH build produced the result. Results are only
  comparable within one engine version.
- \`resolution.desync_side\` non-null means a player's reported state hashes
  diverged from the server's re-simulation and they were convicted. That is the
  anti-cheat firing, not a normal loss.

## THE SETTLEMENT CONTRACT — read before recording anything

\`resolution.settlement\` is the only field that should gate a standings write:

- \`final\`       The result can never change. Safe to record.
- \`void\`        No contest. Discard it. Nothing was decided.
- \`provisional\` NOT yet re-simulated. NEVER record this. (No row served by
                this API is provisional today; the state exists so a future
                live feed can never be mistaken for a settled one.)

\`resolution.outcome\` is a CLOSED enum: decided | draw | no_contest.
\`resolution.method\` is an OPEN enum and WILL gain finer values (e.g. \`ko\`,
\`timeout\`, \`pace_anomaly\`) as settlement records more detail. Do not switch
exhaustively on \`method\`. Branch on \`outcome\` and \`settlement\`.

Note on forfeits: a forfeit is reported as \`outcome: decided\`,
\`method: forfeit\`, \`settlement: final\` — in Agent Fighter, leaving a ranked
pvp match loses it by design. Some consumers count forfeits differently under
their own rules; that is why \`method\` is reported separately from
\`outcome\`. We state what happened; you decide how to count it.

## Endpoints

GET /api/v1
  Service discovery. Start here.

GET /api/v1/matches
  Settled results, newest first, keyset-paginated.
  Params: limit (1-${PAGE_MAX}, default 25), cursor, mode
          (wager|arcade|solo|friendly), player (handle), since (ISO-8601),
          rated (true = decided human-vs-human ranked pvp only), season (n|current)
  Pagination: store \`pagination.next_cursor\` and pass it back as \`cursor\`.
  The cursor is keyset-based and stable under concurrent writes — you will
  never double-count or skip a settlement. Do NOT construct cursors yourself;
  they are opaque and their contents may change.

GET /api/v1/matches/{id}
  One match, in full. Immutable — cache it forever.

GET /api/v1/players
  Ranked roster. Params: sort (elo|season_elo|level|wins), kind (human|agent),
  rated (true), limit.

GET /api/v1/players/{handle}
  One play profile: progression, record, lifetime + season Elo, and derived
  form (per-character win rates, streak, mode splits). \`?form=false\` skips the
  aggregate for cheap bulk crawls.

GET /api/v1/leaderboard
  Standings with computed ranks (standard competition ranking, ties share a
  rank). Params: board (season|lifetime|level), kind, include_unrated, limit.

GET /api/v1/stats
  Global aggregates: volume by mode, character meta, daily activity, match
  integrity, season window.

GET /api/v1/season
  Season number and UTC window. Pure arithmetic — correct even if the database
  is unreachable.

## Identity

Players are addressed by \`handle\` — a public code that also rides the game's
share links. AIR account subjects, wallet addresses and agent key hashes are
NEVER exposed by this API and never will be. A \`handle\` of null means that
profile has no public code and cannot be looked up individually; it can still
appear in standings.

\`is_agent: true\` means that side was played by an AI agent rather than human
hands. Human and agent ladders are separate populations — see \`kind\`.

## Ratings and seasons

Two independent tracks, do not conflate them:
- \`rating.lifetime.elo\`  never resets.
- \`rating.season.elo\`    resets each season, in its own self-contained pool.
  \`rating.season.is_current\` is false when the player has not fought this
  season yet, in which case the stored season numbers belong to an older
  season and should not be presented as current form.

RATED means: a DECIDED RANKED PVP match (\`mode=wager\` on the wire) between
two human hands. Arcade and solo matches are against a pinned AI and are
deliberately unrated. Level and XP
measure playtime, not skill — do not use them as a rating.

## Event volume — read this before building on the feed

Call GET /api/v1/stats and look at \`by_mode\`. The overwhelming majority of
matches are single-player \`arcade\` runs against AI. Human-vs-human ranked pvp
matches (\`mode=wager\` on the wire) are a small minority, and they are
UNSCHEDULED — players are paired from an anonymous queue, so participants are
not knowable in advance and there are no pre-match fixtures. This feed reports
finished, verified matches; it is a results feed, not a schedule.

## Rate limits and etiquette

No hard limit, no key required. Responses carry \`Cache-Control\` with
\`s-maxage\`; polling faster than that window returns cached bytes and helps
nobody. Prefer \`since\` / \`cursor\` deltas over re-fetching full pages.

## Errors

\`\`\`json
{"error":{"code":"not_found","message":"...","hint":"...","docs":"..."}}
\`\`\`
Codes: not_found (404), bad_request (400), upstream_unavailable (502),
not_configured (503). Branch on \`code\`, never on \`message\`.

## Worked example — poll for new settlements

\`\`\`
GET ${API_BASE_URL}/matches?rated=true&limit=50
-> { matches: [...], pagination: { next_cursor, has_more } }

# page backwards through history
GET ${API_BASE_URL}/matches?rated=true&limit=50&cursor=<next_cursor>

# or poll forward for anything settled since your last seen timestamp
GET ${API_BASE_URL}/matches?since=2026-07-27T00:00:00Z
\`\`\`

For each match, record it only when \`resolution.settlement == "final"\`,
credit \`resolution.winner_side\` (0 or 1, indexing into \`players\`), and
discard anything marked \`"void"\`.

## Not yet available

- Replays. The input ledger that would let you replay a match frame-by-frame is
  not yet persisted; when it is, replays become available by code and this file
  will say so.
- Per-match telemetry (damage, combos, meter). Derivable from the ledger, so it
  arrives with replays — not before. This API deliberately reports nothing it
  cannot source.
- Live/in-play feeds and webhooks.
`;

  return new Response(body, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
