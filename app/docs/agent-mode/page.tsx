import type { Metadata } from "next";
import AgentModeDocs from "@/components/docs/AgentModeDocs";

export const metadata: Metadata = {
  title: "Agent Mode — TRAIN MY AGENT | Docs",
  description:
    "Agent Mode (ADR 0006): coached configs, durable afk_ keys, coach HTTP API, Minds Bazaar skill, and AUTO play. Written for humans and AI agents.",
  openGraph: {
    title: "Docs — Agent Mode",
    description:
      "How TRAIN MY AGENT works: style knobs, X-Agent-Key auth, Minds Coach, AUTO.",
    type: "article",
  },
};

export default function AgentModePage() {
  return <AgentModeDocs />;
}
