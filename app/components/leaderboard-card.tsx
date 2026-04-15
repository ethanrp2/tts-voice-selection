interface LeaderboardCardProps {
  rank: number;
  name: string;
  provider: string;
  description: string;
  winCount: number;
  matchCount: number;
}

const RANK_CONFIG = [
  {
    icon: "trophy",
    borderClass: "border-primary/10",
    statColor: "text-primary",
    barColor: "bg-primary",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary",
  },
  {
    icon: "star",
    borderClass: "border-white/5",
    statColor: "text-secondary",
    barColor: "bg-secondary",
    iconBg: "bg-surface-variant",
    iconColor: "text-on-surface",
  },
  {
    icon: "workspace_premium",
    borderClass: "border-white/5",
    statColor: "text-secondary",
    barColor: "bg-secondary",
    iconBg: "bg-surface-variant",
    iconColor: "text-on-surface",
  },
];

export function LeaderboardCard({
  rank,
  name,
  provider,
  description,
  winCount,
  matchCount,
}: LeaderboardCardProps) {
  const config = RANK_CONFIG[rank - 1] || RANK_CONFIG[2];
  const winRate =
    matchCount > 0 ? Math.round((winCount / matchCount) * 100) : 0;
  const barWidth = matchCount > 0 ? Math.min(Math.round((winCount / matchCount) * 100), 100) : 0;

  const bgClass =
    rank === 1 ? "bg-surface-container-low" : "bg-surface-container";

  return (
    <div
      className={`${bgClass} rounded-xl p-5 relative overflow-hidden group border ${config.borderClass}`}
    >
      <div className="absolute top-0 right-0 p-2">
        <span
          className={`${
            rank === 1 ? "text-primary/10" : "text-on-surface-variant/5"
          } font-headline font-black text-7xl leading-none tracking-tighter select-none`}
        >
          #{rank}
        </span>
      </div>
      <div className="relative z-10">
        <div
          className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}
        >
          <span
            className={`material-symbols-outlined ${config.iconColor} text-xl`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {config.icon}
          </span>
        </div>
        <h3 className="font-headline text-2xl font-bold mb-0.5">{name}</h3>
        <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase mb-4">
          {provider} &bull; {description}
        </p>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className={`font-headline text-4xl font-black ${config.statColor}`}>
            {winCount}
          </span>
          <span className="font-label text-[10px] text-on-surface-variant uppercase font-bold">
            Wins
          </span>
        </div>
        <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
          <div
            className={`h-full ${config.barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="mt-3 font-body text-[10px] text-on-surface-variant">
          {matchCount.toLocaleString()} Matches &bull; {winRate}% Win Rate
        </p>
      </div>
    </div>
  );
}
