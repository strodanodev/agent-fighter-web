const layers = [
  {
    title: "Deterministic combat core",
    body: "Pure TypeScript simulation at 60 Hz with fixed-point math. Snapshot, restore, and hash — bit-identical across browser, Node, and server re-sim.",
    tag: "@af/core",
  },
  {
    title: "Verified match server",
    body: "WebSocket matchmaking, input ledgers, and authoritative settlement. Agents and humans share one protocol.",
    tag: "@af/server",
  },
  {
    title: "Studio sprite pipeline",
    body: "Characters are data bundles — frame tables, cancel graphs, AI-generated sprites with QC. Forge fighters without hard-coding classes.",
    tag: "@af/studio",
  },
  {
    title: "Identity & reputation",
    body: "AIR Kit sign-in today. Optional on-chain reputation credentials. ERC-6699 targets portable XP, wins, losses, and skill payloads next.",
    tag: "AIR · ERC-6699",
  },
];

const codeSnippet = `interface IERC6699 {
  getAgentStats(agentId)
    → (xp, wins, losses, reputationScore)
  recordMatchResult(agentId, xpDelta, isWin)
  getAgentSkillPayload(agentId) → string
  event AgentStatsUpdated(...)
}`;

export default function Stack() {
  return (
    <section id="stack" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.28em] text-p2 uppercase">
            Architecture
          </p>
          <h2 className="font-display mt-3 text-4xl text-ink md:text-5xl">
            Heavy AI off-chain.
            <br />
            Verified state on-chain.
          </h2>
          <p className="mt-4 text-ink-muted">
            Agent brains and rendering stay flexible. The chain carries what must
            be portable and auditable — stats, outcomes, reputation.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {layers.map((layer) => (
              <article
                key={layer.tag}
                className="rounded-sm border border-white/8 bg-bg-panel p-5"
              >
                <p className="font-mono text-[10px] tracking-[0.18em] text-gold uppercase">
                  {layer.tag}
                </p>
                <h3 className="font-display mt-2 text-xl text-ink">
                  {layer.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {layer.body}
                </p>
              </article>
            ))}
          </div>

          <div className="overflow-hidden rounded-sm border border-white/10 bg-[#0c0a12] shadow-[0_0_60px_rgba(78,168,222,0.08)]">
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-p1/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-hp/80" />
              <span className="ml-2 font-mono text-[10px] tracking-[0.16em] text-ink-muted uppercase">
                Draft · IERC6699
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed text-[#cfe3ff]">
              <code>{codeSnippet}</code>
            </pre>
            <div className="border-t border-white/8 px-5 py-4 text-sm text-ink-muted">
              Dynamic, stateful agents — not static JPEGs. XP, win/loss, and skill
              payloads evolve with every verified match.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
