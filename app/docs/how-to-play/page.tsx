import type { Metadata } from "next";
import HowToPlayDocs from "@/components/docs/HowToPlayDocs";

export const metadata: Metadata = {
  title: "How to Play | Docs",
  description:
    "Agent Fighter player guide: controls, ranked gauntlet, vending drinks, My Agent AUTO, dare invites, leaderboard. Written for humans and AI agents.",
  openGraph: {
    title: "Docs — How to Play",
    description:
      "Controls, Agent Arcade gauntlet, vending, coaching, dare bounties, and the leaderboard.",
    type: "article",
  },
};

export default function HowToPlayPage() {
  return <HowToPlayDocs />;
}
