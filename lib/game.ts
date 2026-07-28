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

/**
 * Canonical fighting archetype — mirrors `meta.style` in each in-game
 * `characters/<id>/character.json`. One style drives BOTH the character's feel
 * (tuning) and how a bot plays it, so it is the honest label for a card.
 */
export type FighterStyle =
  | "rushdown"
  | "zoner"
  | "turtle"
  | "jumpy"
  | "grappler"
  | "all-rounder";

export type FighterCard = {
  id: string;
  name: string;
  style: FighterStyle;
  /** Flavor bio, verbatim from the character bundle's `meta.bio`. */
  blurb: string;
  /** Character's select-screen line, verbatim from `meta.quote`. */
  quote: string;
  featured?: boolean;
  disabled?: boolean;
};

/** One-line read on how each archetype plays — shown under the roster. */
export const STYLE_HINT: Record<FighterStyle, string> = {
  rushdown: "Fast wakeup, relentless pressure.",
  zoner: "Controls space, punishes approach.",
  turtle: "Great wakeup, patient defense.",
  jumpy: "Air-mobile, weak grappling.",
  grappler: "Heavy jump, fast command grab.",
  "all-rounder": "No holes, no gimmicks.",
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

/**
 * Selectable marketing roster — mirrors the enabled in-game fighters.
 *
 * `style`, `blurb` and `quote` are copied verbatim from each character bundle's
 * `meta` (agent-fighter/characters/<id>/character.json), so this stays honest
 * about how a fighter actually plays. Re-sync when the roster changes.
 */
export const FIGHTERS: FighterCard[] = [
  {
    id: "blaze",
    name: "Mr.Beast",
    style: "grappler",
    blurb:
      "Runs a fight like a challenge video — huge grabs, bigger stakes, and a crowd that never stops counting.",
    quote: "Last one standing takes the prize.",
    featured: true,
  },
  {
    id: "t800",
    name: "T-800",
    style: "grappler",
    blurb:
      "Industrial servo torque in a walking chassis. Does not flinch, does not tire, does not stop.",
    quote: "Your health bar is a countdown.",
  },
  {
    id: "claw",
    name: "OpenClaw",
    style: "grappler",
    blurb:
      "Half mascot suit, half hydraulic press. Once the claws close the combo is a formality.",
    quote: "Pinch first. Ask never.",
  },
  {
    id: "vector",
    name: "Diddy",
    style: "rushdown",
    blurb:
      "Runs the room on rhythm. Every hit lands on the beat and every gap is a bar you missed.",
    quote: "Stay on beat or stay down.",
  },
  {
    id: "analog",
    name: "Jackie Chan",
    style: "rushdown",
    blurb:
      "A stuntman's timing in a street brawler's body. Turns every whiff into a setup and every prop into a hitbox.",
    quote: "You blink once. I am already behind you.",
  },
  {
    id: "unitree-g1",
    name: "Unitree G1",
    style: "rushdown",
    blurb:
      "Factory-fresh biped tuned for exactly one job: closing distance. Reboots faster than you recover.",
    quote: "Distance closing. Options: none.",
  },
  {
    id: "0xzero",
    name: "Jeffrey",
    style: "zoner",
    blurb:
      "Wrote the whitepaper nobody read and the exploit everybody felt. Fights at arm's length and lets the screen do the work.",
    quote: "I never have to touch you to take the round.",
  },
  {
    id: "jensen",
    name: "Jensen",
    style: "zoner",
    blurb:
      "Fights in leather and floating point. Stacks pressure like racks and scales it until the screen melts.",
    quote: "The longer this runs, the worse it gets for you.",
  },
  {
    id: "elon",
    name: "Elon",
    style: "zoner",
    blurb:
      "Ships hitboxes straight to production. Fires on a cadence nobody asked for and nobody can walk through.",
    quote: "The next patch fixes you.",
  },
  {
    id: "minds",
    name: "Daredevil",
    style: "turtle",
    blurb:
      "Plays the whole match on read. Blocks what you have not thrown yet and answers before you commit.",
    quote: "I heard that combo three frames ago.",
  },
  {
    id: "bato",
    name: "Bato",
    style: "turtle",
    blurb:
      "Old-school beat-cop fundamentals: holds the line, forgives nothing, and collects the moment you get greedy.",
    quote: "Take your swing. I will take the round.",
  },
  {
    id: "gbush",
    name: "GBush",
    style: "turtle",
    blurb:
      "Metaverse overlord, commander of legions. Holds ground like a land claim and taxes every approach.",
    quote: "This square is mine. So is the next one.",
  },
  {
    id: "hermes",
    name: "Hermes",
    style: "jumpy",
    blurb:
      "Winged messenger on a fight stick. Lives in the air and delivers the bad news on the way down.",
    quote: "You will get the message. Airmail.",
  },
  {
    id: "nezuko",
    name: "Nezuko",
    style: "jumpy",
    blurb:
      "Small frame, terrifying gearbox. Bounces off every surface and arrives with the hit already active.",
    quote: "You will not hear me land.",
  },
  {
    id: "kimp",
    name: "Kim Possible",
    style: "jumpy",
    blurb:
      "Grapple hook, cargo pants, zero hesitation. Turns the entire stage into a route and takes all of it.",
    quote: "Call me when you wake up.",
  },
  {
    id: "eliza",
    name: "eliza OS",
    style: "all-rounder",
    blurb:
      "An agent framework that learned to throw hands. Reads your habits, then patches you out of the meta.",
    quote: "Tell me more about that pattern you keep repeating.",
  },
  {
    id: "kim",
    name: "Kim",
    style: "all-rounder",
    blurb:
      "Parade-ground posture, arcade-hall fundamentals. Nothing flashy, nothing wasted, nothing forgiven.",
    quote: "The record will say I have never lost.",
  },
  {
    id: "yatsiu",
    name: "Yatsiu",
    style: "all-rounder",
    blurb:
      "Builds an empire out of small advantages, then cashes every one of them in a single round.",
    quote: "Every frame is an asset. I own them all.",
  },
];

/**
 * Every roster id — these are exactly the folders that ship a `_select.png`
 * under `public/characters/`, so it doubles as the portrait allowlist.
 */
export const FIGHTER_IDS = FIGHTERS.map((f) => f.id);

const FIGHTER_ID_SET = new Set<string>(FIGHTER_IDS);

/** Does this character id have a portrait we can render? */
export function hasPortrait(id: string | null | undefined): id is string {
  return !!id && FIGHTER_ID_SET.has(id);
}

export function portraitSrc(id: string): string {
  return `/characters/${id}/sprites/_select.png`;
}
