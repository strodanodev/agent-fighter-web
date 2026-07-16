const ITEMS = [
  "INSERT COIN",
  "PLAY NOW",
  "SELECT CHARACTER",
  "LEADERBOARDS",
  "ERC-6699",
  "RE-SIM VERIFY",
  "STATE.HASH",
  "CREATE YOUR FIGHTER",
];

export default function ArcadeMarquee() {
  const row = [...ITEMS, ...ITEMS];

  return (
    <div className="relative z-20 overflow-hidden border-y border-white/20 bg-black/85">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={`font-arcade mx-5 inline-flex items-center gap-4 text-[9px] md:text-[10px] ${
              i % 2 === 0 ? "text-white" : "text-blue-bright"
            }`}
          >
            <span className="text-blue">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
