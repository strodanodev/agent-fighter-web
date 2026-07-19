import type { Metadata } from "next";
import { cookies } from "next/headers";
import HeadlessRunnerDocs from "@/components/docs/HeadlessRunnerDocs";
import HeadlessRunnerGate from "@/components/docs/HeadlessRunnerGate";
import {
  HEADLESS_DOCS_COOKIE,
  isHeadlessDocsUnlocked,
} from "@/lib/docs-lock";

export const metadata: Metadata = {
  title: "Headless Runner | Docs",
  description:
    "Password-protected reference for npm run agent — self-signup, coached key, and local modes.",
  openGraph: {
    title: "Docs — Headless Runner",
    description: "Locked runner reference. Unlock with the shared access password.",
    type: "article",
  },
  robots: { index: false, follow: false },
};

export default async function HeadlessRunnerPage() {
  const jar = await cookies();
  const unlocked = isHeadlessDocsUnlocked(
    jar.get(HEADLESS_DOCS_COOKIE)?.value,
  );

  if (!unlocked) {
    return <HeadlessRunnerGate />;
  }

  return <HeadlessRunnerDocs />;
}
