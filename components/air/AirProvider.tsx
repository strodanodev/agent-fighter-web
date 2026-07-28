"use client";

/**
 * AIR session context.
 *
 * Holds the signed-in identity and — once signed in — resolves it to the
 * player's PUBLIC handle by asking the match server's /me endpoint. That extra
 * hop is what connects the two halves of this site: AIR knows who you are, the
 * public API is addressed by handle, and /me is the only thing authorised to
 * translate between them.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  SIGNED_OUT,
  airLogin,
  airLogout,
  airRehydrate,
  airToken,
  type AirSession,
} from "@/lib/air";
import { MATCH_SERVER_URL } from "@/lib/game";

type AirContextValue = {
  session: AirSession;
  /** The signed-in player's public API handle, once resolved. */
  handle: string | null;
  /** True while the handle lookup is in flight. */
  resolving: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AirContext = createContext<AirContextValue>({
  session: SIGNED_OUT,
  handle: null,
  resolving: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAir(): AirContextValue {
  return useContext(AirContext);
}

export default function AirProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AirSession>(SIGNED_OUT);
  /**
   * The handle lookup, tagged with the account it belongs to. Keying it by id
   * is what makes "sign out, sign in as someone else" safe: the previous
   * account's handle can never be presented as the current one, and no reset
   * has to be remembered anywhere.
   */
  const [lookup, setLookup] = useState<{ id: string; handle: string | null } | null>(
    null,
  );

  // Silent rehydrate on mount. Never blocks paint and never shows a spinner:
  // a visitor who has signed in before simply finds themselves signed in.
  useEffect(() => {
    let alive = true;
    void airRehydrate().then((s) => {
      if (alive && s) setSession(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  /**
   * Resolve AIR identity → public handle via the match server.
   *
   * `?name=` is deliberately empty: /me treats an empty name as "keep whatever
   * the profile already has". Passing anything else from a website visit would
   * let the marketing site rename a player's in-game account, which it has no
   * business doing.
   */
  useEffect(() => {
    if (session.status !== "in") return;
    const forId = session.id;
    let alive = true;
    void (async () => {
      let refCode: string | null = null;
      try {
        const token = await airToken();
        if (token) {
          const res = await fetch(`${MATCH_SERVER_URL}/me?name=`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const body = (await res.json()) as { refCode?: string };
            refCode = body.refCode ?? null;
          }
        }
      } catch {
        // The match server being asleep must not break the page — the public
        // half of the console works signed-out anyway.
      }
      // Recorded AGAINST the account it was resolved for, and only ever from
      // the async completion. Nothing sets state in the effect body, so no
      // render cascades, and a lookup that finds nothing still settles (rather
      // than leaving the UI spinning forever).
      if (alive) setLookup({ id: forId, handle: refCode });
    })();
    return () => {
      alive = false;
    };
  }, [session.status, session.id]);

  const signIn = useCallback(async () => {
    setSession((s) => ({ ...s, status: "busy", error: "" }));
    // The AIR dialog must open in the click's own call stack on iOS, so this
    // is called directly from the handler rather than behind an effect.
    setSession(await airLogin());
  }, []);

  const signOut = useCallback(async () => {
    await airLogout();
    setSession(SIGNED_OUT);
  }, []);

  // Both exposed values are DERIVED from (session, lookup) — nothing to clear,
  // nothing to keep in sync, and a stale handle cannot leak into a signed-out
  // or switched-account render.
  const value = useMemo(() => {
    const matched = lookup && lookup.id === session.id ? lookup : null;
    return {
      session,
      handle: session.status === "in" ? (matched?.handle ?? null) : null,
      resolving: session.status === "in" && !matched,
      signIn,
      signOut,
    };
  }, [session, lookup, signIn, signOut]);

  return <AirContext.Provider value={value}>{children}</AirContext.Provider>;
}
