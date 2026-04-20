"use client";

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  cartesia: { label: "Cartesia", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  elevenlabs: { label: "ElevenLabs", color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  rime: { label: "Rime", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
};

interface VoiceCardProps {
  label: string;
  name: string;
  provider: string | null;
  variant: "a" | "b";
  isPlaying: boolean;
  isLoading: boolean;
  flagged?: boolean;
  eloScore: number | null;
  isPreferred: boolean;
  /** true = crowd agrees, false = crowd disagrees, null = not the picked card */
  pickedPopular: boolean | null;
  showFeedback: boolean;
  onPlay: () => void;
  onFlag: () => void;
}

export function VoiceCard({
  label,
  name,
  provider,
  variant,
  isPlaying,
  isLoading,
  flagged,
  eloScore,
  isPreferred,
  pickedPopular,
  showFeedback,
  onPlay,
  onFlag,
}: VoiceCardProps) {
  const isPurple = variant === "a";
  const glowShadow = isPurple
    ? "shadow-[0_0_25px_rgba(208,149,255,0.5)]"
    : "shadow-[0_0_25px_rgba(125,249,255,0.5)]";
  const bgClass = isPurple ? "bg-[#d095ff]" : "bg-accent-cyan";
  const displayName = name.split(/\s(?:-|–|—|\||\().*/)[0].trim() || name;
  const providerInfo = provider ? PROVIDER_LABELS[provider.toLowerCase()] : null;

  let borderClass: string;
  if (showFeedback && isPreferred) {
    borderClass = pickedPopular
      ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
      : "border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.4)]";
  } else if (showFeedback && !isPreferred) {
    borderClass = "border-white/5 opacity-50";
  } else if (flagged) {
    borderClass = "border-red-500/60";
  } else {
    borderClass = "border-white/5";
  }

  return (
    <div
      className={`group bg-surface-container-low rounded-xl p-4 border-2 relative flex flex-col gap-2 overflow-hidden min-h-0 h-full transition-all duration-300 ${borderClass}`}
    >
      <div className="min-w-0">
        <span className="text-[10px] font-label text-outline uppercase tracking-widest block mb-0.5">
          {label}
        </span>
        <h2 className="text-sm font-headline font-bold text-on-surface truncate">
          {displayName}
        </h2>
        {providerInfo && (
          <span
            className={`inline-block text-[9px] font-label font-semibold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full border ${providerInfo.color}`}
          >
            {providerInfo.label}
          </span>
        )}
      </div>

      <div className="flex justify-center items-center flex-1 min-h-[72px]">
        {showFeedback ? (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl font-headline font-black text-on-surface">
              {eloScore}
            </span>
            {isPreferred && (
              <span
                className={`text-[11px] font-label font-bold uppercase tracking-wider ${
                  pickedPopular ? "text-green-400" : "text-red-400"
                }`}
              >
                {pickedPopular ? "Popular pick" : "Unpopular pick"}
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={onPlay}
            disabled={isLoading}
            className={`w-14 h-14 rounded-full ${bgClass} flex items-center justify-center text-black active:scale-95 transition-transform ${glowShadow} disabled:opacity-50`}
          >
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isLoading
                ? "hourglass_empty"
                : isPlaying
                ? "pause"
                : "play_arrow"}
            </span>
          </button>
        )}
      </div>

      {!showFeedback && (
        <button
          onClick={onFlag}
          className="mt-auto flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-red-900/40 text-red-400/60 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors w-full"
        >
          <span className="material-symbols-outlined text-sm">flag</span>
          Sounds Robotic
        </button>
      )}
    </div>
  );
}
