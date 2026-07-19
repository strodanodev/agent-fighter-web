import { NextResponse } from "next/server";
import {
  HEADLESS_DOCS_COOKIE,
  headlessDocsPassword,
  headlessDocsUnlockToken,
} from "@/lib/docs-lock";

export async function POST(req: Request) {
  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  if (password !== headlessDocsPassword()) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(HEADLESS_DOCS_COOKIE, headlessDocsUnlockToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
