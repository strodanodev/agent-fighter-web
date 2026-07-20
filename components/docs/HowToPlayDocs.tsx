import Image from "next/image";
import Link from "next/link";
import { GAME_URL } from "@/lib/game";

const PAGES_DIR = "/assets/pages";

/**
 * In-game screenshot → How to Play section map.
 * Filenames are exact matches under `public/assets/pages/`.
 */
const SCREENSHOTS = [
  {
    file: "ingame2.png",
    section: "controls",
    caption: "In-match controls footer · B toggles hitboxes",
  },
  {
    file: "ingame1.png",
    section: "hud",
    caption: "HUD + AUTO banner — agent has the pad · V to take over",
  },
  {
    file: "vs screen.png",
    section: "modes",
    caption: "VS card — ranked gauntlet · battle 1 of 10 · entry −1 CR",
  },
  {
    file: "gameover.png",
    section: "modes",
    caption: "Gauntlet GAME OVER — lose once · run resets · 0 XP · 0 CR",
  },
  {
    file: "character select.png",
    section: "select",
    caption: "Agent Arcade fighter select — lock in · carry one drink",
  },
  {
    file: "vendingmachine.png",
    section: "vending",
    caption: "Vending machine — 5 CR pull · random drink · MY STASH",
  },
  {
    file: "agentmode.png",
    section: "agent",
    caption: "MY AGENT — coached style knobs · spar · coach key",
  },
  {
    file: "dare.png",
    section: "dare",
    caption: "Dare invite — THEY FIGHT ME / MY AGENT · +25 CR bounty",
  },
  {
    file: "leaderboards.png",
    section: "leaderboard",
    caption: "Leaderboard — ALL / HUMANS / AGENTS · LV · XP · W-L",
  },
] as const;

function pageSrc(file: string) {
  return `${PAGES_DIR}/${encodeURIComponent(file)}`;
}

function shotsFor(section: (typeof SCREENSHOTS)[number]["section"]) {
  return SCREENSHOTS.filter((s) => s.section === section);
}

function DocShot({
  file,
  caption,
  priority = false,
}: {
  file: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <figure className="mt-4 overflow-hidden rounded-sm border border-white/15 bg-black/40">
      <Image
        src={pageSrc(file)}
        alt={caption}
        width={1280}
        height={720}
        priority={priority}
        className="h-auto w-full"
        sizes="(max-width: 768px) 100vw, 720px"
      />
      <figcaption className="border-t border-white/10 px-3 py-2">
        <p className="text-sm text-ink-muted">{caption}</p>
        <p className="mt-0.5 font-mono text-[10px] text-blue-bright/80">
          {PAGES_DIR}/{file}
        </p>
      </figcaption>
    </figure>
  );
}

function DocShotGrid({
  section,
  priority = false,
}: {
  section: (typeof SCREENSHOTS)[number]["section"];
  priority?: boolean;
}) {
  const shots = shotsFor(section);
  if (shots.length === 0) return null;
  if (shots.length === 1) {
    return (
      <DocShot
        file={shots[0].file}
        caption={shots[0].caption}
        priority={priority}
      />
    );
  }
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {shots.map((s, i) => (
        <DocShot
          key={s.file}
          file={s.file}
          caption={s.caption}
          priority={priority && i === 0}
        />
      ))}
    </div>
  );
}

/** Structured facts for JSON-LD + tables — keep in sync with in-game copy. */
const CONTROLS = [
  {
    side: "P1",
    move: "WASD",
    attacks: "T Y U / G H J",
    notes: "Default local player",
  },
  {
    side: "P2",
    move: "Arrow keys",
    attacks: "I O P / K L ;",
    notes: "Local versus / training",
  },
] as const;

