"use client";

/**
 * Replay viewer.
 *
 * The match is not streamed as video — the two input tracks are fetched and
 * the deterministic simulation is re-run IN THIS TAB, which is why a
 * 40-second fight arrives in about 2 kB. It also means the page can check the
 * server's work: once playback reaches the end, the final state hash is
 * compared to the one recorded at settlement, and the badge says so.
 *
 * The player itself is loaded from the GAME origin rather than bundled here.
 * The sim and renderer must have exactly one source of truth — duplicating
 * them into the marketing site would eventually mean a replay that disagrees
 * with the game about what happened.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { airToken } from "@/lib/air";
import { useAir } from "@/components/air/AirProvider";
import { GAME_URL } from "@/lib/game";

type PlayerState = {
  ready: boolean;
  playing: boolean;
  tick: number;
  total: number;
  speed: number;
  verified: boolean | null;
};

type ReplayHandle = {
  play(): void;
  pause(): void;
  toggle(): void;
  seek(tick: number): void;
  setSpeed(mult: number): void;
  restart(): void;
  render(): void;
  destroy(): void;
};

type MountReplay = (opts: {
  canvas: HTMLCanvasElement;
  ledger: string;
  pin: unknown;
  assetBase?: string;
  autoplay?: boolean;
  onState?: (s: PlayerState) => void;
}) => Promise<ReplayHandle>;

export type ReplayTarget = {
  matchId: string;
  label: string;
  mode: string;
};

const SPEEDS = [0.25, 0.5, 1, 2];

export default function ReplayModal({
  target,
  onClose,
}: {
  target: ReplayTarget;
  onClose: () => void;
}) {
  const { session, signIn } = useAir();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<ReplayHandle | null>(null);
  const [status, setStatus] = useState<string>("Loading replay…");
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [st, setSt] = useState<PlayerState | null>(null);

  /**
   * Fetch the ledger and mount the player.
   *
   * Owns its own failures on purpose: the caller is an effect, and letting a
   * rejection escape to be caught there would put setState in an effect body.
   */
  const load = useCallback(async () => {
    try {
      setError(null);
      setNeedsAuth(false);
      setStatus("Checking your session…");

      const token = await airToken();
      if (!token) {
        setNeedsAuth(true);
        setStatus("");
        return;
      }

      setStatus("Fetching the ledger…");
      const res = await fetch(
        `/api/v1/replays/${encodeURIComponent(target.matchId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const body = (await res.json().catch(() => ({}))) as {
        replay?: { ledger: string; pin: unknown; asset_base: string };
        error?: { code: string; message: string; hint?: string };
      };

      if (!res.ok || !body.replay) {
        if (res.status === 401) {
          setNeedsAuth(true);
          setStatus("");
          return;
        }
        setError(body.error?.hint ?? body.error?.message ?? `HTTP ${res.status}`);
        setStatus("");
        return;
      }

      setStatus("Loading the engine…");
      // A genuine cross-origin dynamic import. Wrapped in `new Function` so the
      // bundler treats the URL as opaque and does not try to resolve it at
      // build time — it lives on another origin and only exists at runtime.
      const importRemote = new Function("u", "return import(u)") as (
        u: string,
      ) => Promise<{ mountReplay: MountReplay }>;
      const mod = await importRemote(`${GAME_URL}/replay-player.js`);

      const canvas = canvasRef.current;
      if (!canvas) return;
      setStatus("");
      handleRef.current = await mod.mountReplay({
        canvas,
        ledger: body.replay.ledger,
        pin: body.replay.pin,
        assetBase: body.replay.asset_base,
        autoplay: true,
        onState: setSt,
      });
    } catch (e) {
      setError((e as Error).message || "Could not load the replay.");
      setStatus("");
    }
  }, [target.matchId]);

  useEffect(() => {
    // Starting an async load — the "subscribe to an external system" case the
    // rule allows. Every setState inside `load` happens after an await, so no
    // render cascades synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [load]);

  // Esc closes; space toggles playback — the two things a viewer reaches for.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && handleRef.current) {
        e.preventDefault();
        handleRef.current.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pct = st && st.total > 0 ? (st.tick / st.total) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Replay: ${target.label}`}
    >
      <div
        className="w-full max-w-4xl border border-white/20 bg-bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/12 px-4 py-2.5">
          <div className="min-w-0">
            <p className="font-arcade text-[8px] text-blue-bright">REPLAY</p>
            <p className="mt-1 truncate text-sm text-white">{target.label}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-arcade border border-white/20 px-2.5 py-1.5 text-[8px] text-ink-muted transition hover:border-neon-red/60 hover:text-neon-red"
          >
            ESC
          </button>
        </div>

        <div className="relative aspect-video w-full bg-[#050a14]">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="h-full w-full"
          />

          {(status || error || needsAuth) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050a14]/92 p-6 text-center">
              {needsAuth ? (
                <>
                  <p className="font-arcade text-[9px] text-blue-bright">
                    SIGN IN TO WATCH
                  </p>
                  <p className="max-w-sm text-sm text-ink-muted">
                    Replays are available to signed-in accounts. It is the same
                    AIR account you use in the game.
                  </p>
                  <button
                    type="button"
                    onClick={() => void signIn().then(() => void load())}
                    disabled={session.status === "busy"}
                    className="arcade-btn font-arcade px-3 py-1.5 text-[8px] disabled:opacity-60"
                  >
                    {session.status === "busy" ? "OPENING…" : "SIGN IN"}
                  </button>
                </>
              ) : error ? (
                <>
                  <p className="font-arcade text-[9px] text-neon-red">
                    NO REPLAY
                  </p>
                  <p className="max-w-md text-sm text-ink-muted">{error}</p>
                </>
              ) : (
                <p className="font-arcade animate-pulse text-[9px] text-ink-muted">
                  {status}
                </p>
              )}
            </div>
          )}
        </div>

        {/* transport */}
        <div className="flex flex-wrap items-center gap-3 border-t border-white/12 px-4 py-3">
          <button
            type="button"
            onClick={() => handleRef.current?.toggle()}
            disabled={!st?.ready}
            className="arcade-btn font-arcade px-3 py-1.5 text-[8px] disabled:opacity-40"
          >
            {st?.playing ? "PAUSE" : "PLAY"}
          </button>
          <button
            type="button"
            onClick={() => handleRef.current?.restart()}
            disabled={!st?.ready}
            className="font-arcade border border-white/20 px-2.5 py-1.5 text-[8px] text-ink-muted transition hover:border-blue/60 hover:text-blue-bright disabled:opacity-40"
          >
            RESTART
          </button>

          <input
            type="range"
            min={0}
            max={st?.total ?? 0}
            value={st?.tick ?? 0}
            onChange={(e) => handleRef.current?.seek(Number(e.target.value))}
            disabled={!st?.ready}
            className="h-1 min-w-[8rem] flex-1 cursor-pointer accent-[#6eb6ff]"
            aria-label="Seek"
          />
          <span className="w-20 text-right font-mono text-[11px] text-ink-muted">
            {((st?.tick ?? 0) / 60).toFixed(1)}s /{" "}
            {((st?.total ?? 0) / 60).toFixed(0)}s
          </span>

          <div className="flex gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleRef.current?.setSpeed(s)}
                disabled={!st?.ready}
                className={`font-arcade border px-1.5 py-1 text-[7px] transition disabled:opacity-40 ${
                  st?.speed === s
                    ? "border-blue text-blue-bright"
                    : "border-white/20 text-ink-muted hover:text-white"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* trust line */}
        <div className="border-t border-white/12 px-4 py-2.5">
          {st?.verified === true ? (
            <p className="text-[11px] text-neon-green">
              ✓ Reproduced in your browser — the final state hash matches the one
              the server recorded when it settled this match.
            </p>
          ) : st?.verified === false ? (
            <p className="text-[11px] text-neon-yellow">
              This replay did not reproduce the recorded hash. That usually means
              the engine or a character has changed since the match was played.
            </p>
          ) : (
            <p className="text-[11px] text-ink-muted">
              Re-simulating locally from the recorded inputs — {pct.toFixed(0)}%.
              The verification check runs when playback reaches the end.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
