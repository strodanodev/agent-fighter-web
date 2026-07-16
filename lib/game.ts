/** Base URL of the playable Agent Fighter client (Canvas SPA). */
export const GAME_URL =
  process.env.NEXT_PUBLIC_GAME_URL?.replace(/\/$/, "") ||
  "https://agent-fighter.vercel.app";

export type GameScreen = "title" | "select" | "play" | "ranks";
export type GameMode = "cpu" | "online";

export function gameHref(opts: {
  screen?: GameScreen;
  mode?: GameMode;
  char?: string;
} = {}): string {
  const q = new URLSearchParams();
  if (opts.screen) q.set("screen", opts.screen);
  if (opts.mode) q.set("mode", opts.mode);
  if (opts.char) q.set("char", opts.char);
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
    name: "Blaze",
    tag: "FEATURED",
    blurb: "Rushdown pressure. Season spotlight.",
    featured: true,
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
];

export function portraitSrc(id: string): string {
  return `/characters/${id}/sprites/_select.png`;
}
