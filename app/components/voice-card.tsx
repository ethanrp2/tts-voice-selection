"use client";

interface VoiceCardProps {
  label: string;
  name: string;
  variant: "a" | "b";
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
}

export function VoiceCard({
  label,
  name,
  variant,
  isPlaying,
  isLoading,
  onPlay,
}: VoiceCardProps) {
  const isPurple = variant === "a";
  const accentColor = isPurple ? "#d095ff" : "#7DF9FF";
  const glowShadow = isPurple
    ? "shadow-[0_0_25px_rgba(208,149,255,0.5)]"
    : "shadow-[0_0_25px_rgba(125,249,255,0.5)]";
  const bgClass = isPurple ? "bg-[#d095ff]" : "bg-accent-cyan";
  const barActiveClass = isPurple
    ? "waveform-bar-active-a"
    : "waveform-bar-active-b";

  // Generate random-ish waveform heights (deterministic per variant)
  const barHeights =
    variant === "a"
      ? [20, 45, 30, 60, 85, 70, 90, 40, 55, 75]
      : [30, 20, 50, 70, 40, 60, 80, 45, 55, 35];

  return (
    <div className="group bg-surface-container-low rounded-xl p-4 border border-white/5 relative flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-label text-outline uppercase tracking-widest block mb-0.5">
          {label}
        </span>
        <h2 className="text-lg font-headline font-bold text-on-surface">
          {name}
        </h2>
      </div>
      <div className="flex justify-center items-center py-4">
        <button
          onClick={onPlay}
          disabled={isLoading}
          className={`w-16 h-16 rounded-full ${bgClass} flex items-center justify-center text-black active:scale-95 transition-transform ${glowShadow} disabled:opacity-50`}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isLoading ? "hourglass_empty" : isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
      </div>
      {/* Waveform Visualization */}
      <div className="flex items-end justify-around h-8 w-full">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className={`waveform-bar ${isPlaying ? barActiveClass : ""}`}
            style={{
              height: `${height}%`,
              ...(isPlaying ? { backgroundColor: accentColor } : {}),
            }}
          />
        ))}
      </div>
    </div>
  );
}
