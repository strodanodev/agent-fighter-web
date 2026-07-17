import AskGate from "./AskGate";

const markets = [
  {
    label: "TAM",
    value: "$40B",
    sub: "Global Web3 Gaming · 2026",
  },
  {
    label: "SAM",
    value: "$16.4B",
    sub: "APAC Web3 & eSports",
  },
  {
    label: "SOM",
    value: "$6.5M",
    sub: "Agent Fighter capture · 12–24 mo",
  },
];

const streams = [
  {
    title: "B2C in-game economy",
    range: "$3.5M – $4.5M ARR",
    points: [
      "$DARE top-ups & credit sinks",
      "Gacha buffs · NFT pet integrations",
      "Blended ARPU target $35–$45",
    ],
  },
  {
    title: "B2B eSports activations",
    range: "$1.0M – $1.5M ARR",
    points: [
      "Sponsored leaderboards",
      "IRL tournament hosting",
      "4–6 major brand activations / year",
    ],
  },
];

const raise = [
  { label: "Target raise", value: "$2.5M – $3.5M" },
  { label: "Pre-money", value: "$12.5M – $15.0M" },
  { label: "Instrument", value: "SAFE + Token Warrant" },
];

function AskMetrics() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {raise.map((r) => (
          <div key={r.label} className="arcade-panel px-5 py-5">
            <p className="font-arcade text-[8px] text-ink-muted">{r.label}</p>
            <p className="font-display mt-2 text-xl text-white md:text-2xl">
              {r.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 arcade-panel flex flex-col gap-2 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-arcade text-[8px] text-ink-muted">
            Target ARR · 100k users · 12–18 months
          </p>
          <p className="font-display mt-1 text-2xl text-neon-yellow md:text-3xl">
            $4.5M – $6.0M
          </p>
        </div>
        <p className="max-w-md text-sm text-ink-muted md:text-right">
          Raise via SAFE + Token Warrant — exposure to studio IP and the $DARE
          ecosystem.
        </p>
      </div>
    </>
  );
}

export default function Investors() {
  return (
    <section
      id="investors"
      className="section-defer relative overflow-hidden border-y border-white/10 bg-bg-elevated py-16 md:py-20"
    >
      <div className="relative z-[1] mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="font-arcade text-[9px] text-blue-bright">INVESTORS</p>
          <h2 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
            Primary vehicle for ERC-6699
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
            Closed-beta ready product at the intersection of AI, competitive
            gaming, and web3 — with SEA enterprise pipelines and global IP
            upside.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {markets.map((m) => (
            <div
              key={m.label}
              className="arcade-panel border-blue/25 bg-gradient-to-b from-blue/10 to-transparent px-5 py-6"
            >
              <p className="font-arcade text-[8px] text-blue-bright">{m.label}</p>
              <p className="font-display mt-2 text-3xl text-white md:text-4xl">
                {m.value}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {streams.map((s) => (
            <div key={s.title} className="arcade-panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl text-white">{s.title}</h3>
                <span className="font-arcade text-[7px] text-neon-yellow">
                  {s.range}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {s.points.map((p) => (
                  <li
                    key={p}
                    className="flex gap-3 text-sm text-ink-muted before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-blue-bright before:content-['']"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <AskGate>
          <AskMetrics />
        </AskGate>
      </div>
    </section>
  );
}
