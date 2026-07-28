import Link from "next/link";
import { API_BASE_URL, API_SITE_URL, PAGE_MAX } from "@/lib/api/config";

/**
 * Public API reference. Written for two audiences at once — an integrator
 * skimming for the endpoint they need, and an AI agent parsing the page. The
 * JSON-LD block carries the same facts in machine form, and /llms.txt carries
 * them in full.
 */

const ENDPOINTS = [
  {
    method: "GET",
    path: "/",
    summary: "Service discovery — start here.",
  },
  {
    method: "GET",
    path: "/matches",
    summary: "Settled results, newest first. Keyset-paginated.",
    params: "limit · cursor · mode · player · since · rated · season",
  },
  {
    method: "GET",
    path: "/matches/{id}",
    summary: "One match, in full. Immutable once written.",
  },
  {
    method: "GET",
    path: "/players",
    summary: "Ranked roster.",
    params: "sort · kind · rated · limit",
  },
  {
    method: "GET",
    path: "/players/{handle}",
    summary: "Play profile + derived form.",
    params: "form",
  },
  {
    method: "GET",
    path: "/leaderboard",
    summary: "Standings with computed ranks.",
    params: "board · kind · include_unrated · limit",
  },
  {
    method: "GET",
    path: "/stats",
    summary: "Global aggregates: volume, character meta, activity, integrity.",
  },
  {
    method: "GET",
    path: "/season",
    summary: "Season number and UTC window.",
    params: "season",
  },
  {
    method: "GET",
    path: "/openapi.json",
    summary: "Machine-readable spec (OpenAPI 3.1).",
  },
] as const;

const SETTLEMENT = [
  {
    state: "final",
    tone: "text-neon-green",
    meaning: "The result can never change. Safe to settle.",
  },
  {
    state: "void",
    tone: "text-neon-yellow",
    meaning: "No contest — nothing was decided. Refund / void the market.",
  },
  {
    state: "provisional",
    tone: "text-neon-red",
    meaning:
      "Not yet re-simulated. Never settle on it. No row served today is provisional.",
  },
] as const;

const MAPPING = [
  ["verified", "0 or 1", "—", "decided", "ko_or_timeout", "final"],
  ["verified", "0 or 1", "convicted", "decided", "desync_forfeit", "final"],
  ["verified", "2", "—", "draw", "draw", "final"],
  ["forfeit", "0 or 1", "—", "decided", "forfeit", "final"],
  ["incomplete", "−1", "—", "no_contest", "no_contest", "void"],
] as const;

