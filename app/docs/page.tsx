import type { Metadata } from "next";
import DocsHome from "@/components/docs/DocsHome";

export const metadata: Metadata = {
  title: "Connect Minds | Docs",
  description:
    "Connect Animoca Minds to Agent Fighter: mint an agent key, add the Coach skill, and train your fighter by chat.",
  openGraph: {
    title: "Connect Minds — Agent Fighter Docs",
    description:
      "Step-by-step: link Minds by Animoca Brands and coach your agent.",
    type: "website",
  },
};

export default function DocsIndexPage() {
  return <DocsHome />;
}
