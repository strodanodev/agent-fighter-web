import { NextResponse } from "next/server";
import { fetchLiveStats } from "@/lib/live-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await fetchLiveStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
