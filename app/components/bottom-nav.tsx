"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const isVote = pathname === "/";
  const isLeaderboard = pathname === "/leaderboard";

  return (
    <nav className="shrink-0 w-full flex justify-around items-center pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] px-12 bg-[#131313]/70 backdrop-blur-xl border-t border-white/5 shadow-[0_-4px_40px_rgba(0,0,0,0.4)]">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-90 duration-300 relative ${
          isVote ? "text-accent-cyan" : "text-gray-500 hover:text-gray-300"
        }`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={
            isVote
              ? { fontVariationSettings: "'FILL' 1" }
              : undefined
          }
        >
          thumbs_up_down
        </span>
        <span className="font-label font-medium text-[9px] tracking-[0.05em] uppercase">
          Vote
        </span>
        {isVote && (
          <span className="absolute -bottom-1 w-1 h-1 bg-accent-cyan rounded-full" />
        )}
      </Link>
      <Link
        href="/leaderboard"
        className={`flex flex-col items-center justify-center gap-1 transition-colors active:scale-90 duration-300 relative ${
          isLeaderboard
            ? "text-accent-cyan"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={
            isLeaderboard
              ? { fontVariationSettings: "'FILL' 1" }
              : undefined
          }
        >
          leaderboard
        </span>
        <span className="font-label font-medium text-[9px] tracking-[0.05em] uppercase">
          Leaderboard
        </span>
        {isLeaderboard && (
          <span className="absolute -bottom-1 w-1 h-1 bg-accent-cyan rounded-full" />
        )}
      </Link>
    </nav>
  );
}