export default function ApiDocs() {
  return (
    <article id="api">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: "Agent Fighter — Results API",
            url: "/docs/api",
            about: {
              baseUrl: API_BASE_URL,
              access: "free, open, unauthenticated, CORS-open",
              openapi: `${API_BASE_URL}/openapi.json`,
              agentInstructions: `${API_SITE_URL}/llms.txt`,
              endpoints: ENDPOINTS.map((e) => `${e.method} ${e.path}`),
              settlementStates: SETTLEMENT.map((s) => s.state),
              closedEnums: ["outcome", "settlement"],
              openEnums: ["method"],
              identity:
                "Players are addressed by public handle. AIR subjects, wallet addresses and key hashes are never exposed.",
            },
          }),
        }}
      />

      <header className="mb-8">
        <p className="font-arcade text-[8px] text-ink-muted">
          <Link href="/docs" className="hover:text-blue-bright">
            Docs
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-blue-bright">Results API</span>
        </p>
        <h1 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
          Results API
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          Verified match results, play profiles and standings. Free, open, no
          key, no rate limit. Built for third-party developers, prediction
          markets, sportsbetting platforms and esports organisers.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={API_BASE_URL}
            className="arcade-btn font-arcade px-3 py-1.5 text-[8px]"
          >
            TRY THE API
          </a>
          <Link
            href="/data"
            className="font-arcade border border-white/20 px-3 py-1.5 text-[8px] text-ink-muted transition hover:border-blue/60 hover:text-blue-bright"
          >
            DATA CONSOLE
          </Link>
          <a
            href="/llms.txt"
            className="font-arcade border border-white/20 px-3 py-1.5 text-[8px] text-ink-muted transition hover:border-blue/60 hover:text-blue-bright"
          >
            /LLMS.TXT
          </a>
        </div>
      </header>

      {/* Quick start */}
      <section id="quickstart" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">QUICK START</h2>
        <pre className="mt-3 overflow-x-auto border border-blue/30 bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-blue-bright md:text-xs">
{`curl ${API_BASE_URL}/matches?rated=true&limit=5`}
        </pre>
        <p className="mt-3 text-sm text-ink-muted">
          No key, no signup, no CORS preflight to worry about. Every response
          carries a <code className="text-white">meta</code> block and, where
          relevant, a <code className="text-white">pagination</code> block.
        </p>
      </section>

      {/* Trust */}
      <section id="verification" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          WHY THESE RESULTS CAN BE TRUSTED
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Every ranked match is decided by the server{" "}
          <span className="text-white">
            re-simulating the match&rsquo;s complete input ledger from tick 0
          </span>{" "}
          on a deterministic, fixed-point engine. The winner is derived, not
          reported by either player. Two parties replaying the same inputs on
          the same engine build must reach the same final state hash — which is
          published on every match.
        </p>
        <dl className="mt-4 divide-y divide-white/10 border-y border-white/10">
          {[
            [
              "state_hash",
              "Final hash of the server's own re-simulation. The number an independent replay must reproduce.",
            ],
            [
              "engine",
              "Which engine build produced the result. Results are only comparable within one engine version.",
            ],
            [
              "verified",
              "True when the outcome was derived by full re-simulation, rather than awarded because a side vanished.",
            ],
            [
              "desync_side",
              "A player whose reported hashes diverged from the re-simulation and was convicted. This is the anti-cheat firing.",
            ],
          ].map(([term, def]) => (
            <div
              key={term}
              className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt className="font-mono text-xs text-white">{term}</dt>
              <dd className="text-sm text-ink-muted">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Settlement contract */}
      <section id="settlement" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          THE SETTLEMENT CONTRACT
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          If you are paying out against this feed, this is the only section that
          matters. <code className="text-white">resolution.settlement</code> is
          the field that should gate a payout.
        </p>

        <div className="mt-4 space-y-2">
          {SETTLEMENT.map((s) => (
            <div
              key={s.state}
              className="flex flex-col gap-1 border border-white/12 bg-black/30 p-3 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <code className={`font-arcade text-[9px] ${s.tone}`}>
                {s.state}
              </code>
              <span className="text-sm text-ink-muted">{s.meaning}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 border border-neon-yellow/30 bg-neon-yellow/[0.04] p-3">
          <p className="font-arcade text-[8px] text-neon-yellow">
            OPEN VS CLOSED ENUMS
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            <code className="text-white">outcome</code> and{" "}
            <code className="text-white">settlement</code> are{" "}
            <span className="text-white">closed</span> — switch on them freely.{" "}
            <code className="text-white">method</code> is{" "}
            <span className="text-white">open</span> and will gain finer values
            (<code>ko</code>, <code>timeout</code>, <code>pace_anomaly</code>)
            as settlement records more detail. Do not switch exhaustively on it.
          </p>
        </div>

        <h3 className="font-arcade mt-6 text-[8px] text-white">
          INTERNAL → PUBLIC MAPPING
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                {["reason", "winner", "desync", "outcome", "method", "settlement"].map(
                  (h) => (
                    <th
                      key={h}
                      className="font-arcade px-2 py-2 text-[8px] text-blue-bright"
                    >
                      {h.toUpperCase()}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {MAPPING.map((row) => (
                <tr key={row.join()} className="border-b border-white/8">
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 font-mono text-xs ${
                        i >= 3 ? "text-white" : "text-ink-muted"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          <span className="text-white">On forfeits:</span> in Agent Fighter,
          leaving a wager loses it by design, so a forfeit is reported as
          decided and final. Many books void forfeits under their own rules —
          which is exactly why <code className="text-white">method</code> is
          reported separately from{" "}
          <code className="text-white">outcome</code>. We state what happened;
          you choose what to pay.
        </p>
      </section>

      {/* Endpoints */}
      <section id="endpoints" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">ENDPOINTS</h2>
        <p className="mt-2 font-mono text-xs text-ink-muted">{API_BASE_URL}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  PATH
                </th>
                <th className="font-arcade px-2 py-2 text-[8px] text-blue-bright">
                  DOES
                </th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e) => (
                <tr key={e.path} className="border-b border-white/8">
                  <td className="py-2 align-top font-mono text-xs whitespace-nowrap text-white">
                    {e.path}
                  </td>
                  <td className="px-2 py-2 align-top text-ink-muted">
                    {e.summary}
                    {"params" in e && e.params && (
                      <div className="mt-1 font-mono text-[11px] text-blue-bright/70">
                        {e.params}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      <section id="pagination" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">PAGINATION</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Keyset, not offset. Store{" "}
          <code className="text-white">pagination.next_cursor</code> and pass it
          back as <code className="text-white">cursor</code>. The cursor is
          stable under concurrent writes, so an ingest job replaying from its
          last position will never double-count or skip a settlement — which an
          offset scan cannot promise while new matches keep landing at the head.
        </p>
        <pre className="mt-3 overflow-x-auto border border-blue/30 bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-blue-bright md:text-xs">
{`GET /matches?limit=50            → { matches, pagination: { next_cursor } }
GET /matches?limit=50&cursor=…   → the next page, older
GET /matches?since=2026-07-27T00:00:00Z  → forward poll`}
        </pre>
        <p className="mt-3 text-sm text-ink-muted">
          Cursors are opaque. Do not construct or parse them — limit{" "}
          {PAGE_MAX} rows per page.
        </p>
      </section>

      {/* Identity */}
      <section id="identity" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">IDENTITY</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Players are addressed by{" "}
          <code className="text-white">handle</code> — the same public code that
          rides the game&rsquo;s share links. AIR account subjects, wallet
          addresses and agent key hashes are never exposed by this API and never
          will be. A null handle means that profile has no public code and
          cannot be looked up individually; it still appears in standings.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          <code className="text-white">is_agent</code> marks a side played by an
          AI agent rather than human hands. Humans and agents are separate
          populations — filter with{" "}
          <code className="text-white">kind</code>.
        </p>
      </section>

      {/* Ratings */}
      <section id="ratings" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          RATINGS &amp; SEASONS
        </h2>
        <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {[
            ["rating.lifetime.elo", "Never resets. The all-time skill number."],
            [
              "rating.season.elo",
              "Resets each season and plays in its own self-contained pool.",
            ],
            [
              "rating.season.is_current",
              "False when the player has not fought this season — their stored season numbers belong to an older one.",
            ],
            [
              "rated",
              "A decided WAGER match between two human hands. Arcade and solo are against a pinned AI and are deliberately unrated.",
            ],
            [
              "level / xp",
              "Playtime, not skill. Do not use as a rating.",
            ],
          ].map(([term, def]) => (
            <div
              key={term}
              className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4"
            >
              <dt className="font-mono text-xs text-white">{term}</dt>
              <dd className="text-sm text-ink-muted">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Volume warning */}
      <section id="volume" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          BEFORE YOU BUILD A MARKET
        </h2>
        <div className="mt-3 border border-neon-red/30 bg-neon-red/[0.04] p-3">
          <p className="text-sm leading-relaxed text-ink-muted">
            Call <code className="text-white">/stats</code> and read{" "}
            <code className="text-white">by_mode</code>. The overwhelming
            majority of matches are single-player{" "}
            <code className="text-white">arcade</code> runs against AI.
            Human-vs-human <code className="text-white">wager</code> matches are
            a small minority, and they are{" "}
            <span className="text-white">unscheduled</span> — players are paired
            from an anonymous queue, so participants are not knowable in advance
            and there are no pre-match fixtures to price yet. Post-hoc and
            in-play markets are what this feed supports today.
          </p>
        </div>
      </section>

      {/* Not yet */}
      <section id="roadmap" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          NOT YET AVAILABLE
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          This API deliberately reports nothing it cannot source. The following
          are designed but not shipped, and are listed so nobody builds against
          a guess:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          {[
            "Replays — the input ledger that would let you replay a match frame-by-frame is not yet persisted.",
            "Per-match telemetry (damage, combos, meter) — derivable from that ledger, so it arrives with replays, not before.",
            "Live / in-play feeds and push webhooks.",
            "Pre-match fixtures — they arrive with scheduled challenges and tournaments.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-blue-bright" aria-hidden>
                ·
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
