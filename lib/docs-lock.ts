import { createHash } from "crypto";

export const HEADLESS_DOCS_COOKIE = "af_docs_headless";

/** Server-only password for /docs/headless-runner. */
export function headlessDocsPassword(): string {
  return process.env.DOCS_HEADLESS_PASSWORD || "web3gamingisback";
}

/** Cookie value issued after a correct unlock (not the plaintext password). */
export function headlessDocsUnlockToken(): string {
  return createHash("sha256")
    .update(`af-docs-headless:${headlessDocsPassword()}`)
    .digest("hex")
    .slice(0, 40);
}

export function isHeadlessDocsUnlocked(cookieValue: string | undefined): boolean {
  return Boolean(cookieValue && cookieValue === headlessDocsUnlockToken());
}
