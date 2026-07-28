"use client";

/**
 * The public data console.
 *
 * It is deliberately built ON the public API rather than querying Supabase
 * directly. That costs one hop and buys something worth far more: the console
 * is a live proof that the API works, and any shape change breaks the page we
 * look at every day instead of failing silently for a partner.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SignInButton from "@/components/air/SignInButton";
import { useAir } from "@/components/air/AirProvider";
import {
  ActivityBars,
  CharacterMeta,
  ModeShare,
  StatTile,
  colorFor,
} from "./charts";

const REFRESH_MS = 30_000;

type Stats = {
  sample: { matches_scanned: number; truncated: boolean; limit: number };
  season: { season: number; ends_at: string; ends_in_seconds: number };
  totals: {
    matches: number;
    players: number;
    agents: number;
    decided: number;
    draws: number;
    no_contests: number;
    rated: number;
  };
  by_mode: Record<string, number>;
  by_character: {
    character: string;
    picks: number;
    wins: number;
    losses: number;
    win_rate: number | null;
  }[];
  activity: { date: string; matches: number }[];
  duration: { average_seconds: number | null; median_seconds: number | null };
  economy: { credits_staked: number };
  integrity: {
    verified: number;
    forfeits: number;
    desync_convictions: number;
    verified_rate: number | null;
  };
};

type Match = {
  id: string;
  played_at: string;
  mode: string;
  rated: boolean;
  stakes: { pot: number };
  players: {
    handle: string | null;
    name: string;
    character: string;
    is_agent: boolean;
    won: boolean | null;
  }[];
  resolution: { outcome: string; method: string; settlement: string };
  duration: { seconds: number };
};

type Player = {
  handle: string | null;
  name: string;
  is_agent: boolean;
  progression: { level: number; xp: number };
  record: { wins: number; losses: number; win_rate: number | null };
  economy: { credits: number };
  rating: {
    lifetime: { elo: number; rated_matches: number };
    season: { season: number; elo: number; rated_matches: number; is_current: boolean };
  };
};

type Form = {
  matches_played: number;
  by_character: { character: string; played: number; won: number; win_rate: number | null }[];
  recent_form: string[];
  streak: number;
  average_match_seconds: number | null;
};

function Panel({
  title,
  children,
  right,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    // min-w-0 is load-bearing: a grid item defaults to `min-width: auto`, so
    // without it the wide inner table (min-w-[26rem]) pushes this panel past
    // the viewport and scrolls the whole PAGE sideways instead of scrolling
    // inside its own overflow-x-auto container.
    <section
      className={`min-w-0 border border-white/12 bg-bg-panel/60 p-4 md:p-5 ${className}`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-arcade text-[9px] text-blue-bright">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function relTime(iso: string): string {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 90) return `${Math.round(s)}s ago`;
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  if (s < 172800) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

/** Result chips use STATUS colour, which is reserved and never a series hue. */
function ResultChip({ r }: { r: Match["resolution"] }) {
  const tone =
    r.settlement === "void"
      ? "border-neon-yellow/40 text-neon-yellow"
      : r.method === "desync_forfeit"
        ? "border-neon-red/40 text-neon-red"
        : r.method === "forfeit"
          ? "border-white/25 text-ink-muted"
          : "border-neon-green/40 text-neon-green";
  const label =
    r.settlement === "void"
      ? "VOID"
      : r.method === "desync_forfeit"
        ? "DESYNC"
        : r.method === "forfeit"
          ? "FORFEIT"
          : r.outcome === "draw"
            ? "DRAW"
            : "VERIFIED";
  return (
    <span className={`font-arcade border px-1.5 py-0.5 text-[6px] ${tone}`}>
      {label}
    </span>
  );
}

