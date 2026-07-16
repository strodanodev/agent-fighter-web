"use client";

import { useEffect, useState, type RefObject } from "react";

/** Shared client capability flags for 60fps budgeting. */
export type PerfProfile = {
  /** Coarse pointer / narrow viewport — treat as mobile. */
  mobile: boolean;
  /** User asked to cut motion. */
  reducedMotion: boolean;
  /** Save-Data or Effective Connection ≤ 2g. */
  saveData: boolean;
  /** Skip decorative WebGL accents entirely. */
  skipAccents: boolean;
  /** Cap device pixel ratio for canvases. */
  dpr: [number, number] | number;
  /** Rain / particle density multiplier (0–1). */
  density: number;
};

function readProfile(): PerfProfile {
  if (typeof window === "undefined") {
    return {
      mobile: false,
      reducedMotion: false,
      saveData: false,
      skipAccents: false,
      dpr: [1, 1.5],
      density: 1,
    };
  }

  const mobile =
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const saveData =
    Boolean(conn?.saveData) ||
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "2g";

  const skipAccents = reducedMotion || saveData;
  const density = skipAccents ? 0 : mobile ? 0.45 : 1;
  const dpr: PerfProfile["dpr"] = mobile || saveData ? 1 : [1, 1.25];

  return { mobile, reducedMotion, saveData, skipAccents, dpr, density };
}

let cached: PerfProfile | null = null;

export function getPerfProfile(): PerfProfile {
  if (!cached) cached = readProfile();
  return cached;
}

export function usePerfProfile(): PerfProfile {
  const [profile, setProfile] = useState<PerfProfile>(() => getPerfProfile());

  useEffect(() => {
    const update = () => {
      cached = null;
      setProfile(readProfile());
    };
    const mqW = window.matchMedia("(max-width: 768px)");
    const mqM = window.matchMedia("(prefers-reduced-motion: reduce)");
    mqW.addEventListener("change", update);
    mqM.addEventListener("change", update);
    update();
    return () => {
      mqW.removeEventListener("change", update);
      mqM.removeEventListener("change", update);
    };
  }, []);

  return profile;
}

/** True while the document tab is visible — pause rAF work when hidden. */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return visible;
}

/**
 * Intersection visibility with optional unmount hysteresis.
 * `stayMounted` keeps the node after first reveal (for iframes); WebGL
 * should pass false so canvases tear down offscreen.
 */
export function useInView(
  ref: RefObject<HTMLElement | null>,
  opts: {
    rootMargin?: string;
    threshold?: number;
    /** Once true, stay true (lazy-load once). */
    once?: boolean;
  } = {},
): boolean {
  const { rootMargin = "80px", threshold = 0.08, once = false } = opts;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return visible;
}

/** Max simultaneous decorative WebGL canvases (hero arena is separate). */
const ACCENT_BUDGET = 1;
const accentHolders = new Set<symbol>();

/** Claim a slot in the global accent WebGL budget. Returns release(). */
export function claimAccentSlot(id: symbol): boolean {
  if (accentHolders.has(id)) return true;
  if (accentHolders.size >= ACCENT_BUDGET) return false;
  accentHolders.add(id);
  return true;
}

export function releaseAccentSlot(id: symbol): void {
  accentHolders.delete(id);
}
