"use client";

interface VoteRowProps {
  category: string;
  selected: "a" | "b" | null;
  onSelect: (choice: "a" | "b") => void;
}

export function VoteRow({ category, selected, onSelect }: VoteRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-surface-container-low p-2 rounded-2xl border border-white/5">
      <span className="pl-4 font-headline font-extrabold text-[11px] uppercase tracking-widest text-outline">
        {category}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onSelect("a")}
          className={`w-20 h-12 rounded-xl text-lg font-black transition-all ${
            selected === "a"
              ? "bg-[#d095ff] text-black shadow-[0_0_15px_rgba(208,149,255,0.4)]"
              : "bg-surface-container-highest text-on-surface/50 border border-white/5 hover:bg-[#d095ff]/20"
          }`}
        >
          A
        </button>
        <button
          onClick={() => onSelect("b")}
          className={`w-20 h-12 rounded-xl text-lg font-black transition-all ${
            selected === "b"
              ? "bg-accent-cyan text-black shadow-[0_0_15px_rgba(125,249,255,0.4)]"
              : "bg-surface-container-highest text-on-surface/50 border border-white/5 hover:bg-accent-cyan/20"
          }`}
        >
          B
        </button>
      </div>
    </div>
  );
}