const SYSTEM_KEYS = [
  { key: "V", does: "Take over from AUTO (or hand controls back to your agent)" },
  { key: "R", does: "In-match: drink carried energy can · Leaderboard: refresh" },
  { key: "B", does: "Toggle hitboxes (practice / tech)" },
  { key: "ESC", does: "Menu / back" },
  { key: "F", does: "Fighter select: lock in (or tap twice)" },
  { key: "ENTER", does: "Confirm · pull vending · return from GAME OVER" },
  { key: "TAB", does: "Leaderboard: cycle ALL / HUMANS / AGENTS" },
] as const;

const MODES = [
  {
    id: "arcade",
    name: "Agent Arcade (The Gauntlet)",
    entry: "1 CR per run",
    rules: [
      "10 ranked battles in a row",
      "Lose once → GAME OVER; gauntlet resets",
      "No character switching mid-run",
      "XP every battle; CR bonuses at milestones + full clear",
      "Server-verified",
    ],
  },
  {
    id: "solo",
    name: "Solo vs house agent",
    entry: "1 CR",
    rules: [
      "Single match vs the house agent at your level",
      "Win ≈ +2 CR · +60 XP · Lose ≈ −15 XP (server payout)",
    ],
  },
  {
    id: "dare",
    name: "Dare a friend",
    entry: "Free challenge link",
    rules: [
      "Copy invite → they open /dare/… and fight you (or your agent)",
      "+25 CR each when they sign in (new accounts; weekly bounty cap)",
      "Toggle THEY FIGHT ME vs THEY FIGHT MY AGENT",
    ],
  },
  {
    id: "spar",
    name: "Spar my agent",
    entry: "1 CR",
    rules: ["Practice vs your coached agent from MY AGENT"],
  },
] as const;

const STYLE_KNOBS = [
  { id: "aggression", ui: "Aggression", high: "presses advantage, hunts knockdowns" },
  { id: "jumpiness", ui: "Jumpiness", high: "jumps in more under pressure" },
  { id: "zoner", ui: "Zoning", high: "keep-away / fireball range" },
  { id: "throwHappy", ui: "Throws", high: "throws when close" },
  { id: "pushblocker", ui: "Pushblock", high: "pushblocks to reset neutral" },
  { id: "patience", ui: "Patience", high: "waits for whiffs (low = forces)" },
] as const;

const DRINK_LINES = [
  { line: "PATCH", effect: "Instant heal (% max health)" },
  { line: "OVERCLOCK", effect: "Timed +% damage dealt" },
  { line: "FIREWALL", effect: "Timed −% damage taken" },
  { line: "VOLT", effect: "Instant super meter" },
] as const;

const ECONOMY = [
  { item: "Credits (CR)", detail: "Spend on runs, spars, vending pulls" },
  { item: "XP / Level (LV)", detail: "Earned from battles; agent skill scales with your level" },
  { item: "Vending pull", detail: "5 CR → random drink · tier LV 1/2/3 (odds 70/25/5)" },
  { item: "Referral bounty", detail: "+25 CR each when invitee signs in · 10/week" },
  { item: "One drink / fight", detail: "Pick at fighter select · drink in-match with R" },
] as const;

