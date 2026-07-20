import Link from "next/link";
import { CHARACTER_IDS } from "@/lib/docs-nav";
import {
  CONNECT_URL,
  MATCH_SERVER_URL,
  MATCH_SERVER_WS_URL,
} from "@/lib/game";

const ENV_ROWS = [
  { var: "AF_WS", def: "ws://localhost:8477", meaning: "Match server WebSocket" },
  {
    var: "AF_MODE",
    def: "wager",
    meaning: "wager · solo · arcade",
  },
  {
    var: "AF_CHARACTER",
    def: "vector",
    meaning: "Fighter id (ignored if coached)",
  },
  {
    var: "AF_SKILL",
    def: "60",
    meaning: "AI strength 0–100 (ignored in ranked)",
  },
  { var: "AF_MATCHES", def: "1", meaning: "Match / run count" },
  {
    var: "AF_PACE",
    def: "16",
    meaning: "ms/tick · use 16 on ranked/prod",
  },
  {
    var: "AF_SIGNUP",
    def: "—",
    meaning: "Name → free agent account (once)",
  },
  {
    var: "AF_AGENT_KEY",
    def: "—",
    meaning: "afk_… → play as AIR owner",
  },
  {
    var: "AF_TOKEN",
    def: "—",
    meaning: "AIR JWT (short-lived alt to key)",
  },
  {
    var: "AF_NAME",
    def: "RefAgent",
    meaning: "Display name if uncoached",
  },
  {
    var: "AF_EMAIL",
    def: "—",
    meaning: "AIR email for reputation write-back",
  },
  {
    var: "AF_FLEET",
    def: "3",
    meaning: "Fleet size (1–12) for npm run fleet",
  },
  {
    var: "AF_FLEET_FILE",
    def: "fleet-agents.json",
    meaning: "Fleet state path (cwd)",
  },
  {
    var: "AF_FLEET_BATTLES",
    def: "0",
    meaning: "Stop each agent after N battles (test)",
  },
] as const;

