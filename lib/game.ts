/** Base URL of the playable Agent Fighter client (Canvas SPA). */
export const GAME_URL =
  process.env.NEXT_PUBLIC_GAME_URL?.replace(/\/$/, "") ||
  "https://agent-fighter.vercel.app";

/** Match server (HTTP + WS) — TRAIN MY AGENT / Agent Mode API. */
export const MATCH_SERVER_URL =
  process.env.NEXT_PUBLIC_MATCH_SERVER_URL?.replace(/\/$/, "") ||
  "https://match-server-production.up.railway.app";

/** Match server WebSocket URL for the headless runner (`AF_WS`). */
export const MATCH_SERVER_WS_URL =
  process.env.NEXT_PUBLIC_MATCH_SERVER_WS_URL?.replace(/\/$/, "") ||
  MATCH_SERVER_URL.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");

/** Self-serve durable agent-key mint page (AIR sign-in). */
export const CONNECT_URL = `${MATCH_SERVER_URL}/connect`;

export type GameScreen = "title" | "select" | "play" | "ranks";
export type GameMode = "cpu" | "online";

export function gameHref(opts: {
  screen?: GameScreen;
  mode?: GameMode;
  char?: string;
  /** Referral dare code — the game stashes it and redeems on first login. */
  ref?: string;
  /** Dare-vs-agent (ADR 0006): the accepter fights the SENDER's trained agent. */
  vsAgent?: boolean;
} = {}): string {
  const q = new URLSearchParams();
  if (opts.screen) q.set("screen", opts.screen);
  if (opts.mode) q.set("mode", opts.mode);
  if (opts.char) q.set("char", opts.char);
  if (opts.ref) q.set("ref", opts.ref);
  if (opts.vsAgent) q.set("agent", "1");
  const qs = q.toString();
  return qs ? `${GAME_URL}/?${qs}` : `${GAME_URL}/`;
}

export type FighterCard = {
  id: string;
  name: string;
  tag: string;
  blurb: string;
  featured?: boolean;
  disabled?: boolean;
};

/** Animoca Minds — create & deploy custom agents as fighters. */
export const MINDS_URL = "https://www.hellominds.ai/";
export const SKILL_BAZAAR_URL = "https://www.hellominds.ai/bazaar";
export const MINDS_LOGO_SRC = "/assets/partners/animoca-minds.png";
/** SVG lockup (official Minds mark + wordmark) for dark UI. */
export const MINDS_LOGO_SVG = "/assets/partners/animoca-minds.svg";

export const ADD_YOUR_AGENT = {
  id: "add-agent",
  name: "Add your Agent",
  tag: "MINDS",
  blurb: "Generate and deploy your own fighter with Animoca Minds.",
} as const;

export type AddAgentCard = typeof ADD_YOUR_AGENT;
export type RosterCard = FighterCard | AddAgentCard;

export function isAddAgent(card: RosterCard): card is AddAgentCard {
  return card.id === ADD_YOUR_AGENT.id;
}

/** Selectable marketing roster (mirrors enabled in-game fighters). */
export const FIGHTERS: FighterCard[] = [
  {
    id: "blaze",
    name: "Mr.Beast",
    tag: "FEATURED",
    blurb: "Rushdown pressure. Season spotlight.",
    featured: true,
  },
  {
    id: "0xzero",
    name: "Jeffrey",
    tag: "TANK",
    blurb: "Extra health. Big head energy.",
  },
  {
    id: "vector",
    name: "Diddy",
    tag: "FLASH",
    blurb: "Sunglasses pressure. Cross-chain confirms.",
  },
  {
    id: "t800",
    name: "T-800",
    tag: "HEAVY",
    blurb: "Slow windup. Hard confirms.",
  },
  {
    id: "jensen",
    name: "Jensen",
    tag: "TECH",
    blurb: "Zoning and chip control.",
  },
  {
    id: "unitree-g1",
    name: "Unitree G1",
    tag: "ROBOT",
    blurb: "Machine footsies.",
  },
  {
    id: "bato",
    name: "Bato",
    tag: "SPEED",
    blurb: "Fast normals. Fast turns.",
  },
  {
    id: "elon",
    name: "Elon",
    tag: "CHAOS",
    blurb: "High variance toolkit.",
  },
  {
    id: "yatsiu",
    name: "Yatsiu",
    tag: "STYLE",
    blurb: "Flash cancels.",
  },
  {
    id: "gbush",
    name: "GBush",
    tag: "GRAPPLER",
    blurb: "Command grabs.",
  },
  {
    id: "kim",
    name: "Kim",
    tag: "TYRANT",
    blurb: "Command presence. Hard reads.",
  },
];

export function portraitSrc(id: string): string {
  return `/characters/${id}/sprites/_select.png`;
}
