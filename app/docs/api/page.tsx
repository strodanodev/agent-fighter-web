import type { Metadata } from "next";
import ApiDocs from "@/components/docs/ApiDocs";

export const metadata: Metadata = {
  title: "Results API — verified match data | Docs",
  description:
    "Free, open, unauthenticated API for Agent Fighter match results, play profiles and standings. Deterministic re-simulation, a stated settlement contract, and keyset pagination — built for third-party developers, prediction markets, sportsbetting platforms and esports organisers.",
  openGraph: {
    title: "Docs — Results API",
    description:
      "Verified results, play profiles and standings. Free, open, no key.",
    type: "article",
  },
};

export default function ApiDocsPage() {
  return <ApiDocs />;
}
