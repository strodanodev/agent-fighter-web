"use client";

/**
 * Chart primitives for the data console.
 *
 * Hand-rolled SVG rather than a charting library: these are four small, fixed
 * forms on a marketing site, and a chart bundle would outweigh the entire page
 * it decorates.
 *
 * THE PALETTE IS VALIDATED, NOT CHOSEN BY EYE.
 * `#2b83e6, #d4701f, #c455ab` passes all six checks against this site's dark
 * chart surface (#0a1524): OKLCH lightness inside the 0.48–0.67 dark band,
 * chroma above the 0.10 gray floor, adjacent-pair CVD separation ΔE 18.8
 * (deutan) — comfortably past the ΔE 8 target — normal-vision ΔE 20.4, and
 * every mark above 3:1 contrast on the surface.
 *
 * The site's own neon tokens were tried FIRST and failed: neon-green ↔
 * neon-yellow separate by only ΔE 4.1 under protanopia, i.e. a red-blind
 * reader cannot tell the arcade series from the wager series at all. Neon
 * accents stay where they belong — HUD chrome and status — and never encode a
 * data series.
 *
 * The categorical scale is CLOSED at three, which is not a limitation but a
 * fact about the data: `friendly` matches are unranked by construction and
 * never reach the database, so arcade / wager / solo is the complete set of
 * modes that can ever appear.
 */

import { useState } from "react";

/** Fixed categorical order. Assigned by entity, never by rank or count. */
export const SERIES_COLORS: Record<string, string> = {
  arcade: "#2b83e6",
  wager: "#d4701f",
  solo: "#c455ab",
};
export const SERIES_ORDER = ["arcade", "wager", "solo"] as const;

/** Fallback for an unexpected mode — deliberately gray, never a new hue. */
const OTHER = "#6b7d92";
export const colorFor = (key: string): string => SERIES_COLORS[key] ?? OTHER;

/** Diverging poles for "above / below even". Neutral gray at the midpoint. */
const POS = "#2b83e6";
const NEG = "#d4701f";
const MID = "#6b7d92";

// ---------------------------------------------------------------- tooltip

