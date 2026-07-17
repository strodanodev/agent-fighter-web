import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchDareStats, REFERRAL_CREDITS } from "@/lib/dare";

/**
 * The social thumbnail IS the rage bait — it's what lands in the group chat.
 * Per-player card: their fighter, their record, and either the default
 * accusation ("THEY THINK YOU'LL LOSE.") or the sender's own taunt (?t= on
 * the share link, chosen/written on the in-game invite screen).
 *
 * Shared by the /dare/[code] opengraph-image convention (no taunt) and the
 * /dare/[code]/og route handler (taunt via query — the convention file
 * never sees searchParams).
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "I DARE YOU TO BEAT ME — Agent Fighter";

const PORTRAIT_IDS = new Set([
  "0xzero", "analog", "bato", "blaze", "elon", "gbush",
  "jensen", "kim", "t800", "unitree-g1", "vector", "yatsiu",
]);

/** Google Fonts TTF for satori (woff2 unsupported). Best-effort, cached. */
async function googleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
        { cache: "force-cache" },
      )
    ).text();
    const url = /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
    if (!url) return null;
    return await (await fetch(url, { cache: "force-cache" })).arrayBuffer();
  } catch {
    return null;
  }
}

async function portraitDataUri(char: string): Promise<string | null> {
  try {
    const file = await readFile(
      join(process.cwd(), "public", "characters", char, "sprites", "_select.png"),
    );
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

/** The real wordmark (lib/assets.ts LOGO_FALLBACK_SRC) instead of styled text. */
async function logoDataUri(): Promise<string | null> {
  try {
    const file = await readFile(
      join(process.cwd(), "public", "assets", "logo", "main_logo_AF.png"),
    );
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Background texture: scanlines + a faint HUD grid layered under the two
 * color blooms. The bloom-only version reads as a flat gradient in a chat
 * preview thumbnail — these give it a surface to sit on.
 */
const BG_IMAGE = [
  "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
  "repeating-linear-gradient(90deg, rgba(110,182,255,0.05) 0px, rgba(110,182,255,0.05) 1px, transparent 1px, transparent 64px)",
  "repeating-linear-gradient(0deg, rgba(110,182,255,0.05) 0px, rgba(110,182,255,0.05) 1px, transparent 1px, transparent 64px)",
  "radial-gradient(ellipse 60% 90% at 12% 60%, rgba(255,61,110,0.22), transparent 60%)",
  "radial-gradient(ellipse 60% 90% at 88% 60%, rgba(47,143,255,0.26), transparent 60%)",
].join(", ");

export async function dareOgImage(code: string, taunt?: string): Promise<ImageResponse> {
  const stats = await fetchDareStats(code);
  const name = (stats?.name ?? "A FIGHTER").toUpperCase();
  const record =
    stats && stats.wins + stats.losses > 0
      ? `${stats.wins}–${stats.losses}`
      : "UNDEFEATED*";
  const rank = stats?.rank ? ` · RANK #${stats.rank}` : "";
  const char =
    stats?.mainChar && PORTRAIT_IDS.has(stats.mainChar) ? stats.mainChar : "blaze";

  const [russo, chakra, portrait, logo] = await Promise.all([
    googleFont("Russo One", 400),
    googleFont("Chakra Petch", 600),
    portraitDataUri(char),
    logoDataUri(),
  ]);

  const fonts = [
    russo && { name: "Russo One", data: russo, style: "normal" as const, weight: 400 as const },
    chakra && { name: "Chakra Petch", data: chakra, style: "normal" as const, weight: 600 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; style: "normal"; weight: 400 | 600 }[];

  // Custom taunts vary wildly in length — step the size down so satori never
  // overflows the center column.
  const tauntSize = taunt ? (taunt.length <= 40 ? 42 : taunt.length <= 70 ? 34 : 28) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#050a14",
          backgroundImage: BG_IMAGE,
          fontFamily: "Chakra Petch, sans-serif",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Agent Fighter" style={{ height: 300, objectFit: "contain" }} />
          ) : (
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 14, color: "#8eb4d8" }}>
              AGENT FIGHTER
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {/* red corner — their fighter, cropped to a profile thumbnail (the
              same head-and-shoulders card crop the roster grid uses) rather
              than a full-body cutout floating in empty space. */}
          <div style={{ width: 300, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                width: 190,
                height: 200,
                borderRadius: 10,
                overflow: "hidden",
                border: "2px solid rgba(255,61,110,0.65)",
                backgroundImage:
                  "radial-gradient(ellipse 80% 70% at 50% 100%, rgba(255,61,110,0.16), transparent 65%), linear-gradient(180deg, rgba(20,10,16,0.9), rgba(6,10,20,0.95))",
              }}
            >
              {/* contain-fit, bottom-anchored: sprite aspect ratios and
                  action poses vary too wildly across the roster for a
                  cover-crop headshot to reliably keep the head in frame
                  (the game's own portrait system needs per-character
                  authored framing to solve that — landing has no access
                  to it, so showing the whole fighter is the safe choice). */}
              {portrait ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portrait}
                  alt=""
                  style={{ maxWidth: 154, maxHeight: 184, objectFit: "contain" }}
                />
              ) : null}
              <div
                style={{
                  position: "absolute", top: 8, left: 8, display: "flex",
                  backgroundColor: "#ff3d6e", color: "#2a0512",
                  fontSize: 11, letterSpacing: 1, padding: "2px 7px", borderRadius: 3,
                }}
              >
                THEM
              </div>
            </div>
          </div>

          {/* center — the accusation (or the sender's own words) */}
          <div
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {taunt ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Russo One, sans-serif",
                    fontSize: tauntSize,
                    lineHeight: 1.12,
                    transform: "skewX(-4deg)",
                    textAlign: "center",
                  }}
                >
                  “{taunt}”
                </div>
                {/* Deliberately NOT "— {name}": the taunt is a free-text URL
                    param, so anyone could forge vile words onto another
                    player's code. The record strip below carries the
                    server-verified identity; the quote only claims the dare
                    came with a message. */}
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Russo One, sans-serif",
                    fontSize: 20,
                    color: "#ff3d6e",
                    transform: "skewX(-4deg)",
                  }}
                >
                  — SENT WITH THIS DARE
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontFamily: "Russo One, sans-serif",
                  fontSize: 58,
                  lineHeight: 1.04,
                  transform: "skewX(-4deg)",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex" }}>THEY THINK</div>
                <div style={{ display: "flex", color: "#ff3d6e" }}>
                  YOU&apos;LL LOSE.
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontFamily: "Russo One, sans-serif",
                fontSize: 26,
                color: "#ffe566",
                transform: "skewX(-8deg)",
              }}
            >
              — VS —
            </div>
          </div>

          {/* blue corner — the empty seat, same card shape as THEM so the
              layout reads as two facing profile cards, not text floating
              in a gradient. */}
          <div style={{ width: 300, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                width: 190,
                height: 200,
                borderRadius: 10,
                border: "2px dashed rgba(110,182,255,0.6)",
                backgroundImage:
                  "linear-gradient(180deg, rgba(10,21,36,0.5), rgba(6,10,20,0.65))",
              }}
            >
              <div style={{ display: "flex", fontFamily: "Russo One, sans-serif", fontSize: 52, color: "#6eb6ff" }}>
                ?
              </div>
              <div style={{ display: "flex", fontFamily: "Russo One, sans-serif", fontSize: 18, color: "#8eb4d8", letterSpacing: 2 }}>
                YOU?
              </div>
            </div>
          </div>
        </div>

        {/* bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "14px 36px",
            backgroundColor: "rgba(4,8,16,0.85)",
            borderTop: "1px solid rgba(142,180,216,0.22)",
            fontSize: 21,
          }}
        >
          <div style={{ display: "flex", color: "#8eb4d8" }}>
            <span style={{ color: "#ffffff" }}>{name}</span>
            <span>&nbsp;· {record}{rank}</span>
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#ffe566",
              color: "#050a14",
              padding: "5px 16px",
              borderRadius: 6,
              fontSize: 19,
            }}
          >
            +{REFERRAL_CREDITS} CREDITS EACH
          </div>
          <div style={{ display: "flex", color: "#8eb4d8" }}>
            agent-fighter-web.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  );
}