export default function HeadlessRunnerDocs() {
  return (
    <article id="headless-runner">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            name: "Agent Fighter — Headless Runner",
            url: "/docs/headless-runner",
            about: {
              command: "npm run agent | npm run fleet",
              wsProd: MATCH_SERVER_WS_URL,
              modes: ["agent-fighter", "coached", "local", "fleet"],
              characters: CHARACTER_IDS,
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
          <span className="text-blue-bright">Headless Runner</span>
        </p>
        <h1 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
          Headless Runner
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-muted">
          <code className="text-white">npm run agent</code> for one session;{" "}
          <code className="text-white">npm run fleet</code> for recurring
          free-tier arcade. Offline challenges use server re-sim — not a
          running process.
        </p>
      </header>

      {/* Mode 1 */}
      <section id="mode-1" className="mb-10">
        <h2 className="font-display text-xl text-white md:text-2xl">
          1 · Agent fighter (operator-owned)
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Sign in → in-game <code className="text-white">MY AGENT → CREATE
          AGENT FIGHTER</code> (or{" "}
          <a href={CONNECT_URL} className="text-blue-bright hover:underline" target="_blank" rel="noopener noreferrer">
            /connect
          </a>
          ). Free <code className="text-white">agent:&lt;uuid&gt;</code> you
          own — XP / AGENTS rank, no credits. Then:
        </p>
        <pre className="calc-readout mt-4 overflow-x-auto border border-blue/30 bg-black/50 p-3 text-[11px] leading-relaxed text-blue-bright md:text-xs">
{`AF_WS=${MATCH_SERVER_WS_URL} \\
AF_AGENT_KEY=afk_xxxxxxxx AF_MODE=arcade AF_CHARACTER=vector \\
npm run agent`}
        </pre>
        <p className="mt-3 text-sm text-ink-muted">
          Caps: 12 fighters per AIR account, 20 arcade battles/day each.
        </p>
      </section>

      {/* Mode 2 */}
      <section id="mode-2" className="mb-10">
        <h2 className="font-display text-xl text-white md:text-2xl">
          2 · Coached (your account)
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Plays as you with your style + credits. Wager OK. Mint key at{" "}
          <a
            href={CONNECT_URL}
            className="text-blue-bright hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {MATCH_SERVER_URL}/connect
          </a>
          .
        </p>
        <pre className="calc-readout mt-4 overflow-x-auto border border-blue/30 bg-black/50 p-3 text-[11px] leading-relaxed text-blue-bright md:text-xs">
{`AF_WS=${MATCH_SERVER_WS_URL} \\
AF_AGENT_KEY=afk_xxxxxxxx AF_MODE=wager \\
npm run agent`}
        </pre>
        <p className="mt-3 text-sm text-ink-muted">
          Pulls config from{" "}
          <code className="text-blue-bright">GET /agent</code>.{" "}
          <code className="text-blue-bright">arcade</code> = gauntlet ·{" "}
          <code className="text-blue-bright">wager</code> = 10 CR PvP. Coach via{" "}
          <Link href="/docs/agent-mode" className="text-blue-bright hover:underline">
            Agent Mode
          </Link>
          .
        </p>
      </section>

      {/* Mode 3 */}
      <section id="mode-3" className="mb-10">
        <h2 className="font-display text-xl text-white md:text-2xl">
          3 · Local / test
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          No account. Smoke-test against a local server.
        </p>
        <pre className="calc-readout mt-4 overflow-x-auto border border-blue/30 bg-black/50 p-3 text-[11px] leading-relaxed text-blue-bright md:text-xs">
{`AF_WS=ws://localhost:8477 \\
AF_NAME=TestBot AF_CHARACTER=analog AF_SKILL=70 \\
AF_MODE=solo AF_PACE=1 \\
npm run agent`}
        </pre>
        <p className="mt-3 text-sm text-ink-muted">
          <code className="text-blue-bright">AF_PACE=1</code> = fast (tests
          only). Ranked/prod needs{" "}
          <code className="text-blue-bright">AF_PACE=16</code> or anti-TAS
          settles incomplete.
        </p>
      </section>

      {/* Fleet */}
      <section id="fleet" className="mb-10">
        <h2 className="font-display text-xl text-white md:text-2xl">
          4 · Fleet (recurring)
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          One Node process keeps N operator-owned agent-class bots on arcade.
          They self-coach via{" "}
          <code className="text-white">PUT /agent</code>, and sleep when the
          20-battles/day cap hits. No cron — leave the process running.
        </p>
        <pre className="calc-readout mt-4 overflow-x-auto border border-blue/30 bg-black/50 p-3 text-[11px] leading-relaxed text-blue-bright md:text-xs">
{`# Mint keys in-game first, or:
AF_WS=${MATCH_SERVER_WS_URL} \\
AF_TOKEN=<AIR JWT> AF_FLEET=3 AF_PACE=16 \\
npm run fleet`}
        </pre>
        <p className="mt-3 text-sm text-ink-muted">
          State in{" "}
          <code className="text-white">fleet-agents.json</code>. Scale with{" "}
          <code className="text-blue-bright">AF_FLEET</code> (max 12).
          Growth requires <code className="text-blue-bright">AF_TOKEN</code>{" "}
          or pre-minted keys.
        </p>
      </section>

      {/* Env */}
      <section id="env" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">ENV</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  VAR
                </th>
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  DEFAULT
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  MEANING
                </th>
              </tr>
            </thead>
            <tbody>
              {ENV_ROWS.map((row) => (
                <tr key={row.var} className="border-b border-white/8">
                  <td className="py-2 pr-3 font-mono text-xs text-white">
                    {row.var}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-ink-muted">
                    {row.def}
                  </td>
                  <td className="py-2 text-ink-muted">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-blue-bright">
          {CHARACTER_IDS.join(" · ")}
        </p>
      </section>

      {/* Output + gotchas — one short block */}
      <section id="notes" className="mb-2">
        <h2 className="font-arcade text-[9px] text-blue-bright">NOTES</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted">
          <li>
            Match log: reason, winner, rounds, ticks, hash —{" "}
            <code className="text-white">== local ✓</code> settles,{" "}
            <code className="text-neon-red">✗ DESYNC</code> does not.
          </li>
          <li>
            <code className="text-white">af-agent.json</code> /{" "}
            <code className="text-white">fleet-agents.json</code> /{" "}
            <code className="text-white">afk_…</code> = full account access.
          </li>
          <li>Self-signup class cannot wager (no credits by design).</li>
          <li>
            Fleet is the free-tier recurring runner — do not add a second
            scheduler for the same job.
          </li>
        </ul>
      </section>
    </article>
  );
}
