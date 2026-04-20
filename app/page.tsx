"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/header";
import { BottomNav } from "./components/bottom-nav";
import { VoiceCard } from "./components/voice-card";
import { useAudio, prefetchAudio } from "./hooks/use-audio";

interface Matchup {
  matchupId: string;
  phrase: string;
  useCase: string | null;
  industry: string | null;
  description: string | null;
  voiceA: { id: string; name: string; provider: string };
  voiceB: { id: string; name: string; provider: string };
}

interface EloFeedback {
  eloA: number;
  eloB: number;
  preferred: "a" | "b";
  pickedPopular: boolean;
}

export default function VotePage() {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "vote" | "flag" | "info";
  } | null>(null);
  const [flaggedCard, setFlaggedCard] = useState<"a" | "b" | null>(null);
  const [eloFeedback, setEloFeedback] = useState<EloFeedback | null>(null);
  const { play, stop, playingId, loadingId } = useAudio();
  const submittingRef = useRef(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownWelcome = useRef(false);

  const showToast = useCallback(
    (message: string, variant: "vote" | "flag" | "info", duration = 2000) => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast({ message, variant });
      toastTimeoutRef.current = setTimeout(() => setToast(null), duration);
    },
    []
  );

  const fetchMatchup = useCallback(async () => {
    setLoading(true);
    stop();
    try {
      const res = await fetch("/api/matchup");
      if (res.ok) {
        const data: Matchup = await res.json();
        setMatchup(data);
        setEloFeedback(null);
        prefetchAudio(data.voiceA.id, data.phrase);
        prefetchAudio(data.voiceB.id, data.phrase);
      }
    } finally {
      setLoading(false);
    }
  }, [stop]);

  const transitionToNext = useCallback(async () => {
    setFading(true);
    await new Promise((r) => setTimeout(r, 200));
    await fetchMatchup();
    setFading(false);
    setFlaggedCard(null);
  }, [fetchMatchup]);

  useEffect(() => {
    fetchMatchup();
  }, [fetchMatchup]);

  // Welcome toast on first visit
  useEffect(() => {
    if (hasShownWelcome.current) return;
    hasShownWelcome.current = true;
    const timer = setTimeout(() => {
      showToast(
        "Welcome to Voice Arena! Listen, then pick your favorite.",
        "info",
        4000
      );
    }, 600);
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleVote = useCallback(
    async (preferred: "a" | "b") => {
      if (!matchup || submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      stop();

      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchupId: matchup.matchupId, preferred }),
        });

        if (res.ok) {
          const data = await res.json();
          const pickedPrevElo =
            preferred === "a" ? data.prevEloA : data.prevEloB;
          const otherPrevElo =
            preferred === "a" ? data.prevEloB : data.prevEloA;
          setEloFeedback({
            eloA: data.eloA,
            eloB: data.eloB,
            preferred,
            pickedPopular: pickedPrevElo >= otherPrevElo,
          });
        }

        await new Promise((r) => setTimeout(r, 1800));
        await transitionToNext();
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
    },
    [matchup, stop, transitionToNext]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleVote("a");
      else if (e.key === "ArrowRight") handleVote("b");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleVote]);

  const handleFlag = async (voiceId: string) => {
    if (!matchup || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    stop();

    const flaggedSide = voiceId === matchup.voiceA.id ? "a" : "b";
    setFlaggedCard(flaggedSide);

    try {
      fetch("/api/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId, matchupId: matchup.matchupId }),
      });
      await new Promise((r) => setTimeout(r, 150));
      showToast("Voice flagged ⚑", "flag");
      await transitionToNext();
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-surface overflow-hidden">
      <Header />

      <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-2 gap-3 relative">
        {/* Toast */}
        {toast && (
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl text-sm font-label font-semibold tracking-wide backdrop-blur-xl border animate-toast-in max-w-md text-center ${
              toast.variant === "flag"
                ? "bg-red-950/70 border-red-500/30 text-red-300"
                : toast.variant === "info"
                ? "bg-cyan-950/70 border-cyan-500/30 text-cyan-200"
                : "bg-[#131313]/70 border-white/10 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Fade wrapper */}
        <div
          className={`w-full flex-1 min-h-0 flex flex-col items-center gap-3 transition-opacity duration-200 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Context: Industry + Description */}
          <section className="w-full max-w-2xl text-center shrink-0">
            {!loading && matchup?.industry && (
              <div className="mb-2">
                <span className="inline-block text-xs uppercase tracking-[0.15em] font-label font-bold px-3 py-1 rounded-full bg-[#7ec8e3]/10 border border-[#7ec8e3]/20 text-[#7ec8e3]">
                  {matchup.industry}
                </span>
              </div>
            )}
            {!loading && matchup?.description && (
              <p className="text-base text-on-surface-variant leading-relaxed mb-2 px-4 font-label">
                {matchup.description}
              </p>
            )}
            {!loading && !matchup?.industry && !matchup?.description && (
              <span className="text-xs uppercase tracking-[0.15em] text-outline mb-1 block font-label opacity-60">
                Test Phrase
              </span>
            )}
            <h1 className="text-lg font-headline font-extrabold tracking-tight text-on-surface leading-snug px-4">
              {loading ? (
                <span className="text-on-surface-variant">Loading...</span>
              ) : (
                `\u201C${matchup?.phrase}\u201D`
              )}
            </h1>
          </section>

          {/* Voice Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xl flex-1 min-h-0">
            <VoiceCard
              label="Voice A"
              name={matchup?.voiceA.name || "Voice A"}
              provider={matchup?.voiceA.provider || null}
              variant="a"
              isPlaying={playingId === matchup?.voiceA.id}
              isLoading={loadingId === matchup?.voiceA.id}
              flagged={flaggedCard === "a"}
              eloScore={eloFeedback?.eloA ?? null}
              isPreferred={eloFeedback?.preferred === "a"}
              pickedPopular={eloFeedback?.preferred === "a" ? (eloFeedback?.pickedPopular ?? null) : null}
              showFeedback={eloFeedback !== null}
              onPlay={() =>
                matchup && play(matchup.voiceA.id, matchup.phrase)
              }
              onFlag={() => matchup && handleFlag(matchup.voiceA.id)}
            />
            <VoiceCard
              label="Voice B"
              name={matchup?.voiceB.name || "Voice B"}
              provider={matchup?.voiceB.provider || null}
              variant="b"
              isPlaying={playingId === matchup?.voiceB.id}
              isLoading={loadingId === matchup?.voiceB.id}
              flagged={flaggedCard === "b"}
              eloScore={eloFeedback?.eloB ?? null}
              isPreferred={eloFeedback?.preferred === "b"}
              pickedPopular={eloFeedback?.preferred === "b" ? (eloFeedback?.pickedPopular ?? null) : null}
              showFeedback={eloFeedback !== null}
              onPlay={() =>
                matchup && play(matchup.voiceB.id, matchup.phrase)
              }
              onFlag={() => matchup && handleFlag(matchup.voiceB.id)}
            />
          </div>

          {/* Preference Vote Buttons */}
          <div className="w-full max-w-xl pb-2 shrink-0">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-surface-container-low p-3 rounded-2xl border border-white/5">
              <button
                onClick={() => handleVote("a")}
                disabled={submitting || loading}
                className={`h-12 rounded-xl text-base font-black transition-all ${
                  eloFeedback?.preferred === "a"
                    ? eloFeedback.pickedPopular
                      ? "bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                      : "bg-red-500 text-black shadow-[0_0_15px_rgba(248,113,113,0.4)]"
                    : eloFeedback && eloFeedback.preferred !== "a"
                    ? "bg-surface-container-highest text-on-surface/20 border border-white/5"
                    : "bg-surface-container-highest text-on-surface/50 border border-white/5 hover:bg-[#d095ff]/20"
                } disabled:opacity-40`}
              >
                {"\u2190 A"}
              </button>
              <div className="flex flex-col items-center">
                <span className="font-headline font-extrabold text-[11px] uppercase tracking-widest text-outline text-center">
                  Preferred
                </span>
                <span className="text-[9px] text-outline/40 font-label mt-0.5">
                  or use arrow keys
                </span>
              </div>
              <button
                onClick={() => handleVote("b")}
                disabled={submitting || loading}
                className={`h-12 rounded-xl text-base font-black transition-all ${
                  eloFeedback?.preferred === "b"
                    ? eloFeedback.pickedPopular
                      ? "bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                      : "bg-red-500 text-black shadow-[0_0_15px_rgba(248,113,113,0.4)]"
                    : eloFeedback && eloFeedback.preferred !== "b"
                    ? "bg-surface-container-highest text-on-surface/20 border border-white/5"
                    : "bg-surface-container-highest text-on-surface/50 border border-white/5 hover:bg-accent-cyan/20"
                } disabled:opacity-40`}
              >
                {"B \u2192"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
