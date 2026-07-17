import { OG_ALT, OG_SIZE, dareOgImage } from "@/lib/dare-og";

/**
 * Default social card for /dare/<code> (no custom taunt). Links carrying a
 * sender-written taunt (?t=) override this via generateMetadata, which
 * points at the /dare/<code>/og route handler instead — this convention
 * file never receives searchParams. The rendering lives in lib/dare-og.tsx,
 * shared by both.
 */

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return dareOgImage(code);
}
