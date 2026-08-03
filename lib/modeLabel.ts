/**
 * Display labels for match modes.
 *
 * The API's `mode` values are a WIRE CONTRACT that third parties already
 * ingest and filter on (`wager` among them), so they are never renamed here —
 * a breaking rename belongs to an API version bump, not a copy pass. What the
 * SITE renders is a different question, and the answer is this map: readers
 * see "ranked pvp", matching what the game itself calls the mode on its own
 * title screen.
 *
 * One map, so a label can never drift between the console, the charts and the
 * docs.
 */
export const MODE_LABEL: Record<string, string> = {
  wager: "ranked pvp",
  arcade: "arcade",
  solo: "solo",
  friendly: "friendly",
};

/** Human label for a mode, falling back to the raw value for a new one. */
export const modeLabel = (mode: string): string => MODE_LABEL[mode] ?? mode;
