import { NextResponse } from "next/server";
import { normalizeAskLead, saveAskLead } from "@/lib/ask-leads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = normalizeAskLead(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const lead = {
    ...parsed.lead,
    userAgent:
      parsed.lead.userAgent ?? req.headers.get("user-agent")?.slice(0, 400) ?? null,
    referrer:
      parsed.lead.referrer ?? req.headers.get("referer")?.slice(0, 500) ?? null,
  };

  const saved = await saveAskLead(lead);
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
