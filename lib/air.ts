"use client";

/**
 * AIR Kit sign-in for the marketing site.
 *
 * Same AIR partner app, same accounts, same database as the game — signing in
 * here IS signing in there. That is the point: a player arrives from a link,
 * signs in on the website, and sees their own record without a second identity
 * to reconcile.
 *
 * The SDK is loaded as a UMD script from the GAME origin rather than bundled
 * from npm. Three reasons, in order of importance:
 *  1. It is a browser-only SDK that touches `window` at module scope; importing
 *     it into a server-rendered Next tree is a class of bug we get to skip
 *     entirely by never letting it exist until a click.
 *  2. This is a marketing site — the SDK must not sit in the first-load bundle
 *     of a landing page that mostly serves people who will never sign in.
 *  3. The game client (`packages/client/src/auth.ts`) and the match server's
 *     /connect page already do exactly this, against the same URL. Three
 *     copies of one pattern beats two patterns.
 *
 * The partner id is a PUBLIC client identifier, like a Firebase app id.
 * Committing it is fine; a secretless client can do nothing privileged with it.
 */

const AIR_PARTNER_ID =
  process.env.NEXT_PUBLIC_AIR_PARTNER_ID ||
  "cdbfc9c4-62db-4947-b0de-c28932887132";

/** `sandbox` = Moca Chain Testnet, matching the game's default. */
const AIR_BUILD_ENV = process.env.NEXT_PUBLIC_AIR_ENV || "sandbox";

const AIRKIT_UMD =
  process.env.NEXT_PUBLIC_AIRKIT_UMD ||
  "https://agent-fighter.vercel.app/vendor/airkit.umd.js";

/** Minimal structural mirrors of @mocanetwork/airkit — no npm dependency. */
type AirLoginLite = {
  isLoggedIn: boolean;
  id: string;
  abstractAccountAddress?: string;
  token: string;
};
type AirServiceLite = {
  isLoggedIn: boolean;
  loginResult: AirLoginLite | null;
  init(cfg: { buildEnv?: string; enableLogging?: boolean }): Promise<AirLoginLite | null>;
  login(): Promise<AirLoginLite>;
  logout(): Promise<void>;
  getUserInfo(): Promise<{
    user: { id: string; email?: string; abstractAccountAddress?: string };
  }>;
  getAccessToken(): Promise<{ token: string }>;
};
type AirkitGlobal = {
  AirService: new (cfg: { partnerId: string }) => AirServiceLite;
};

declare global {
  interface Window {
    Airkit?: AirkitGlobal;
  }
}

export type AirStatus = "out" | "busy" | "in" | "error";

export type AirSession = {
  status: AirStatus;
  /** AIR user id — the subject the match server keys progression on. */
  id: string;
  address: string;
  email: string;
  error: string;
};

export const SIGNED_OUT: AirSession = {
  status: "out",
  id: "",
  address: "",
  email: "",
  error: "",
};

let service: AirServiceLite | null = null;
let sdkLoading: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Airkit) return Promise.resolve();
  sdkLoading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = AIRKIT_UMD;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      // Reset so a later attempt can retry rather than being stuck on a
      // rejected promise for the lifetime of the page.
      sdkLoading = null;
      reject(new Error("Could not load the AIR Kit SDK."));
    };
    document.head.appendChild(s);
  });
  return sdkLoading;
}

async function ensureService(): Promise<AirServiceLite> {
  await loadSdk();
  if (!service) {
    service = new window.Airkit!.AirService({ partnerId: AIR_PARTNER_ID });
    // init() rehydrates a previous session — AIR keeps logins for ~30 days,
    // so a returning visitor is signed in before they touch anything.
    await service.init({ buildEnv: AIR_BUILD_ENV });
  }
  return service;
}

async function sessionFrom(r: AirLoginLite | null): Promise<AirSession | null> {
  if (!r?.isLoggedIn) return null;
  const out: AirSession = {
    status: "in",
    id: r.id,
    address: r.abstractAccountAddress ?? "",
    email: "",
    error: "",
  };
  try {
    const info = await service!.getUserInfo();
    out.email = info.user.email ?? "";
    out.address ||= info.user.abstractAccountAddress ?? "";
  } catch {
    // Email and address are cosmetic here; the id is what matters.
  }
  return out;
}

/** Silent probe on mount: restores a previous session with no UI at all. */
export async function airRehydrate(): Promise<AirSession | null> {
  try {
    const svc = await ensureService();
    return await sessionFrom(svc.loginResult);
  } catch {
    return null; // SDK blocked or offline — stay signed out, never throw.
  }
}

/** Interactive sign-in (AIR's own dialog: Google / email / wallet). */
export async function airLogin(): Promise<AirSession> {
  try {
    const svc = await ensureService();
    const existing = await sessionFrom(svc.loginResult);
    if (existing) return existing;
    return (
      (await sessionFrom(await svc.login())) ?? {
        ...SIGNED_OUT,
        status: "out",
      }
    );
  } catch (e) {
    return {
      ...SIGNED_OUT,
      status: "error",
      error: (e as Error).message || "Sign-in failed.",
    };
  }
}

export async function airLogout(): Promise<void> {
  try {
    await service?.logout();
  } catch {
    // Session already gone server-side; local state clears either way.
  }
}

/**
 * A FRESH access token. Always call this immediately before an authenticated
 * request — AIR tokens expire, and the one captured at login goes stale while
 * a tab sits open.
 */
export async function airToken(): Promise<string | null> {
  if (!service) return null;
  try {
    const { token } = await service.getAccessToken();
    return token || null;
  } catch {
    return null;
  }
}

/** Short display handle: email user, else 0xAB…CDEF, else the id stub. */
export function airDisplayName(s: AirSession): string {
  if (s.email) return s.email.split("@")[0]!.slice(0, 18).toUpperCase();
  if (s.address) return `${s.address.slice(0, 6)}…${s.address.slice(-4)}`;
  return s.id.slice(0, 8).toUpperCase();
}
