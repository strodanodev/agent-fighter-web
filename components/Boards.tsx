import Image from "next/image";
import { TrophyIcon } from "./ArcadeIcons";
import LeaderboardPanel from "./LeaderboardPanel";
import SceneAccentLazy from "./SceneAccentLazy";
import { fetchLeaderboard } from "@/lib/leaderboard";

const ESPORTS_POSTER_SRC = "/assets/esports/dsl-launch-poster.png";

export default async function Boards() {
  const { rows, error } = await fetchLeaderboard(50);

  return (
    <section
      id="boards"
      className="section-defer relative overflow-hidden border-y border-white/10 bg-bg-elevated py-14 md:py-16"
    >
      <SceneAccentLazy
        variant="boards"
        className="opacity-35 [mask-image:radial-gradient(ellipse_at_80%_40%,black_15%,transparent_65%)]"
      />
      <div className="relative z-[1] mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3 md:px-8">
        <LeaderboardPanel rows={rows} error={error} />

        <div
          id="prize"
          className="lb-prize arcade-panel flex flex-col justify-between p-6"
        >
          <div>
            <p className="font-arcade flex items-center gap-2 text-[9px] text-neon-blue">
              <TrophyIcon className="h-3.5 w-3.5 text-neon-blue" />
              PRIZE POOL
            </p>
            <h2 className="font-display mt-2 text-3xl text-white">
              <span className="text-white">Climb.</span>{" "}
              <span className="text-white/75">Cash.</span>{" "}
              <span className="text-neon-blue">Re-enter.</span>
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Wager pots feed the loop. Seasonal boards and brand cups stack the
              big payouts.
            </p>
          </div>
          <figure className="mt-4">
            <p className="font-arcade mb-2 text-[9px] text-neon-blue">
              ESPORTS POSTER
            </p>
            <Image
              src={ESPORTS_POSTER_SRC}
              alt="Daredevil Sports League launch party esports poster"
              width={768}
              height={1024}
              className="h-auto w-full border border-white/15 object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </figure>
          <p className="calc-readout mt-6">
            DAILY <strong className="text-neon-blue">+10 CR</strong>
            <span className="text-white/30"> · </span>
            <span className="text-white/70">NO HOUSE</span>
          </p>
        </div>
      </div>
    </section>
  );
}
