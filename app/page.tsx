import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import CalcRain from "@/components/CalcRain";
import CalcStrip from "@/components/CalcStrip";
import ArcadeMarquee from "@/components/ArcadeMarquee";
import FightHud from "@/components/FightHud";
import GameFrame from "@/components/GameFrame";
import Featured from "@/components/Featured";
import Loop from "@/components/Loop";
import Engine from "@/components/Engine";
import Boards from "@/components/Boards";
import Team from "@/components/Team";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="scanlines" aria-hidden />
      <CalcRain />
      <Nav />
      <main className="relative z-[2]">
        <Hero />
        <CalcStrip />
        <ArcadeMarquee />
        <FightHud />
        <GameFrame />
        <Featured />
        <Loop />
        <Engine />
        <Boards />
        <Team />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
