"use client";

import { auraLines, auraPct, AURA_LABELS, RARITY_COLORS, RARITY_LABELS } from "@/lib/pets";
import type { OwnedPet } from "@/lib/pets";

/**
 * One owned pet. The aura is the point of the card, so it is listed in full —
 * a player must be able to see exactly what they are taking into a match, and
 * an opponent sees the same lines on the pre-fight VS card (ADR 0011 open
 * carry is only fair when it is disclosed).
 */
export default function PetCard({
  pet,
  busy,
  onEquip,
}: {
  pet: OwnedPet;
  busy: boolean;
  onEquip: (rowId: number | null) => void;
}) {
  const tint = pet.def?.tint || "#6fd3ff";
  const rarity = Math.max(1, Math.min(3, pet.rarity));
  const lines = auraLines(pet.aura);

  return (
    <li
      className={`relative flex flex-col gap-3 border p-4 transition ${
        pet.equipped
          ? "border-neon-green/70 bg-neon-green/5"
          : "border-white/12 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      {pet.equipped && (
        <span className="font-arcade absolute -top-2 left-3 bg-[#05070c] px-2 text-[7px] text-neon-green">
          EQUIPPED
        </span>
      )}

      <div className="flex items-start gap-3">
        <PetGlyph tint={tint} sprite={spriteSrc(pet)} name={pet.def?.name ?? pet.petId} />
        <div className="min-w-0 flex-1">
          <h3 className="font-arcade truncate text-[10px] text-white">
            {pet.def?.name ?? pet.petId.toUpperCase()}
          </h3>
          <p
            className="font-arcade mt-1 text-[7px]"
            style={{ color: RARITY_COLORS[rarity] }}
          >
            {RARITY_LABELS[rarity]} · {lines.length} AURA LINE
            {lines.length === 1 ? "" : "S"}
          </p>
          {pet.def?.flavor && (
            <p className="mt-2 text-[11px] leading-snug text-ink-muted">
              {pet.def.flavor}
            </p>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {lines.length === 0 && (
          <li className="text-[11px] text-ink-muted">
            Cosmetic only — this one rolled no aura.
          </li>
        )}
        {lines.map((line) => (
          <li key={line.kind} className="flex items-center gap-2">
            <span className="font-arcade w-[92px] shrink-0 text-[7px] text-ink-muted">
              {AURA_LABELS[line.kind]}
            </span>
            <span className="h-1.5 flex-1 bg-white/10">
              {/* Bar is scaled against the 8% cap, so a maxed line fills it. */}
              <span
                className="block h-full"
                style={{
                  width: `${Math.min(100, (line.amount / 80) * 100)}%`,
                  background: tint,
                }}
              />
            </span>
            <span className="font-arcade w-[46px] shrink-0 text-right text-[7px] text-white">
              +{auraPct(line.amount)}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={busy}
        onClick={() => onEquip(pet.equipped ? null : pet.rowId)}
        className={`font-arcade w-full px-3 py-2 text-[8px] transition disabled:opacity-50 ${
          pet.equipped
            ? "border border-white/20 text-ink-muted hover:border-neon-red/60 hover:text-neon-red"
            : "arcade-btn"
        }`}
      >
        {busy ? "…" : pet.equipped ? "UNEQUIP" : "EQUIP"}
      </button>
    </li>
  );
}

function spriteSrc(pet: OwnedPet): string | null {
  const first = pet.def?.sprites?.[0];
  return first ? `${gameOrigin()}/pets/${pet.petId}/${first}` : null;
}

/** Pet art lives with the game client, not this site. */
function gameOrigin(): string {
  return process.env.NEXT_PUBLIC_GAME_URL?.replace(/\/$/, "") ||
    "https://agent-fighter.vercel.app";
}

/**
 * The pet's portrait: its Studio art when it has any, otherwise a CSS echo of
 * the procedural companion the game draws — same tint, same read, so a pet
 * published ahead of its art still looks like something.
 */
function PetGlyph({
  tint,
  sprite,
  name,
}: {
  tint: string;
  sprite: string | null;
  name: string;
}) {
  return (
    <span
      className="relative grid h-16 w-16 shrink-0 place-items-center border border-white/10"
      style={{ background: `radial-gradient(circle at 50% 45%, ${tint}22, transparent 70%)` }}
    >
      {sprite ? (
        // eslint-disable-next-line @next/next/no-img-element -- cross-origin game asset, no loader
        <img
          src={sprite}
          alt={name}
          className="max-h-14 max-w-14 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <span
          className="block h-7 w-7 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 32%, #fff, ${tint} 55%, #0b0e13 100%)`,
            boxShadow: `0 0 14px ${tint}88`,
          }}
        />
      )}
    </span>
  );
}
