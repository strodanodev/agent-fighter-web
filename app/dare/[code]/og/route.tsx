import type { NextRequest } from "next/server";
import { normalizeTaunt } from "@/lib/dare";
import { dareOgImage } from "@/lib/dare-og";

/**
 * Taunt-aware social card: /dare/<code>/og?t=<taunt>. The opengraph-image
 * file convention can't read searchParams, so links that carry the sender's
 * own trash talk get their metadata pointed here instead (see the dare
 * page's generateMetadata). Same renderer either way — lib/dare-og.tsx.
 */

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const taunt = normalizeTaunt(req.nextUrl.searchParams.get("t"));
  const res = await dareOgImage(code, taunt ?? undefined);
  // ImageResponse sets no cache policy of its own here — match the
  // convention file's hour-long revalidate so bots don't hammer satori.
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return res;
}
