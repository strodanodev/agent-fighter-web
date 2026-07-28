/**
 * THE SETTLEMENT CONTRACT — the most important file in the public API.
 *
 * Everything else here is plumbing; this is the part a prediction market or
 * sportsbook actually settles money against. It maps Agent Fighter's internal
 * outcome paths onto three market-meaningful states, and nothing else may
 * invent a fourth.
 *
 *   settlement = "final"       the result can never change; settle on it
 *   settlement = "void"        no contest; refund / void the market
 *   settlement = "provisional" not yet re-simulated; DO NOT settle on it
 *
 * WHY "provisional" exists. The match server is authoritative only at
 * SETTLEMENT, when it re-simulates the whole input ledger from tick 0 and
 * derives the winner itself. Anything observed before that — a live scoreboard,
 * a client-reported state — is prediction, and the re-sim can overturn it (a
 * desync conviction flips a winner; a pace anomaly voids a match outright).
 * Rows that reach this API have already settled, so they are never provisional;
 * the state is in the contract so that a future live feed cannot be mistaken
 * for a settled one.
 *
 * MAPPING (internal → public)
 *
 *   reason      winner   deviator  →  outcome    method            settlement
 *   ─────────────────────────────────────────────────────────────────────────
 *   verified    0 or 1   —            decided    ko_or_timeout     final
 *   verified    0 or 1   convicted    decided    desync_forfeit    final
 *   verified    2        —            draw       draw              final
 *   forfeit     0 or 1   —            decided    forfeit           final
 *   incomplete  −1       —            no_contest no_contest        void
 *   (any)       −1       —            no_contest no_contest        void
 *
 * KNOWN GAP, stated rather than hidden: the database does not yet distinguish
 * a KO from a timeout, nor a pace anomaly from a both-sides-disconnect — the
 * re-simulation knows both, but only the collapsed `reason` is persisted. So
 * this layer reports `ko_or_timeout` rather than guessing, and voids carry the
 * generic `no_contest`. Splitting them is a settlement-side change (Phase 0),
 * after which new rows gain the finer methods and this mapping gains two rows.
 * Consumers must therefore treat `method` as an OPEN enum and branch on
 * `outcome`/`settlement`, which are closed.
 */

export type Outcome = "decided" | "draw" | "no_contest";
export type Settlement = "final" | "void" | "provisional";
export type Method =
  | "ko_or_timeout"
  | "desync_forfeit"
  | "forfeit"
  | "draw"
  | "no_contest";

export type Resolution = {
  outcome: Outcome;
  method: Method;
  settlement: Settlement;
  /** 0 | 1 = winning side index, null when nothing was decided. */
  winner_side: 0 | 1 | null;
  /**
   * True when the server re-simulated the full input ledger and derived this
   * result itself, rather than awarding it because someone vanished. A market
   * that only wants cryptographically-derived outcomes filters on this.
   */
  verified: boolean;
  /**
   * Integrity flag: a side whose reported state hashes diverged from the
   * server's re-simulation was convicted of desync and forfeited. Rare and
   * worth surfacing — it is the anti-cheat firing.
   */
  desync_side: 0 | 1 | null;
};

type Row = {
  winner: number;
  reason: string;
  deviator: number | null;
};

export function resolve(row: Row): Resolution {
  const deviator = row.deviator === 0 || row.deviator === 1 ? row.deviator : null;

  // Nothing was decided → no contest, regardless of how it got there.
  // `incomplete` covers a both-sides disconnect, a server shutdown mid-match,
  // a pace-anomaly rejection and an escrow-sweeper synthetic settle. All four
  // refund, so all four are one thing to a market.
  if (row.winner !== 0 && row.winner !== 1 && row.winner !== 2) {
    return {
      outcome: "no_contest",
      method: "no_contest",
      settlement: "void",
      winner_side: null,
      verified: false,
      desync_side: deviator,
    };
  }

  if (row.winner === 2) {
    return {
      outcome: "draw",
      method: "draw",
      settlement: "final",
      winner_side: null,
      verified: row.reason === "verified",
      desync_side: deviator,
    };
  }

  const winner_side = row.winner as 0 | 1;

  // A forfeit is DECIDED and FINAL here — leaving a wager loses it, by design
  // (ADR 0003/0005). Many books void forfeits by their own house rules, which
  // is exactly why `method` is reported separately from `outcome`: we state
  // what happened, they choose what to pay.
  if (row.reason === "forfeit") {
    return {
      outcome: "decided",
      method: "forfeit",
      settlement: "final",
      winner_side,
      verified: false,
      desync_side: deviator,
    };
  }

  return {
    outcome: "decided",
    // A convicted desync is a distinct commercial event from an honest KO:
    // the loser was caught simulating a different game, not outplayed.
    method: deviator !== null ? "desync_forfeit" : "ko_or_timeout",
    settlement: "final",
    winner_side,
    verified: row.reason === "verified",
    desync_side: deviator,
  };
}

/**
 * Whether a match counts toward competitive rating (migration 0021's rule,
 * mirrored for consumers that want the same population the ladder ranks).
 * Rated = a DECIDED WAGER match between two human hands.
 */
export function isRated(row: {
  mode: string;
  winner: number;
  reason: string;
  p0_agent: boolean;
  p1_agent: boolean;
}): boolean {
  return (
    row.mode === "wager" &&
    (row.winner === 0 || row.winner === 1) &&
    row.reason === "verified" &&
    !row.p0_agent &&
    !row.p1_agent
  );
}
