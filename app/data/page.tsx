import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DataConsole from "@/components/data/DataConsole";

export const metadata: Metadata = {
  title: "Data Console — live verified match data | Agent Fighter",
  description:
    "Live view of the open Agent Fighter Results API: match volume, character meta, activity, integrity and standings. Free and open — no key required.",
  openGraph: {
    title: "Agent Fighter — Data Console",
    description:
      "Live verified match data, character meta and standings. Powered by the open Results API.",
    type: "website",
  },
};

export default function DataPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <DataConsole />
      </main>
      <Footer />
    </>
  );
}
