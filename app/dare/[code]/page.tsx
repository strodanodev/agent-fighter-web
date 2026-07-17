import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import DareTaunts from "@/components/dare/DareTaunts";
import {
  fetchDareStats,
  normalizeDareCode,
  normalizeTaunt,
  tauntFor,
  winRate,
  REFERRAL_CREDITS,
  SITE_URL,
  type DareStats,
} from "@/lib/dare";
import { gameHref, portraitSrc } from "@/lib/game";

export const revalidate = 60;

/** Character folders that ship a _select.png portrait (public/characters/). */
const PORTRAIT_IDS = new Set([
  "0xzero", "analog", "bato", "blaze", "elon", "gbush",
  "jensen", "kim", "t800", "unitree-g1", "vector", "yatsiu",
]);

const portraitFor = (stats: DareStats | null): string =>
  stats?.mainChar && PORTRAIT_IDS.has(stats.mainChar) ? stats.mainChar : "blaze";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { code } = await params;
  const stats = await fetchDareStats(code);
  const name = (stats?.name ?? "A FIGHTER").toUpperCase();
  // ?t= — the sender's own taunt, written on the in-game invite screen. When
  // present it leads the description AND swaps the OG card for the
  // taunt-aware /og route (the opengraph-image convention can't see query
  // params, so the override has to happen here).
  const taunt = normalizeTaunt((await searchParams).t);
  const record =
    stats && stats.wins + stats.losses > 0
      ? `${stats.wins}–${stats.losses} record. `
      : "";
  const title = `${name} dares you: I DARE YOU TO BEAT ME`;
  // Attribution stays soft ("sent with this dare", never "— NAME"): the
  // taunt is a free-text URL param, so anyone could forge words onto another
  // player's code. Only server-verified stats speak in the player's name.
  const description = taunt
    ? `“${taunt}” — sent with this dare. ${record}+${REFERRAL_CREDITS} credits each if you sign up and prove them wrong.`
    : `${record}They're saying you can't take one round. +${REFERRAL_CREDITS} credits each if you sign up and prove them wrong.`;
  const ref = normalizeDareCode(code);
  const ogImages = taunt && ref
    ? [{ url: `/dare/${ref}/og?t=${encodeURIComponent(taunt)}`, width: 1200, height: 630 }]
    : undefined; // undefined → the opengraph-image convention file wins
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: { title, description, type: "website", ...(ogImages ? { images: ogImages } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(ogImages ? { images: ogImages } : {}) },
  };
}

