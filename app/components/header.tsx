import Link from "next/link";

export function Header({ showDesktopNav }: { showDesktopNav?: boolean }) {
  return (
    <header className="bg-surface shrink-0">
      <div className="flex items-center justify-between w-full px-6 py-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-accent-cyan text-3xl">
            graphic_eq
          </span>
          <span className="text-2xl font-black tracking-tighter text-accent-cyan font-headline uppercase">
            VOICE ARENA
          </span>
        </div>
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
      </div>
    </header>
  );
}
