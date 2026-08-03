"use client";

/**
 * THE PROFILE PAGE (ADR 0011).
 *
 * Pets are equipped HERE, on the site, and deliberately not in the game — the
 * client never nominates a pet, the match server reads whatever this page last
 * saved. That split is what keeps the aura server-authoritative: a tampered
 * game client has nothing to tamper with.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAir } from "@/components/air/AirProvider";
import SignInButton from "@/components/air/SignInButton";
import { airDisplayName, airToken } from "@/lib/air";
import { GAME_URL } from "@/lib/game";
import { adoptPet, equipPet, listPets, PetsError } from "@/lib/pets";
import type { PetsResponse } from "@/lib/pets";
import PetCard from "./PetCard";

export default function ProfileConsole() {
  const { session, handle } = useAir();
  const signedIn = session.status === "in";

  const [data, setData] = useState<PetsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyRow, setBusyRow] = useState<number | "adopt" | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  /**
   * The match server predates pets (its catch-all answers /pets with a 200
   * and server info). Not an error the player can act on — a "not live yet"
   * state, so the page says so plainly instead of showing a red failure.
   */
  const [unsupported, setUnsupported] = useState(false);

  /**
   * The in-flight adoption nonce. Held in a ref so a retry after a failed or
   * dropped request reuses the SAME key — the server replays the stored grant
   * instead of rolling (and charging for) a second pet.
   */
  const nonceRef = useRef<string | null>(null);

  const withToken = useCallback(async (): Promise<string> => {
    const token = await airToken();
    if (!token) throw new Error("session expired — sign in again");
    return token;
  }, []);

  /**
   * Resolve the token BEFORE touching state: an effect that sets state
   * synchronously cascades a render, and this runs on every sign-in.
   */
  const refresh = useCallback(async () => {
    let token: string;
    try {
      token = await withToken();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return;
    }
    setLoading(true);
    setError("");
    try {
      setData(await listPets(token));
    } catch (e) {
      if (e instanceof PetsError && e.code === "unsupported") setUnsupported(true);
      else setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [withToken]);

  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    void (async () => {
      // Awaiting FIRST is deliberate: no state is touched synchronously in the
      // effect body, so this can never cascade a render on mount.
      const token = await airToken();
      if (!alive) return;
      if (!token) {
        setError("session expired — sign in again");
        return;
      }
      setLoading(true);
      try {
        const body = await listPets(token);
        if (alive) setData(body);
      } catch (e) {
        if (!alive) return;
        if (e instanceof PetsError && e.code === "unsupported") setUnsupported(true);
        else setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [signedIn]);

  // Signing out is DERIVED, never stored: clearing `data` from an effect would
  // be a second source of truth for "is there an inventory on screen".
  const inventory = signedIn ? data : null;

  const onEquip = useCallback(
    async (rowId: number | null) => {
      setBusyRow(rowId ?? -1);
      setError("");
      try {
        await equipPet(await withToken(), rowId);
        setFlash(
          rowId === null
            ? "Pet unequipped — your next match runs clean."
            : "Equipped. It rides into your next match.",
        );
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusyRow(null);
      }
    },
    [refresh, withToken],
  );

  const onAdopt = useCallback(async () => {
    setBusyRow("adopt");
    setError("");
    nonceRef.current ??= `adopt-${crypto.randomUUID()}`;
    try {
      const res = await adoptPet(await withToken(), nonceRef.current);
      nonceRef.current = null; // settled — the next adoption is a new roll
      setFlash(
        res.duplicate
          ? "That adoption had already gone through — nothing was charged."
          : `You adopted ${res.pet.def?.name ?? res.pet.petId.toUpperCase()}.`,
      );
      await refresh();
    } catch (e) {
      // Keep the nonce on failure: retrying must never re-roll or double-charge.
      setError(
        e instanceof PetsError && e.code === "credits"
          ? `Not enough credits — an adoption costs ${inventory?.cost ?? 25} CR. Win some in the arcade.`
          : e instanceof Error
            ? e.message
            : String(e),
      );
    } finally {
      setBusyRow(null);
    }
  }, [inventory?.cost, refresh, withToken]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <section className="mx-auto max-w-5xl px-5 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-arcade text-[16px] text-white">PROFILE</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-muted">
            Your account, your pets. A pet floats behind your fighter during a
            match and passes its rolled aura to them — equip it here, then play.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {signedIn && (
            <span className="font-arcade text-[8px] text-ink-muted">
              {airDisplayName(session)}
              {handle && <span className="ml-2 text-neon-green">{handle}</span>}
            </span>
          )}
          <SignInButton />
        </div>
      </header>

      {!signedIn ? (
        <div className="mt-10 border border-white/12 bg-white/[0.02] p-8 text-center">
          <p className="font-arcade text-[10px] text-white">SIGN IN TO SEE YOUR PETS</p>
          <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink-muted">
            Pets are account bound. The same AIR account you play on owns them —
            there is no transfer, no trade, and no way to move one between
            accounts.
          </p>
          <div className="mt-6 flex justify-center">
            <SignInButton />
          </div>
        </div>
      ) : unsupported ? (
        <div className="mt-10 border border-white/12 bg-white/[0.02] p-8 text-center">
          <p className="font-arcade text-[10px] text-white">PETS AREN&apos;T LIVE YET</p>
          <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink-muted">
            The match server this site talks to is still on the build before
            pets shipped. Nothing is wrong with your account — adoption opens
            when that server is deployed.
          </p>
          <a
            href={GAME_URL}
            className="arcade-btn font-arcade mt-6 inline-block px-4 py-2 text-[8px]"
          >
            PLAY MEANWHILE
          </a>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-white/12 bg-white/[0.02] p-4">
            <div className="flex items-center gap-6">
              <Stat label="CREDITS" value={inventory?.credits ?? "—"} />
              <Stat label="PETS OWNED" value={inventory?.pets?.length ?? "—"} />
              <Stat
                label="EQUIPPED"
                value={
                  inventory?.pets?.find((p) => p.equipped)?.def?.name ??
                  (inventory ? "NONE" : "—")
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void onAdopt()}
                disabled={busyRow !== null || loading}
                className="arcade-btn arcade-btn-yellow font-arcade px-4 py-2 text-[8px] disabled:opacity-50"
              >
                {busyRow === "adopt"
                  ? "ADOPTING…"
                  : `ADOPT A PET · ${inventory?.cost ?? 25} CR`}
              </button>
              <a
                href={GAME_URL}
                className="font-arcade border border-white/20 px-3 py-2 text-[8px] text-ink-muted transition hover:border-white/50 hover:text-white"
              >
                PLAY
              </a>
            </div>
          </div>

          {error && (
            <p className="mt-4 border border-neon-red/40 bg-neon-red/5 px-4 py-3 text-[12px] text-neon-red">
              {error}
            </p>
          )}
          {flash && (
            <p className="mt-4 border border-neon-green/40 bg-neon-green/5 px-4 py-3 text-[12px] text-neon-green">
              {flash}
            </p>
          )}

          {loading && !inventory ? (
            <p className="mt-10 text-[13px] text-ink-muted">Loading your pets…</p>
          ) : inventory && (inventory.pets?.length ?? 0) === 0 ? (
            <div className="mt-10 border border-dashed border-white/15 p-10 text-center">
              <p className="font-arcade text-[10px] text-white">NO PETS YET</p>
              <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink-muted">
                Adopting rolls both the pet and its aura. Rarity decides how
                many aura lines it gets — never how strong they are, so a common
                pet can out-roll a legendary on its single line.
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inventory?.pets?.map((pet) => (
                <PetCard
                  key={pet.rowId}
                  pet={pet}
                  busy={busyRow === pet.rowId || busyRow === -1}
                  onEquip={(rowId) => void onEquip(rowId)}
                />
              ))}
            </ul>
          )}

          <p className="mt-10 border-t border-white/10 pt-6 text-[12px] leading-relaxed text-ink-muted">
            One pet at a time. Every aura line is capped at 8%, and both sides
            see each other&apos;s auras on the pre-fight card — a pet is an edge,
            not a build.
          </p>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-arcade text-[7px] text-ink-muted">{label}</p>
      <p className="font-arcade mt-1.5 text-[10px] text-white">{value}</p>
    </div>
  );
}