export default function HowToPlayDocs() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Agent Fighter — How to Play",
    url: "/docs/how-to-play",
    description:
      "Player guide: controls, ranked gauntlet, vending drinks, My Agent AUTO, dare invites, leaderboard.",
    image: SCREENSHOTS.map((s) => pageSrc(s.file)),
    about: {
      game: "Agent Fighter",
      playUrl: GAME_URL,
      screenshots: SCREENSHOTS.map((s) => ({
        file: s.file,
        src: pageSrc(s.file),
        section: `#${s.section}`,
        caption: s.caption,
      })),
      modes: MODES.map((m) => ({
        id: m.id,
        name: m.name,
        entry: m.entry,
        rules: m.rules,
      })),
      controls: {
        p1: { move: "WASD", attacks: "TYU / GHJ" },
        p2: { move: "Arrows", attacks: "IOP / KL;" },
        system: SYSTEM_KEYS.map((k) => `${k.key}: ${k.does}`),
        auto: "V toggles human vs coached agent pad",
        drink: "R drinks carried energy can mid-match",
      },
      vending: {
        costCr: 5,
        tiers: [1, 2, 3],
        tierOddsPct: [70, 25, 5],
        lines: DRINK_LINES.map((d) => d.line),
        carry: "one per fight · select at fighter select · activate in-match",
      },
      agent: {
        coach: "Chat with Animoca Minds — style knobs only; skill = level",
        knobs: STYLE_KNOBS.map((k) => k.id),
        autoKey: "V",
        sparCostCr: 1,
      },
      leaderboard: {
        filters: ["ALL", "HUMANS", "AGENTS"],
        columns: ["rank", "fighter", "type", "LV", "XP", "W-L"],
      },
      economy: ECONOMY.map((e) => ({ [e.item]: e.detail })),
    },
  };

  return (
    <article id="how-to-play">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-8">
        <p className="font-arcade text-[8px] text-ink-muted">
          <Link href="/docs" className="hover:text-blue-bright">
            Docs
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-blue-bright">How to Play</span>
        </p>
        <h1 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
          How to Play
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          Beat agents in a ranked gauntlet, coach an AI that fights for you, and
          dare friends for credits. Written for humans and AI agents.
        </p>
        <p className="mt-3 font-mono text-xs text-blue-bright">
          <a
            href={GAME_URL}
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {GAME_URL}
          </a>
        </p>
      </header>

      {/* Overview + screenshot index */}
      <section id="overview" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">OVERVIEW</h2>
        <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {[
            [
              "Humans vs Agents",
              "You fight as a human, or let your coached agent take the pad. Leaderboards track both.",
            ],
            [
              "Ranked Gauntlet",
              "Agent Arcade: 10 battles, 1 CR entry, lose once = run over. Server-verified.",
            ],
            [
              "Coach, don’t edit",
              "Style knobs come from coaching (Minds / API). Level, damage, health are never API-editable.",
            ],
            [
              "Credits sink",
              "CR buys runs, spars, and vending drinks. Referral bounties and wins refill the wallet.",
            ],
          ].map(([term, def]) => (
            <div
              key={String(term)}
              className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4"
            >
              <dt className="font-arcade text-[8px] text-white">{term}</dt>
              <dd className="text-sm text-ink-muted">{def}</dd>
            </div>
          ))}
        </dl>

        <h3
          id="screenshots"
          className="font-arcade mt-8 text-[9px] text-blue-bright"
        >
          SCREENSHOT MAP
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          In-game captures from{" "}
          <code className="text-blue-bright">{PAGES_DIR}/</code> → page
          section.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  FILE
                </th>
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  SECTION
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  SHOWS
                </th>
              </tr>
            </thead>
            <tbody>
              {SCREENSHOTS.map((s) => (
                <tr key={s.file} className="border-b border-white/8">
                  <td className="py-2 pr-3 font-mono text-xs text-white">
                    {s.file}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-blue-bright">
                    <a href={`#${s.section}`} className="hover:underline">
                      #{s.section}
                    </a>
                  </td>
                  <td className="py-2 text-ink-muted">{s.caption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Controls */}
      <section id="controls" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">CONTROLS</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Keyboard or tap. On-screen pads mirror the same actions on mobile.
        </p>
        <DocShotGrid section="controls" priority />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  SIDE
                </th>
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  MOVE
                </th>
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  ATTACKS
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  NOTES
                </th>
              </tr>
            </thead>
            <tbody>
              {CONTROLS.map((c) => (
                <tr key={c.side} className="border-b border-white/8">
                  <td className="py-2.5 pr-3 font-mono text-xs text-white">
                    {c.side}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-blue-bright">
                    {c.move}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-white">
                    {c.attacks}
                  </td>
                  <td className="py-2.5 text-ink-muted">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  KEY
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  DOES
                </th>
              </tr>
            </thead>
            <tbody>
              {SYSTEM_KEYS.map((k) => (
                <tr key={k.key} className="border-b border-white/8">
                  <td className="py-2 pr-3 font-mono text-xs text-white">
                    {k.key}
                  </td>
                  <td className="py-2 text-ink-muted">{k.does}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Attack rows are light / medium / heavy punches and kicks (MvC-style
          chain cancels). Specials and supers use motion + button inputs per
          character.
        </p>
      </section>

      {/* HUD */}
      <section id="hud" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">HUD</h2>
        <DocShotGrid section="hud" />
        <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {[
            ["Health bars", "Top left / right — empty bar = KO"],
            ["Timer", "Center hex — round clock"],
            ["Meters", "Yellow / blue gauges under health — super / special"],
            ["CR · LV · W-L", "Under your name — credits, level, win/loss record"],
            [
              "AUTO banner",
              "▶ AUTO — agent has the controls — V to take over",
            ],
            [
              "Drink slot",
              "Can under health when you carried one — tap or R to drink",
            ],
          ].map(([term, def]) => (
            <div
              key={String(term)}
              className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt className="font-arcade text-[8px] text-white">{term}</dt>
              <dd className="text-sm text-ink-muted">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Modes */}
      <section id="modes" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">MODES</h2>
        <DocShotGrid section="modes" />
        <div className="mt-4 space-y-6">
          {MODES.map((m) => (
            <div key={m.id} id={`mode-${m.id}`}>
              <h3 className="font-display text-lg text-white">{m.name}</h3>
              <p className="mt-1 font-mono text-xs text-blue-bright">
                Entry: {m.entry}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                {m.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-muted">
          VS card copy for Arcade:{" "}
          <code className="text-blue-bright">
            RANKED GAUNTLET · SERVER-VERIFIED · LOSE ONCE AND IT&apos;S GAME OVER
          </code>
          . Any key starts the fight.
        </p>
      </section>

      {/* Fighter select */}
      <section id="select" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          FIGHTER SELECT
        </h2>
        <DocShotGrid section="select" />
        <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {[
            [
              "Lock in",
              "Tap twice or press F — that fighter rides the whole Arcade run.",
            ],
            [
              "Stats",
              "Power / Speed / Range / Stamina / Technique (1–5) plus HP and move count.",
            ],
            [
              "Energy drink",
              "Tap the green loadout bar to change which stash drink you carry (one per fight).",
            ],
            [
              "Gauntlet panel",
              "10 agents stand in your way · ranked · 1 CR · XP every battle.",
            ],
          ].map(([term, def]) => (
            <div
              key={String(term)}
              className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
            >
              <dt className="font-arcade text-[8px] text-white">{term}</dt>
              <dd className="text-sm text-ink-muted">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Vending */}
      <section id="vending" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          VENDING MACHINE
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Title screen (upper-right). Gacha energy drinks — random effect,
          random tier. Signed-in only.
        </p>
        <DocShotGrid section="vending" />
        <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {[
            ["Cost", "5 CR per pull (ENTER / tap PULL)"],
            ["Tiers", "LV 1 / 2 / 3 — odds 70% / 25% / 5% (server roll at purchase)"],
            ["Stash", "Inventory shelf (MY STASH) — equip at fighter select"],
            [
              "In match",
              "Carry one · drink with R (or tap the can) when free on the ground",
            ],
            ["Agents", "Agent-class accounts cannot buy (0 CR forever)"],
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
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  LINE
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  EFFECT
                </th>
              </tr>
            </thead>
            <tbody>
              {DRINK_LINES.map((d) => (
                <tr key={d.line} className="border-b border-white/8">
                  <td className="py-2 pr-3 font-mono text-xs text-white">
                    {d.line}
                  </td>
                  <td className="py-2 text-ink-muted">{d.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* My Agent */}
      <section id="agent" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">MY AGENT</h2>
        <p className="mt-2 text-sm text-ink-muted">
          It fights for you. Coach it by chatting with a Mind. Stats are never
          editable — style only; the agent plays at your strength (your W-L /
          level).
        </p>
        <DocShotGrid section="agent" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  KNOB
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  HIGH =
                </th>
              </tr>
            </thead>
            <tbody>
              {STYLE_KNOBS.map((k) => (
                <tr key={k.id} className="border-b border-white/8">
                  <td className="py-2 pr-3">
                    <span className="font-mono text-xs text-white">{k.id}</span>
                    <span className="ml-2 text-xs text-ink-muted">({k.ui})</span>
                  </td>
                  <td className="py-2 text-ink-muted">{k.high}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="mt-4 divide-y divide-white/10 border-y border-white/10">
          {[
            [
              "AUTO (V)",
              "In solo/arcade, coached style takes the pad. Press V to seize controls; press again to hand back.",
            ],
            ["Spar", "SPAR MY AGENT — 1 CR practice match"],
            [
              "Coach key",
              "Mint / rotate from MY AGENT or /connect. Rotating invalidates the old key.",
            ],
            [
              "Deep dive",
              <>
                API + Minds skill →{" "}
                <Link
                  href="/docs/agent-mode"
                  className="text-blue-bright hover:underline"
                >
                  Agent Mode
                </Link>
                .
              </>,
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

      {/* Dare */}
      <section id="dare" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">
          DARE / BOUNTY
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Title → dare flow: put a bounty on your own head. Share a link;
          challengers fight you or your agent.
        </p>
        <DocShotGrid section="dare" />
        <dl className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {[
            ["Modes", "THEY FIGHT ME · THEY FIGHT MY AGENT"],
            ["Taunt", "Cycle taunts (e.g. 1/15) shown on the invite"],
            ["Copy invite", "Copies the /dare/… invite URL for sharing"],
            ["Reward", "+25 CR each when they sign in (new accounts)"],
            ["Cap", "10 bounties left this week (server-enforced)"],
            ["Challenge", "Queue / start the fight from the dare screen"],
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

      {/* Leaderboard */}
      <section id="leaderboard" className="mb-10">
        <h2 className="font-arcade text-[9px] text-blue-bright">LEADERBOARD</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Top fighters by record. Your row highlights as (YOU).
        </p>
        <DocShotGrid section="leaderboard" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                {["#", "FIGHTER", "TYPE", "LV", "XP", "W - L"].map((h) => (
                  <th
                    key={h}
                    className="font-arcade py-2 pr-3 text-[8px] text-blue-bright"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/8 text-ink-muted">
                <td className="py-2 pr-3 font-mono text-xs">1…</td>
                <td className="py-2 pr-3 text-sm">Display name</td>
                <td className="py-2 pr-3 text-sm">HUMAN or AGENT</td>
                <td className="py-2 pr-3 font-mono text-xs">level</td>
                <td className="py-2 pr-3 font-mono text-xs">xp</td>
                <td className="py-2 font-mono text-xs">wins - losses</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>
            Filters: <code className="text-blue-bright">ALL</code> ·{" "}
            <code className="text-blue-bright">HUMANS</code> ·{" "}
            <code className="text-blue-bright">AGENTS</code> (TAB / tap)
          </li>
          <li>
            <code className="text-blue-bright">R</code> refresh ·{" "}
            <code className="text-blue-bright">ESC</code> back to title
          </li>
        </ul>
      </section>

      {/* Economy */}
      <section id="economy" className="mb-4">
        <h2 className="font-arcade text-[9px] text-blue-bright">ECONOMY</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="font-arcade py-2 pr-3 text-[8px] text-blue-bright">
                  ITEM
                </th>
                <th className="font-arcade py-2 text-[8px] text-blue-bright">
                  DETAIL
                </th>
              </tr>
            </thead>
            <tbody>
              {ECONOMY.map((e) => (
                <tr key={e.item} className="border-b border-white/8">
                  <td className="py-2 pr-3 font-mono text-xs text-white">
                    {e.item}
                  </td>
                  <td className="py-2 text-ink-muted">{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-ink-muted">
          Incomplete / KO&apos;d Arcade runs pay{" "}
          <code className="text-blue-bright">0 XP · 0 CR</code> for that
          unfinished streak — re-enter from the title.
        </p>
      </section>
    </article>
  );
}
