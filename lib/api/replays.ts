/**
 * Replay access — the ONE authenticated, service-role corner of this API.
 *
 * Everything else here is open, anonymous and read-only. Replays are not:
 * `match_ledgers` is RLS default-deny, so the anon key the public feed runs on
 * cannot see a single row, and watching one requires signing in. That is a
 * product decision (the owner's), and the schema enforces it rather than
 * trusting this layer to remember.
 *
 * Two consequences, both deliberate:
 *
 *  1. This module uses the SERVICE key, which bypasses RLS. It is therefore
 *     kept apart from `lib/api/db.ts` — that module refuses the service key
 *     outright so a bug in the public feed can never read more than anon can.
 *     Mixing them would throw that guarantee away for every endpoint at once.
 *
 *  2. Authentication is delegated to the MATCH SERVER's `/me`, rather than
 *     verifying AIR's ES256 JWT here. The match server already does that
 *     properly — JWKS fetch, both prod and sandbox issuers, aud/iss checks —
 *     and a second, subtly-different verifier is exactly how auth bugs are
 *     born. The cost is one extra hop on a button click; the benefit is that
 *     there is still only one implementation of "is this AIR token real".
 */

import { MATCH_SERVER_URL } from "@/lib/game";

/** Origin serving `characters/` and `stages/` for the player to draw with. */
export const REPLAY_ASSET_BASE =
  process.env.NEXT_PUBLIC_GAME_URL?.replace(/\/$/, "") ||
  "https://agent-fighter.vercel.app";

export type ReplayRow = {
  match_id: string;
  ledger: string;
  pin: Record<string, unknown>;
  engine: string;
  protocol: number;
  codec_version: number;
  ticks: number;
  digest: string;
  created_at: string;
};

export class NotAuthenticated extends Error {}
export class ReplayUnavailable extends Error {}

/**
 * Confirm the caller holds a real AIR session.
 *
 * Returns the account's public handle when the match server recognises the
 * token. `?name=` is intentionally empty — `/me` treats an empty name as
 * "keep whatever the profile has", and a replay view must never be able to
 * rename someone's account as a side effect.
 */
export async function requireAirSession(
  authorization: string | null,
): Promise<{ handle: string | null }> {
  const token = /^Bearer\s+(.+)$/i.exec(authorization ?? "")?.[1];
  if (!token) throw new NotAuthenticated("missing bearer token");

  let res: Response;
  try {
    res = await fetch(`${MATCH_SERVER_URL}/me?name=`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    // The verifier being unreachable is NOT permission to proceed.
    throw new ReplayUnavailable("could not reach the identity service");
  }
  if (res.status === 401 || res.status === 403) {
    throw new NotAuthenticated("sign-in required");
  }
  if (!res.ok) throw new ReplayUnavailable(`identity service ${res.status}`);

  const body = (await res.json().catch(() => ({}))) as { refCode?: string };
  return { handle: body.refCode ?? null };
}

/** Read one ledger with the service key. Null = no ledger stored for that id. */
export async function getReplay(matchId: string): Promise<ReplayRow | null> {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_KEY || "";
  if (!url || !key) throw new ReplayUnavailable("replay storage not configured");

  const res = await fetch(
    `${url}/rest/v1/match_ledgers?select=*&match_id=eq.${encodeURIComponent(matchId)}&limit=1`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new ReplayUnavailable(`storage ${res.status}`);
  const rows = (await res.json()) as ReplayRow[];
  return rows[0] ?? null;
}
