const ROW_ICONS = [
  "waves",
  "mic_external_on",
  "sound_detection_dog_barking",
  "record_voice_over",
  "graphic_eq",
  "music_note",
  "headphones",
];

interface LeaderboardRowProps {
  rank: number;
  name: string;
  provider: string;
  description: string;
  eloRating: number;
  matchCount: number;
}

export function LeaderboardRow({
  rank,
  name,
  provider,
  description,
  eloRating,
  matchCount,
}: LeaderboardRowProps) {
  const icon = ROW_ICONS[(rank - 4) % ROW_ICONS.length];

  return (
    <div className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface-container transition-colors group">
      <div className="col-span-1 font-headline font-bold text-base text-on-surface-variant">
        #{rank}
      </div>
      <div className="col-span-8 md:col-span-7 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">
            {icon}
          </span>
        </div>
        <div className="truncate">
          <p className="font-headline font-bold text-base truncate">{name}</p>
          <p className="text-[10px] text-on-surface-variant truncate">
            {provider} &bull; {description}
          </p>
        </div>
      </div>
      <div className="col-span-3 md:col-span-2 text-right">
        <span className="font-headline text-xl font-black text-on-surface">
          {eloRating}
        </span>
      </div>
      <div className="hidden md:block col-span-2 text-right">
        <span className="font-body text-xs text-on-surface-variant">
          {matchCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
