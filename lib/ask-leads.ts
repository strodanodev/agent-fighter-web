export const ASK_REASONS = [
  "Investor",
  "VC",
  "Brand Sponsor",
  "Content Creator",
  "Other",
] as const;

export type AskReason = (typeof ASK_REASONS)[number];

export type AskLeadInput = {
  email: string;
  reason: AskReason;
  userAgent?: string | null;
  referrer?: string | null;
};

function supabaseConfig(): { url: string; key: string } | null {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  return { url, key };
}

function isAskReason(value: string): value is AskReason {
  return (ASK_REASONS as readonly string[]).includes(value);
}

/** Basic shape check — no mailbox verification. */
export function normalizeAskLead(
  raw: unknown,
): { ok: true; lead: AskLeadInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Invalid payload" };
  }
  const body = raw as Record<string, unknown>;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email" };
  }
  if (!isAskReason(reason)) {
    return { ok: false, error: "Select a reason" };
  }

  return {
    ok: true,
    lead: {
      email,
      reason,
      userAgent:
        typeof body.userAgent === "string" ? body.userAgent.slice(0, 400) : null,
      referrer:
        typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null,
    },
  };
}

async function saveToTable(
  cfg: { url: string; key: string },
  lead: AskLeadInput,
): Promise<"ok" | "missing" | "error"> {
  const res = await fetch(`${cfg.url}/rest/v1/ask_leads`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      email: lead.email,
      reason: lead.reason,
      user_agent: lead.userAgent ?? null,
      referrer: lead.referrer ?? null,
    }),
  });

  if (res.ok || res.status === 201) return "ok";
  const text = await res.text().catch(() => "");
  if (res.status === 404 || text.includes("PGRST205")) return "missing";
  console.error("ask_leads table insert failed", res.status, text.slice(0, 200));
  return "error";
}

async function ensureBucket(cfg: { url: string; key: string }): Promise<void> {
  await fetch(`${cfg.url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "ask-leads",
      name: "ask-leads",
      public: false,
      file_size_limit: 65536,
      allowed_mime_types: ["application/json"],
    }),
  }).catch(() => null);
}

async function saveToStorage(
  cfg: { url: string; key: string },
  lead: AskLeadInput,
): Promise<boolean> {
  await ensureBucket(cfg);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeEmail = lead.email.replace(/[^a-z0-9.@_-]/gi, "_").slice(0, 80);
  const path = `${stamp}_${safeEmail}.json`;
  const payload = {
    email: lead.email,
    reason: lead.reason,
    created_at: new Date().toISOString(),
    user_agent: lead.userAgent ?? null,
    referrer: lead.referrer ?? null,
  };

  const res = await fetch(
    `${cfg.url}/storage/v1/object/ask-leads/${encodeURIComponent(path)}`,
    {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        "x-upsert": "false",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("ask-leads storage upload failed", res.status, text.slice(0, 200));
    return false;
  }
  return true;
}

/** Persist a lead: prefer `ask_leads` table, fall back to private Storage. */
export async function saveAskLead(
  lead: AskLeadInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = supabaseConfig();
  if (!cfg) {
    return {
      ok: false,
      error: "Lead capture not configured (set NEXT_PUBLIC_SUPABASE_URL + service key)",
    };
  }

  try {
    const table = await saveToTable(cfg, lead);
    if (table === "ok") return { ok: true };
    if (table === "error") {
      // Try storage before failing hard
    }
    const stored = await saveToStorage(cfg, lead);
    if (stored) return { ok: true };
    return { ok: false, error: "Could not save your details. Try again." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save your details",
    };
  }
}
