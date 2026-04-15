"use client";

interface VoiceCardProps {
  label: string;
  name: string;
  variant: "a" | "b";
  isPlaying: boolean;
  isLoading: boolean;
  flagged?: boolean;
  feedback?: "correct" | "incorrect" | null;
  onPlay: () => void;
  onFlag: () => void;
}

export function VoiceCard({
  label,
  name,
  variant,
  isPlaying,
  isLoading,
  flagged,
  feedback,
  onPlay,
  onFlag,
}: VoiceCardProps) {
  const isPurple = variant === "a";
  const glowShadow = isPurple
    ? "shadow-[0_0_25px_rgba(208,149,255,0.5)]"
    : "shadow-[0_0_25px_rgba(125,249,255,0.5)]";
  const bgClass = isPurple ? "bg-[#d095ff]" : "bg-accent-cyan";
  const displayName = name.split(/\s(?:-|–|—|\||\().*/)[0].trim() || name;

  return (
    <div
      className={`group bg-surface-container-low rounded-xl p-4 border-2 relative flex flex-col gap-2 overflow-hidden min-h-0 h-full transition-all duration-300 ${
        feedback === "correct"
          ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]"
          : feedback === "incorrect"
          ? "border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.5)]"
          : flagged
          ? "border-red-500/60"
          : "border-white/5"
      }`}
    >
      <div className="min-w-0">
        <span className="text-[10px] font-label text-outline uppercase tracking-widest block mb-0.5">
          {label}
        </span>
        <h2 className="text-sm font-headline font-bold text-on-surface truncate">
          {displayName}
        </h2>
      </div>
      <div className="flex justify-center items-center flex-1 min-h-[72px]">
        <button
          onClick={onPlay}
          disabled={isLoading}
          className={`w-14 h-14 rounded-full ${bgClass} flex items-center justify-center text-black active:scale-95 transition-transform ${glowShadow} disabled:opacity-50`}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isLoading ? "hourglass_empty" : isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
      </div>
      <button
        onClick={onFlag}
        className="mt-auto flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-red-900/40 text-red-400/60 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors w-full"
      >
        <span className="material-symbols-outlined text-sm">flag</span>
        Sounds Robotic
      </button>
    </div>
  );
}
