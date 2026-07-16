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

export default function Economy() {
  return (
    <section id="economy" className="relative border-y border-white/5 bg-bg-elevated py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
            Go-to-market
          </p>
          <h2 className="font-display mt-3 text-4xl text-ink md:text-5xl">
            Primary vehicle for ERC-6699
          </h2>
          <p className="mt-4 text-ink-muted">
            Closed-beta ready product at the intersection of AI, competitive
            gaming, and web3 — with SEA enterprise pipelines and global IP
            upside.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {markets.map((m) => (
            <div
              key={m.label}
              className="rounded-sm border border-gold/25 bg-gradient-to-b from-gold/10 to-transparent px-6 py-7"
            >
              <p className="font-mono text-[11px] tracking-[0.22em] text-gold uppercase">
                {m.label}
              </p>
              <p className="font-display mt-2 text-4xl text-ink md:text-5xl">
                {m.value}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {streams.map((s) => (
            <div
              key={s.title}
              className="rounded-sm border border-white/8 bg-bg-panel p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl text-ink">{s.title}</h3>
                <span className="font-mono text-[11px] tracking-[0.14em] text-gold-bright uppercase">
                  {s.range}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {s.points.map((p) => (
                  <li
                    key={p}
                    className="flex gap-3 text-sm text-ink-muted before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-gold before:content-['']"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-sm border border-white/8 bg-black/30 px-6 py-5 md:flex md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-ink-muted uppercase">
              Target ARR · 100k users · 12–18 months
            </p>
            <p className="font-display mt-1 text-3xl text-ink">$4.5M – $6.0M</p>
          </div>
          <p className="mt-3 max-w-md text-sm text-ink-muted md:mt-0 md:text-right">
            Raise via SAFE + Token Warrant — exposure to studio IP and the $DARE
            ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}
