import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProfileConsole from "@/components/profile/ProfileConsole";

export const metadata: Metadata = {
  title: "Profile — your pets and auras | Agent Fighter",
  description:
    "Your Agent Fighter account: adopt account-bound pets, see the aura each one rolled, and equip the companion that fights alongside you.",
  openGraph: {
    title: "Agent Fighter — Profile",
    description:
      "Adopt and equip account-bound pets. Each one rolls its own aura and floats behind your fighter.",
    type: "website",
  },
};

export default function ProfilePage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <ProfileConsole />
      </main>
      <Footer />
    </>
  );
}
