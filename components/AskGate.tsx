"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ASK_REASONS, type AskReason } from "@/lib/ask-leads";

const STORAGE_KEY = "af-ask-gate-unlocked";

type Props = {
  children: React.ReactNode;
};

export default function AskGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<AskReason | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        setUnlocked(true);
      }
    } catch {
      /* private mode */
    }
    setHydrated(true);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !reason) {
      setError("Email and reason are required");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/ask-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          reason,
          referrer: typeof document !== "undefined" ? document.referrer : null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        return;
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="relative mt-4 min-h-[280px]" aria-hidden>
        <div className="pointer-events-none select-none blur-md opacity-40">
          {children}
        </div>
      </div>
    );
  }

  if (unlocked) {
    return <div className="mt-4">{children}</div>;
  }

  return (
    <div className="relative mt-4 min-h-[320px]">
      <div
        className="pointer-events-none select-none blur-[6px] opacity-35"
        aria-hidden
      >
        {children}
      </div>

      <div className="absolute inset-0 z-[2] flex items-center justify-center p-3 sm:p-4">
        <form
          onSubmit={onSubmit}
          className="arcade-panel w-full max-w-lg border-blue/40 bg-bg-elevated/95 px-5 py-6 shadow-[0_0_40px_rgba(47,143,255,0.2)] backdrop-blur-md"
        >
          <p className="font-arcade text-[8px] text-blue-bright">
            CONFIDENTIAL · ASK TERMS
          </p>
          <h3 className="font-display arcade-stroke mt-2 text-xl text-white md:text-2xl">
            Unlock raise details
          </h3>
          <p className="mt-2 text-sm text-ink-muted">
            Enter your email and tell us why you&apos;re here. No verification —
            details unlock immediately.
          </p>

          <label className="mt-5 block">
            <span className="font-arcade text-[7px] text-ink-muted">EMAIL</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@firm.com"
              className="mt-1.5 w-full border border-blue/35 bg-[#061018] px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-muted/50 focus:border-blue-bright focus:ring-1 focus:ring-blue-bright/40"
            />
          </label>

          <label className="mt-4 block">
            <span className="font-arcade text-[7px] text-ink-muted">REASON</span>
            <select
              name="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value as AskReason | "")}
              className="mt-1.5 w-full appearance-none border border-blue/35 bg-[#061018] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-bright focus:ring-1 focus:ring-blue-bright/40"
            >
              <option value="" disabled>
                Select one…
              </option>
              {ASK_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="mt-3 text-sm text-neon-red" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="arcade-btn font-arcade mt-5 w-full px-4 py-3 text-[9px] tracking-wider disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? "UNLOCKING…" : "UNLOCK ASK"}
          </button>
        </form>
      </div>
    </div>
  );
}