export default function DataConsole() {
  const { session, handle } = useAir();

  const [stats, setStats] = useState<Stats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [me, setMe] = useState<{
    handle: string;
    player: Player;
    form: Form | null;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([
        fetch("/api/v1/stats").then((r) => r.json()),
        fetch("/api/v1/matches?limit=12").then((r) => r.json()),
      ]);
      if (s.error) throw new Error(s.error.message);
      setStats(s.stats);
      setMatches(m.matches ?? []);
      setUpdatedAt(new Date().toLocaleTimeString());
      setError(null);
    } catch (e) {
      setError((e as Error).message || "Could not reach the API.");
    }
  }, []);

  useEffect(() => {
    // Subscribing to an external system (our own HTTP API) on a timer — the
    // case the set-state-in-effect rule explicitly permits. `load` only ever
    // sets state after an await, so no render cascades synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  // Signed-in extra: the visitor's own profile, fetched through the same
  // public endpoints a third party would use.
  useEffect(() => {
    if (!handle) return;
    let alive = true;
    void fetch(`/api/v1/players/${encodeURIComponent(handle)}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d.player)
          setMe({ handle, player: d.player, form: d.form ?? null });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [handle]);

  const t = stats?.totals;
  /**
   * Gate the cached profile on the CURRENT handle rather than clearing it when
   * the handle changes. Signing out and back in as someone else must never
   * flash the previous account's record, and deriving it here costs nothing.
   */
  const mine = me && me.handle === handle ? me : null;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
      {/* ---------------------------------------------------------- header */}
      <header className="pt-8 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-arcade text-[8px] text-ink-muted">
              <Link href="/" className="hover:text-blue-bright">
                Agent Fighter
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <span className="text-blue-bright">Data Console</span>
            </p>
            <h1 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
              Data Console
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              Live view of the open{" "}
              <Link href="/docs/api" className="text-blue-bright hover:underline">
                Results API
              </Link>
              . Everything here is served by the same public endpoints anyone
              can call — no key, no signup.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SignInButton />
            {stats && (
              <span className="font-arcade text-[7px] text-ink-muted">
                SEASON {stats.season.season} ·{" "}
                {Math.max(0, Math.floor(stats.season.ends_in_seconds / 86400))}D
                LEFT
              </span>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 border border-neon-red/40 bg-neon-red/[0.06] p-3 text-sm text-ink-muted">
          <span className="font-arcade text-[8px] text-neon-red">API ERROR</span>
          <span className="ml-3">{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------ your panel */}
      {session.status === "in" && (
        <Panel
          title="YOUR RECORD"
          className="mb-6"
          right={
            handle ? (
              <a
                href={`/api/v1/players/${handle}`}
                className="font-mono text-[11px] text-blue-bright hover:underline"
              >
                /players/{handle}
              </a>
            ) : (
              <span className="font-arcade text-[7px] text-ink-muted">
                RESOLVING…
              </span>
            )
          }
        >
          {mine ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="FIGHTER"
                value={mine.player.name}
                sub={`LV ${mine.player.progression.level} · ${mine.player.economy.credits} CR`}
              />
              <StatTile
                label="RECORD"
                value={`${mine.player.record.wins}–${mine.player.record.losses}`}
                sub={
                  mine.player.record.win_rate === null
                    ? "no decided matches"
                    : `${Math.round(mine.player.record.win_rate * 100)}% win rate`
                }
              />
              <StatTile
                label="LIFETIME ELO"
                value={mine.player.rating.lifetime.elo}
                sub={`${mine.player.rating.lifetime.rated_matches} rated`}
              />
              <StatTile
                label="STREAK"
                value={
                  mine.form
                    ? mine.form.streak > 0
                      ? `W${mine.form.streak}`
                      : mine.form.streak < 0
                        ? `L${-mine.form.streak}`
                        : "—"
                    : "—"
                }
                tone={mine.form && mine.form.streak > 0 ? "good" : "default"}
                sub={mine.form ? `${mine.form.matches_played} matches` : undefined}
              />
              {mine.form && mine.form.by_character.length > 0 && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <p className="font-arcade mb-2 text-[7px] text-ink-muted">
                    YOUR FIGHTERS
                  </p>
                  <CharacterMeta rows={mine.form.by_character.map((c) => ({
                    character: c.character,
                    picks: c.played,
                    wins: c.won,
                    losses: c.played - c.won,
                    win_rate: c.win_rate,
                  }))} limit={5} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              {handle
                ? "Loading your profile…"
                : "Signed in. Waiting for the match server to resolve your public handle — if you have never played, you do not have one yet."}
            </p>
          )}
        </Panel>
      )}

      {/* ---------------------------------------------------------- tiles */}
      {t && stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatTile label="MATCHES" value={t.matches} sub="settled, all time" />
          <StatTile label="FIGHTERS" value={t.players} sub={`${t.agents} agents`} />
          <StatTile
            label="RATED"
            value={t.rated}
            sub="human vs human, decided"
          />
          <StatTile
            label="VERIFIED"
            value={
              stats.integrity.verified_rate === null
                ? "—"
                : `${Math.round(stats.integrity.verified_rate * 100)}%`
            }
            tone="good"
            sub="derived by re-sim"
          />
          <StatTile
            label="NO CONTEST"
            value={t.no_contests}
            tone={t.no_contests > 0 ? "warn" : "default"}
            sub="voided / refunded"
          />
          <StatTile
            label="DESYNCS"
            value={stats.integrity.desync_convictions}
            sub="anti-cheat convictions"
          />
        </div>
      )}

      {/* --------------------------------------------------------- charts */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title="MATCH ACTIVITY · 21 DAYS"
          right={
            updatedAt ? (
              <span className="font-arcade text-[7px] text-ink-muted">
                UPDATED {updatedAt}
              </span>
            ) : null
          }
        >
          {stats ? (
            <ActivityBars data={stats.activity} />
          ) : (
            <div className="h-[130px] animate-pulse bg-white/5" />
          )}
        </Panel>

        <Panel title="MODE SPLIT">
          {stats ? (
            <>
              <ModeShare data={stats.by_mode} />
              <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
                Arcade is single-player against a pinned AI. Only{" "}
                <span className="text-white">wager</span> is human vs human —
                the population that rates.
              </p>
            </>
          ) : (
            <div className="h-24 animate-pulse bg-white/5" />
          )}
        </Panel>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title="CHARACTER META">
          {stats ? (
            <CharacterMeta rows={stats.by_character} />
          ) : (
            <div className="h-64 animate-pulse bg-white/5" />
          )}
        </Panel>

        {/* ------------------------------------------------------ feed */}
        <Panel
          title="LATEST RESULTS"
          right={
            // Intentionally a plain anchor, not next/link: this points at a
            // JSON endpoint for a human to open and inspect. Client-side
            // routing to an API route is exactly the wrong behaviour here.
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a
              href="/api/v1/matches?limit=12"
              className="font-mono text-[11px] text-blue-bright hover:underline"
            >
              /matches
            </a>
          }
        >
          <ul className="divide-y divide-white/8">
            {matches.map((m) => (
              <li key={m.id} className="py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0"
                    style={{ background: colorFor(m.mode) }}
                    title={m.mode}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-white">
                    {m.players[0]?.name}{" "}
                    <span className="text-ink-muted">vs</span>{" "}
                    {m.players[1]?.name}
                  </span>
                  <ResultChip r={m.resolution} />
                </div>
                <div className="mt-1 flex items-center gap-2 pl-[18px] font-mono text-[10px] text-ink-muted">
                  <span>
                    {m.players[0]?.character} / {m.players[1]?.character}
                  </span>
                  <span className="opacity-40">·</span>
                  <span>{m.duration.seconds}s</span>
                  {m.stakes.pot > 0 && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="text-neon-yellow">
                        {m.stakes.pot} CR pot
                      </span>
                    </>
                  )}
                  <span className="ml-auto">{relTime(m.played_at)}</span>
                </div>
              </li>
            ))}
            {matches.length === 0 && !error && (
              <li className="py-6 text-center text-sm text-ink-muted">
                Loading results…
              </li>
            )}
          </ul>
        </Panel>
      </div>

      {/* ------------------------------------------------------- api call */}
      <Panel title="USE THIS DATA">
        <p className="text-sm leading-relaxed text-ink-muted">
          Every number on this page came from the open API. It is free, needs no
          key, and allows any origin.
        </p>
        {/* NOT .calc-readout — that class force-uppercases, which would turn a
            copyable URL into a 404. Code keeps its case. */}
        <pre className="mt-3 overflow-x-auto border border-blue/30 bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-blue-bright md:text-xs">
{`curl https://agent-fighter-web.vercel.app/api/v1/matches?rated=true`}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/docs/api"
            className="arcade-btn font-arcade px-3 py-1.5 text-[8px]"
          >
            READ THE DOCS
          </Link>
          {[
            ["/api/v1", "DISCOVERY"],
            ["/api/v1/openapi.json", "OPENAPI"],
            ["/llms.txt", "FOR AI AGENTS"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="font-arcade border border-white/20 px-3 py-1.5 text-[8px] text-ink-muted transition hover:border-blue/60 hover:text-blue-bright"
            >
              {label}
            </a>
          ))}
        </div>
        {stats?.sample.truncated && (
          <p className="mt-3 text-[11px] text-ink-muted">
            Aggregates on this page sample the most recent{" "}
            {stats.sample.limit.toLocaleString()} matches of{" "}
            {stats.totals.matches.toLocaleString()}.
          </p>
        )}
      </Panel>
    </div>
  );
}
