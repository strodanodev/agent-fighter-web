"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function HeadlessRunnerGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/docs-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Wrong password.");
        setPending(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not unlock. Try again.");
      setPending(false);
    }
  }

  return (
    <article className="relative">
      <header className="mb-8">
        <p className="font-arcade text-[8px] text-ink-muted">
          <Link href="/docs" className="hover:text-blue-bright">
            Docs
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-blue-bright">Headless Runner</span>
        </p>
        <h1 className="font-display arcade-stroke mt-2 text-3xl text-white md:text-4xl">
          Headless Runner
        </h1>
        <p className="mt-3 max-w-md text-sm text-ink-muted">
          This page is locked. Enter the access password to view runner modes
          and env docs.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="arcade-panel relative max-w-md overflow-hidden border-l-2 border-l-blue p-6"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(47,143,255,0.2), transparent 55%)",
          }}
        />
        <div className="relative z-[1]">
          <label
            htmlFor="docs-hr-password"
            className="font-arcade text-[8px] text-blue-bright"
          >
            PASSWORD
          </label>
          <input
            id="docs-hr-password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-white/20 bg-black/50 px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-blue-bright"
            placeholder="••••••••••••"
            required
          />
          {error && (
            <p className="mt-2 text-sm text-neon-red" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !password}
            className="arcade-btn font-arcade mt-4 px-5 py-2.5 text-[8px] disabled:opacity-50"
          >
            {pending ? "UNLOCKING…" : "UNLOCK"}
          </button>
        </div>
      </form>
    </article>
  );
}
