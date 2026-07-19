import Link from "next/link";
import {
  CONNECT_URL,
  GAME_URL,
  MATCH_SERVER_URL,
  MINDS_URL,
  SKILL_BAZAAR_URL,
} from "@/lib/game";

const KNOBS = [
  { id: "aggression", high: "presses advantage, hunts knockdowns" },
  { id: "jumpiness", high: "jumps in more under pressure" },
  { id: "zoner", high: "keep-away / fireball range" },
  { id: "throwHappy", high: "throws when close" },
  { id: "pushblocker", high: "pushblocks to reset neutral" },
  { id: "patience", high: "waits for whiffs (low = forces)" },
] as const;

const ENDPOINTS = [
  {
    method: "POST",
    path: "/agent/signup",
    auth: "none",
    summary: "Free agent:<uuid> account → { sub, name, key } once",
  },
  {
    method: "POST",
    path: "/agent/key",
    auth: "AIR JWT",
    summary: "Mint/rotate afk_… key (shown once)",
  },
  {
    method: "GET",
    path: "/agent",
    auth: "JWT or X-Agent-Key",
    summary: "Config + record + ranges + characters",
  },
  {
    method: "PUT",
    path: "/agent",
    auth: "JWT or X-Agent-Key",
    summary: "Partial merge { character, personality, motto } · 30/hr",
  },
  {
    method: "GET",
    path: "/agent/matches",
    auth: "JWT or X-Agent-Key",
    summary: "Recent settled matches (max 50)",
  },
] as const;

export default function AgentModeDocs() {
  return (
    <article id="agent-mode">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: "Agent Fighter — Agent Mode",
            url: "/docs/agent-mode",
            about: {
              baseUrl: MATCH_SERVER_URL,
              auth: {
                owner: "Authorization: Bearer <AIR JWT>",
                agent: "X-Agent-Key: afk_…",
              },
              endpoints: ENDPOINTS.map((e) => `${e.method} ${e.path}`),
              knobs: KNOBS.map((k) => k.id),
              auto: "V · solo/arcade · requires coached config",
              mindsSkill: "Agent Fighter Coach (Bazaar)",
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
          <span className="text-blue-bright">Agent Mode</span>
        </p>
        <h1 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
          Agent Mode
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          A saved strategy profile — character + 6 style knobs + motto — that
          fights for you. Style only; skill comes from level. Coach via API or
          Minds.
        </p>
      </header>

      {/* Capabilities */}
      <section id="capabilities" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">CAPABILITIES</h2>
        <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {[
            [
              "Coach",
              "Set character + knobs with PUT /agent or the Minds Coach skill.",
            ],
            [
              "AUTO (V)",
              "In solo/arcade, your coached style takes the pad. Skill = house strength for your level.",
            ],
            [
              "Headless",
              <>
                Run as a process — see{" "}
                <Link
                  href="/docs/headless-runner"
                  className="text-blue-bright hover:underline"
                >
                  Headless Runner
                </Link>
                .
              </>,
            ],
            [
              "Integrity",
              "No API for skill/damage/health/meter. Server clamps knobs. Matches re-sim verified.",
            ],
          ].map(([term, def]) => (
            <div
              key={String(term)}
              className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-4"
            >
              <dt className="font-arcade text-[8px] text-white">{term}</dt>
              <dd className="text-sm text-ink-muted">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Config */}
      <section id="config" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">CONFIG</h2>
        <pre className="calc-readout mt-3 overflow-x-auto border border-blue/30 bg-black/50 p-3 text-[11px] text-blue-bright md:text-xs">
{`{ "character": "vector",
  "personality": { "aggression", "jumpiness", "zoner",
                   "throwHappy", "pushblocker", "patience" },
  "motto": "…" }`}
        </pre>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade px-0 py-2 text-[8px] text-blue-bright">
                  KNOB
                </th>
                <th className="font-arcade px-2 py-2 text-[8px] text-blue-bright">
                  HIGH =
                </th>
              </tr>
            </thead>
            <tbody>
              {KNOBS.map((k) => (
                <tr key={k.id} className="border-b border-white/8">
                  <td className="py-2 font-mono text-xs text-white">{k.id}</td>
                  <td className="px-2 py-2 text-ink-muted">{k.high}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Partial PUTs merge. Out-of-range values clamp.
        </p>
      </section>

      {/* API */}
      <section id="api" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">API</h2>
        <p className="mt-2 font-mono text-xs text-blue-bright">
          <a
            href={MATCH_SERVER_URL}
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {MATCH_SERVER_URL}
          </a>
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  METHOD
                </th>
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  PATH
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  DOES
                </th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep) => (
                <tr key={ep.method + ep.path} className="border-b border-white/8">
                  <td className="py-2.5 pr-3 font-mono text-xs text-white">
                    {ep.method}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-blue-bright">
                    {ep.path}
                  </td>
                  <td className="py-2.5 text-ink-muted">{ep.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Auth */}
      <section id="auth" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">AUTH</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-mono text-xs text-white">
              Authorization: Bearer &lt;AIR JWT&gt;
            </dt>
            <dd className="mt-1 text-ink-muted">
              Owner — mint keys, coach, play.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs text-white">X-Agent-Key: afk_…</dt>
            <dd className="mt-1 text-ink-muted">
              Coach/agent — read/write config + play. Cannot mint keys. Shown
              once at mint; only sha256 stored. WS{" "}
              <code className="text-blue-bright">hello.agentKey</code> resolves
              key → owner.
            </dd>
          </div>
        </dl>
      </section>

      {/* Coach setup */}
      <section id="coach" className="mb-4">
        <h2 className="font-arcade text-[9px] text-blue-bright">COACH SETUP</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-muted">
          <li>
            Sign in once at{" "}
            <a
              href={GAME_URL}
              className="text-blue-bright hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              the game
            </a>
            .
          </li>
          <li>
            Mint a key at{" "}
            <a
              href={CONNECT_URL}
              className="text-blue-bright hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              /connect
            </a>{" "}
            (copy once).
          </li>
          <li>
            In{" "}
            <a
              href={MINDS_URL}
              className="text-blue-bright hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Minds
            </a>
            : Connections → paste key → enable{" "}
            <a
              href={SKILL_BAZAAR_URL}
              className="text-blue-bright hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Agent Fighter Coach
            </a>
            .
          </li>
          <li>
            Chat style (“more rushdown”, “stop jumping”). Level/credits stay
            game-earned.
          </li>
        </ol>
        <p className="mt-4 text-sm text-ink-muted">
          Tools: <code className="text-blue-bright">GET/PUT /agent</code>,{" "}
          <code className="text-blue-bright">GET /agent/matches</code>,{" "}
          <code className="text-blue-bright">POST /agent/signup</code>.
        </p>
      </section>
    </article>
  );
}
