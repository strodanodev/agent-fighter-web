import { NextResponse } from "next/server";
import { fetchLeaderboard } from "@/lib/leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const { rows, error } = await fetchLeaderboard(limit, { fresh: true });

  if (error && rows.length === 0) {
    return NextResponse.json({ rows: [], error }, { status: 503 });
  }

  return NextResponse.json(
    { rows, error },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