function Tip({ x, y, lines }: { x: string; y: number; lines: string[] }) {
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full border border-white/25 bg-[#050a14]/95 px-2 py-1.5 shadow-lg"
      style={{ left: x, top: y - 8 }}
    >
      {lines.map((l, i) => (
        <div
          key={i}
          className={
            i === 0
              ? "font-arcade text-[7px] whitespace-nowrap text-white"
              : "mt-0.5 text-[11px] whitespace-nowrap text-ink-muted"
          }
        >
          {l}
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------------------- activity

/**
 * Matches per day. One series, so no legend — the heading names it.
 *
 * Magnitude is encoded by bar length only; every bar shares one hue. Colouring
 * bars by their own value would encode the same number twice and imply a
 * category that is not there.
 */
export function ActivityBars({
  data,
  height = 130,
}: {
  data: { date: string; matches: number }[];
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.matches));
  const n = data.length || 1;
  const GAP = 2; // surface gap between adjacent bars
  const W = 100; // viewBox units — the SVG scales to its container
  const barW = Math.max(0.5, W / n - GAP * (W / 700));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Matches per day over the last ${n} days. Peak ${max}.`}
      >
        {/* Recessive baseline — present for reading, never competing. */}
        <line
          x1="0"
          y1={height - 0.5}
          x2={W}
          y2={height - 0.5}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const h = d.matches === 0 ? 0 : Math.max(2, (d.matches / max) * (height - 10));
          const x = (i * W) / n;
          return (
            <rect
              key={d.date}
              x={x}
              y={height - h}
              width={barW}
              height={h}
              // 4px rounded data-end, anchored to the baseline.
              rx={1}
              fill={hover === i ? "#6eb6ff" : POS}
              opacity={hover === null || hover === i ? 1 : 0.55}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ transition: "opacity .12s" }}
            />
          );
        })}
      </svg>

      {hover !== null && data[hover] && (
        <Tip
          x={`${((hover + 0.5) / n) * 100}%`}
          y={height}
          lines={[
            `${data[hover]!.matches} MATCH${data[hover]!.matches === 1 ? "" : "ES"}`,
            data[hover]!.date,
          ]}
        />
      )}

      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-muted">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- mode split

/**
 * Composition of matches by mode: one 100% stacked bar.
 *
 * Three series, so a legend is always present, and with ≤ 4 they are also
 * direct-labeled — identity is never carried by colour alone.
 */
export function ModeShare({ data }: { data: Record<string, number> }) {
  const [hover, setHover] = useState<string | null>(null);
  const entries = SERIES_ORDER.filter((k) => data[k])
    .map((k) => ({ key: k as string, value: data[k]! }))
    .concat(
      Object.keys(data)
        .filter((k) => !SERIES_ORDER.includes(k as (typeof SERIES_ORDER)[number]))
        .map((k) => ({ key: k, value: data[k]! })),
    );
  const total = entries.reduce((a, e) => a + e.value, 0) || 1;

  return (
    <div>
      <div className="flex h-6 w-full gap-[2px] overflow-hidden">
        {entries.map((e) => (
          <div
            key={e.key}
            className="h-full transition-opacity"
            style={{
              width: `${(e.value / total) * 100}%`,
              background: colorFor(e.key),
              opacity: hover === null || hover === e.key ? 1 : 0.5,
            }}
            onMouseEnter={() => setHover(e.key)}
            onMouseLeave={() => setHover(null)}
            title={`${e.key}: ${e.value} (${Math.round((e.value / total) * 100)}%)`}
          />
        ))}
      </div>

      <ul className="mt-3 space-y-1.5">
        {entries.map((e) => (
          <li
            key={e.key}
            className="flex items-center gap-2 text-[12px]"
            onMouseEnter={() => setHover(e.key)}
            onMouseLeave={() => setHover(null)}
          >
            <span
              className="inline-block h-2.5 w-2.5 shrink-0"
              style={{ background: colorFor(e.key) }}
              aria-hidden
            />
            {/* Text wears ink tokens; the swatch beside it carries identity. */}
            <span className="font-arcade text-[7px] text-white uppercase">
              {e.key}
            </span>
            <span className="ml-auto font-mono text-ink-muted">
              {e.value.toLocaleString()}
            </span>
            <span className="w-10 text-right font-mono text-white">
              {Math.round((e.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------- character meta

/**
 * Character meta as small multiples: PICKS (magnitude) and WIN RATE (polarity)
 * in two aligned columns sharing one row order.
 *
 * Deliberately NOT a dual-axis chart. Picks and win rate are different measures
 * on different scales; overlaying them on one plot with two y-axes is the
 * single most misleading thing a chart can do, so they get their own columns
 * and the shared row is what relates them.
 *
 * The markup is a real table, which is also the accessible table view.
 */
export function CharacterMeta({
  rows,
  limit = 10,
}: {
  rows: {
    character: string;
    picks: number;
    wins: number;
    losses: number;
    win_rate: number | null;
  }[];
  limit?: number;
}) {
  const top = rows.slice(0, limit);
  const maxPicks = Math.max(1, ...top.map((r) => r.picks));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/15">
            <th className="font-arcade py-2 text-[7px] text-blue-bright">
              FIGHTER
            </th>
            <th className="font-arcade px-2 py-2 text-[7px] text-blue-bright">
              PICKS
            </th>
            <th className="font-arcade px-2 py-2 text-right text-[7px] text-blue-bright">
              WIN RATE
            </th>
          </tr>
        </thead>
        <tbody>
          {top.map((r) => {
            const wr = r.win_rate ?? 0;
            // Diverging around even: how far from 0.5, and which side.
            const dev = wr - 0.5;
            const mag = Math.min(1, Math.abs(dev) / 0.5);
            const decided = r.wins + r.losses;
            return (
              <tr key={r.character} className="border-b border-white/8">
                <td className="py-2 font-mono text-xs whitespace-nowrap text-white">
                  {r.character}
                </td>
                <td className="px-2 py-2 align-middle">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-[1px]"
                      style={{
                        width: `${Math.max(2, (r.picks / maxPicks) * 100)}%`,
                        minWidth: 4,
                        background: POS,
                      }}
                    />
                    <span className="font-mono text-[11px] text-ink-muted">
                      {r.picks}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    {/* Diverging bar: neutral centre line, one hue per side. */}
                    <div className="relative h-2 w-16 shrink-0">
                      <div
                        className="absolute inset-y-0 left-1/2 w-px"
                        style={{ background: MID }}
                        aria-hidden
                      />
                      {decided > 0 && (
                        <div
                          className="absolute inset-y-0 rounded-[1px]"
                          style={{
                            background: dev >= 0 ? POS : NEG,
                            left: dev >= 0 ? "50%" : `${50 - mag * 50}%`,
                            width: `${Math.max(2, mag * 50)}%`,
                          }}
                        />
                      )}
                    </div>
                    <span className="w-10 text-right font-mono text-[11px] text-white">
                      {decided === 0 ? "—" : `${Math.round(wr * 100)}%`}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-ink-muted">
        Win rate is centred on 50%. Bars right of the line beat the field; left
        of it, they lose to it.
      </p>
    </div>
  );
}

// ------------------------------------------------------------- stat tile

/**
 * A hero number. Not a chart — when the job is "state one value", a chart is
 * strictly worse than the value.
 */
export function StatTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "text-neon-green"
      : tone === "warn"
        ? "text-neon-yellow"
        : "text-white";

  const text =
    typeof value === "number" ? value.toLocaleString() : String(value);

  /**
   * Step the display size down for long values.
   *
   * These tiles were sized for numbers, but one of them holds a player's
   * display NAME, which is user-controlled and can be far longer than any
   * count — "CONTACT.STRODANO" at text-2xl simply ran out of the box. Shrink
   * first, then allow a break, so a long name degrades gracefully instead of
   * spilling over the border.
   */
  const size =
    text.length <= 9
      ? "text-2xl"
      : text.length <= 14
        ? "text-xl"
        : text.length <= 22
          ? "text-lg"
          : "text-base";

  return (
    // min-w-0: these sit in a grid, whose items default to `min-width: auto`
    // and would otherwise refuse to shrink below their content.
    <div className="min-w-0 border border-white/12 bg-black/30 p-3">
      <p className="font-arcade text-[7px] text-ink-muted">{label}</p>
      <p
        className={`font-display mt-1.5 leading-tight break-words hyphens-auto ${size} ${toneClass}`}
        title={text}
      >
        {text}
      </p>
      {sub && <p className="mt-1 text-[11px] break-words text-ink-muted">{sub}</p>}
    </div>
  );
}
