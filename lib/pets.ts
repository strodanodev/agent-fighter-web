/**
 * PETS (ADR 0011) — the landing site's half.
 *
 * Everything here talks to the MATCH SERVER, not to Supabase: the `pets` table
 * is RLS default-deny, so an inventory is only ever reachable through a
 * service-role path behind owner authentication. The AIR access token from
 * `airToken()` is that authentication, and it is the same account the game
 * signs into — which is what makes a pet equipped here show up in the next
 * match there.
 *
 * The AURA IS NOT ROLLED HERE and cannot be influenced from here. The server
 * rolls it once, at adoption, and it is fixed for the life of the pet.
 */

import { MATCH_SERVER_URL } from "./game";

/** Per-mille aura lines. 0 = this pet did not roll that line. */
export type PetAura = {
  atk: number;
  def: number;
  hpRegen: number;
  crit: number;
  energyRegen: number;
};

export type PetAuraKind = keyof PetAura;

/** A pet definition as published by the Studio into `pets/<id>/pet.json`. */
export type PetDef = {
  id: string;
  name: string;
  desc?: string;
  flavor?: string;
  tint?: string;
  sizePx?: number;
  sprites?: string[];
  fps?: number;
};

/** One pet this account owns, with the aura this individual rolled. */
export type OwnedPet = {
  rowId: number;
  petId: string;
  rarity: number;
  aura: PetAura;
  equipped: boolean;
  createdAt: string;
  def: PetDef | null;
};

export type PetsResponse = {
  cost: number;
  catalog: PetDef[];
  credits: number | null;
  pets: OwnedPet[];
};

/** Mirrors @af/core AURA_LABELS — the display name of each line. */
export const AURA_LABELS: Record<PetAuraKind, string> = {
  atk: "ATK DAMAGE",
  def: "DEFENSE",
  hpRegen: "HP REGEN",
  crit: "CRITICAL",
  energyRegen: "ENERGY REGEN",
};

/** Line order is protocol-stable (mirrors @af/core AURA_LINES). */
export const AURA_ORDER: PetAuraKind[] = [
  "atk",
  "def",
  "hpRegen",
  "crit",
  "energyRegen",
];

export const RARITY_LABELS = ["", "COMMON", "RARE", "LEGENDARY"] as const;
export const RARITY_COLORS = ["", "#cfd8e3", "#6fd3ff", "#ffd166"] as const;

/** The non-zero lines of an aura, in canonical order. */
export function auraLines(
  aura: PetAura,
): { kind: PetAuraKind; amount: number }[] {
  return AURA_ORDER.map((kind) => ({ kind, amount: aura?.[kind] ?? 0 })).filter(
    (l) => l.amount > 0,
  );
}

/** Per-mille → "4.5%" (trailing ".0" trimmed). */
export function auraPct(amount: number): string {
  return `${(amount / 10).toFixed(1).replace(/\.0$/, "")}%`;
}

class PetsError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

/**
 * The match server answers ANY unknown path with HTTP 200 and its
 * server-info JSON. So a server too old to know about pets does not 404 — it
 * returns a perfectly successful response of the wrong shape, and every
 * `body.pets.length` downstream explodes.
 *
 * Treat shape as untrusted: anything that isn't recognisably a pets payload
 * is reported as "this server has no pets endpoint", which is both true and
 * actionable. `engine`/`protocol` are the fingerprint of that info blob.
 */
function assertPetsPayload(body: unknown, path: string): void {
  const b = (body ?? {}) as Record<string, unknown>;
  if (Array.isArray(b.pets) || Array.isArray(b.catalog) || "equipped" in b || "pet" in b) {
    return;
  }
  const stale = typeof b.engine === "string" ? ` (it is running ${b.engine})` : "";
  throw new PetsError(
    `this match server has no ${path} endpoint yet${stale}`,
    501,
    "unsupported",
  );
}

async function petsFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${MATCH_SERVER_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!res.ok) {
    throw new PetsError(
      body.error || `request failed (${res.status})`,
      res.status,
      body.code,
    );
  }
  assertPetsPayload(body, path);
  return body as T;
}

export async function listPets(token: string): Promise<PetsResponse> {
  const body = await petsFetch<PetsResponse>("/pets", token);
  // Normalise the arrays so no caller has to defend itself again.
  return {
    ...body,
    catalog: Array.isArray(body.catalog) ? body.catalog : [],
    pets: Array.isArray(body.pets) ? body.pets : [],
  };
}

/**
 * Adopt one pet. `nonce` is the IDEMPOTENCY key: if the response is lost and
 * the caller retries with the same nonce, the server replays the stored grant
 * — the same pet, the same aura — and charges nothing. Never generate a fresh
 * nonce for a retry, or a dropped response becomes a second purchase.
 */
export function adoptPet(
  token: string,
  nonce: string,
): Promise<{ pet: OwnedPet; credits: number; duplicate: boolean; cost: number }> {
  return petsFetch("/pets/adopt", token, {
    method: "POST",
    body: JSON.stringify({ nonce }),
  });
}

/** Equip one pet, or `null` to fight without one. */
export function equipPet(
  token: string,
  rowId: number | null,
): Promise<{ equipped: OwnedPet | null }> {
  return petsFetch("/pets/equip", token, {
    method: "POST",
    body: JSON.stringify({ rowId }),
  });
}

export { PetsError };
