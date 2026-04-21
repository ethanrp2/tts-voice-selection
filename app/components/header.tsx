import Link from "next/link";

export function Header({ showDesktopNav }: { showDesktopNav?: boolean }) {
  return (
    <header className="bg-surface shrink-0">
      <div className="flex items-center justify-between w-full px-6 py-3 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-accent-cyan text-3xl">
            graphic_eq
          </span>
          <span className="text-2xl font-black tracking-tighter text-accent-cyan font-headline uppercase">
            VOICE ARENA
          </span>
          <span className="text-[10px] font-headline font-bold tracking-widest text-accent-cyan/70 border border-accent-cyan/30 rounded px-1.5 py-0.5 uppercase">
            v2
          </span>
        </div>
        <div className="flex items-center gap-6">
          {showDesktopNav && (
            <div className="hidden md:flex gap-8 items-center font-headline font-bold tracking-tight uppercase">
              <Link
                href="/"
                className="text-gray-500 hover:opacity-80 transition-opacity active:scale-95 duration-200"
              >
                Vote
              </Link>
              <Link
                href="/leaderboard"
                className="text-accent-cyan hover:opacity-80 transition-opacity active:scale-95 duration-200"
              >
                Leaderboard
              </Link>
            </div>
          )}
          <div className="relative group">
            <span className="material-symbols-outlined text-white/40 text-xl cursor-default select-none hover:text-white/70 transition-colors">
              info
            </span>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-full right-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 z-50 shadow-xl">
              <p className="text-xs font-bold text-white mb-2">
                About Voice Arena{" "}
                <span className="text-accent-cyan font-black tracking-wider">V2</span>
              </p>
              <p className="text-[11px] text-white/60 leading-relaxed mb-2">
                Built by <span className="text-white/80 font-medium">Ethan Pereira</span> &{" "}
                <span className="text-white/80 font-medium">Kushika Sivaprakasam</span>
              </p>
              <p className="text-[11px] text-white/60 leading-relaxed mb-2">
                We&apos;re collecting preference data on AI voices to help AEs and FDEs pick the
                right voice for their customer&apos;s vibe and use case.
              </p>
              <p className="text-[11px] text-white/60 leading-relaxed mb-2">
                <span className="text-white/80 font-medium">V2</span> pairs each test phrase with a
                specific industry and use case — so voices are judged in context, not in a vacuum —
                and surfaces live ELO scores plus popular-pick feedback after every vote.
              </p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                <span className="text-white/80 font-medium">Goal:</span> Evaluate the current voice
                library, define what matters when selecting a voice, and recommend what to keep, cut,
                and add. The output is a scoring rubric and a mapping of each voice against it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