export default async function DarePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code } = await params;
  const stats = await fetchDareStats(code);
  const name = (stats?.name ?? "A FIGHTER").toUpperCase();
  const rate = stats ? winRate(stats) : null;
  const char = portraitFor(stats);
  const ref = normalizeDareCode(code) ?? undefined;
  const acceptHref = gameHref({ screen: "title", ref });
  // The message on the link opens the page; the stock math-insult is the
  // fallback. Soft attribution only — see the note in generateMetadata.
  const taunt = normalizeTaunt((await searchParams).t);
  const openingTaunt = taunt
    ? `The dare came with a message: “${taunt}”`
    : tauntFor(stats);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-ink">
      {/* Main mp4 background — the same lazy, desktop-only loop as the homepage hero. */}
      <HeroVideo />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_42%,transparent_30%,rgba(5,10,20,0.82)_100%),linear-gradient(to_bottom,rgba(5,10,20,0.55),transparent_22%,transparent_72%,rgba(5,10,20,0.92))]"
        aria-hidden
      />
      <div className="scanlines" aria-hidden />

      <div className="relative z-[2] mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 pt-5 pb-9 md:px-8">
        {/* top bar */}
        <div className="mb-4 flex w-full items-center justify-between gap-3 md:mb-8">
          <Link href="/" className="font-display text-sm text-white md:text-base">
            AGENT<span className="text-blue">FIGHTER</span>
          </Link>
          <div className="flex items-center gap-2 rounded border border-[rgba(47,143,255,0.4)] bg-[rgba(10,21,36,0.75)] px-2.5 py-1.5 text-[11px] text-ink-muted">
            <span className="font-arcade text-[7px] text-neon-red">DARE LINK</span>
            <span className="font-semibold text-blue-bright">
              /dare/{ref ?? "UNKNOWN"}
            </span>
          </div>
        </div>

        <p className="font-arcade animate-coin-blink mb-4 text-[9px] text-neon-red md:mb-6 md:text-xs">
          ⚠ YOU&apos;VE BEEN CALLED OUT
        </p>

        <h1 className="font-display arcade-stroke mb-2 -skew-x-3 text-center text-[2.6rem] leading-[0.98] text-white md:text-7xl">
          I dare you
          <br />
          <span className="dare-stroke-red text-neon-red">to beat me</span>
        </h1>

        <DareTaunts name={name} initialTaunt={openingTaunt}>
          {/* tale of the tape */}
          <div className="mb-7 grid w-full max-w-4xl grid-cols-1 items-stretch gap-4 md:mb-9 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            {/* red corner — the inviter */}
            <div className="dare-corner-red relative flex flex-col items-center gap-2.5 rounded-md p-4">
              <span className="font-arcade absolute -top-2.5 left-3 rounded-sm bg-neon-red px-2 py-1 text-[7px] tracking-widest text-[#1c0410]">
                RED CORNER · THEM
              </span>
              <div className="flex h-36 items-end justify-center md:h-44">
                <Image
                  src={portraitSrc(char)}
                  alt={`${name}'s main fighter`}
                  width={144}
                  height={288}
                  className="h-full w-auto object-contain drop-shadow-[0_0_18px_rgba(255,61,110,0.45)]"
                  priority
                />
              </div>
              <div className="font-display text-lg text-white md:text-xl">{name}</div>
              <dl className="w-full text-[11px]">
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">RECORD</dt>
                  <dd className="font-semibold text-neon-red tabular-nums">
                    {stats ? `${stats.wins} W – ${stats.losses} L` : "?? – ??"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">WIN RATE</dt>
                  <dd className="font-semibold text-neon-red tabular-nums">
                    {rate != null ? `${rate}%` : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">RANK</dt>
                  <dd className="font-semibold text-white tabular-nums">
                    {stats?.rank ? `#${stats.rank} GLOBAL` : "UNLISTED"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">MAIN</dt>
                  <dd className="font-semibold text-white">
                    {char.toUpperCase()}
                    {stats ? ` · LV ${stats.level}` : ""}
                  </dd>
                </div>
              </dl>
            </div>

            {/* VS */}
            <div className="font-display self-center text-center text-3xl text-neon-yellow [text-shadow:3px_3px_0_#041028,0_0_34px_rgba(255,229,102,0.5)] md:-skew-x-6 md:text-5xl">
              VS
            </div>

            {/* blue corner — the invitee */}
            <div className="dare-corner-blue relative flex flex-col items-center gap-2.5 rounded-md p-4">
              <span className="font-arcade absolute -top-2.5 left-3 rounded-sm bg-blue px-2 py-1 text-[7px] tracking-widest text-[#041028]">
                BLUE CORNER · YOU
              </span>
              <div className="relative flex h-36 items-end justify-center md:h-44">
                <Image
                  src={portraitSrc(char)}
                  alt=""
                  aria-hidden
                  width={144}
                  height={288}
                  className="h-full w-auto -scale-x-100 object-contain opacity-90 brightness-0 drop-shadow-[0_0_16px_rgba(47,143,255,0.55)]"
                />
                <span className="font-display absolute inset-0 flex items-center justify-center text-5xl text-blue-bright [text-shadow:0_0_30px_rgba(47,143,255,0.7),2px_2px_0_#041028] md:text-6xl">
                  ?
                </span>
              </div>
              <div className="font-display text-lg text-blue-bright md:text-xl">YOU?</div>
              <dl className="w-full text-[11px]">
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">RECORD</dt>
                  <dd className="font-semibold text-ink-muted tabular-nums">0 W – 0 L</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">WIN RATE</dt>
                  <dd className="font-semibold text-ink-muted">—</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">RANK</dt>
                  <dd className="font-semibold text-ink-muted">UNRANKED</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-[rgba(142,180,216,0.14)] px-0.5 py-1.5">
                  <dt className="font-arcade pt-0.5 text-[7px] text-ink-muted">EXCUSES</dt>
                  <dd className="font-semibold text-ink-muted">NONE ACCEPTED</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* the only exit that matters */}
          <a
            href={acceptHref}
            className="dare-cta font-display rounded px-10 py-4 text-2xl md:px-16 md:py-5 md:text-3xl"
          >
            ACCEPT DARE
          </a>
          <p className="mt-4 text-center text-sm font-semibold text-neon-yellow [text-shadow:0_0_16px_rgba(255,229,102,0.35)]">
            +{REFERRAL_CREDITS} credits each when you sign up
            <span className="mt-0.5 block text-xs font-normal text-ink-muted">
              consider it your consolation prize
            </span>
          </p>
          <p className="mt-2.5 flex items-center gap-2 text-[11px] text-ink-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue shadow-[0_0_8px_var(--blue)]" />
            One-tap login with AIR KIT — Google, email or wallet
          </p>
        </DareTaunts>
      </div>
    </main>
  );
}
