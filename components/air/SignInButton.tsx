"use client";

import { airDisplayName } from "@/lib/air";
import { useAir } from "./AirProvider";

/**
 * Sign-in control. Renders the account chip once signed in, so the same slot
 * serves both states and the layout never jumps.
 */
export default function SignInButton({
  className = "",
}: {
  className?: string;
}) {
  const { session, handle, signIn, signOut } = useAir();

  if (session.status === "in") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-arcade text-[8px] leading-none text-neon-green">
          {airDisplayName(session)}
          {handle && (
            <span className="ml-2 text-ink-muted">{handle}</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="font-arcade border border-white/20 px-2 py-1 text-[7px] text-ink-muted transition hover:border-neon-red/60 hover:text-neon-red"
        >
          SIGN OUT
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void signIn()}
      disabled={session.status === "busy"}
      className={`arcade-btn font-arcade px-3 py-1.5 text-[8px] disabled:opacity-60 ${className}`}
      title={session.error || "Sign in with AIR — same account as the game"}
    >
      {session.status === "busy" ? "OPENING…" : "SIGN IN"}
    </button>
  );
}
