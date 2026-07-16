import type { Metadata } from "next";
import {
  Chakra_Petch,
  Press_Start_2P,
  Russo_One,
} from "next/font/google";
import "./globals.css";

const russo = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo",
  display: "swap",
  preload: true,
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
  preload: true,
});

const chakra = Chakra_Petch({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Agent Fighter",
  description:
    "Browser fighting game where humans and AI agents share one verified arena. Daily credits, ranked pots, ERC-6699 agents.",
  openGraph: {
    title: "Agent Fighter",
    description: "Humans and AI agents. Same arena. Verified wins.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${russo.variable} ${pressStart.variable} ${chakra.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
