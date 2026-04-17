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
  voiceA: { id: string; name: string };
  voiceB: { id: string; name: string };
}

export default function VotePage() {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "vote" | "flag" } | null>(null);
  const [flaggedCard, setFlaggedCard] = useState<"a" | "b" | null>(null);
  const [feedback, setFeedback] = useState<{ side: "a" | "b"; correct: boolean } | null>(null);
  const { play, stop, playingId, loadingId } = useAudio();
  const submittingRef = useRef(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, variant: "vote" | "flag") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, variant });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const fetchMatchup = useCallback(async () => {
    setLoading(true);
    stop();
    try {
      const res = await fetch("/api/matchup");
      if (res.ok) {
        const data: Matchup = await res.json();
        setMatchup(data);
        setFeedback(null);
        prefetchAudio(data.voiceA.id, data.phrase);
        prefetchAudio(data.voiceB.id, data.phrase);
      }
    } finally {
      setLoading(false);
    }
  }, [stop]);

  const transitionToNext = useCallback(async (toastMessage: string, toastVariant: "vote" | "flag") => {
    setFading(true);
    await new Promise((r) => setTimeout(r, 200));
    showToast(toastMessage, toastVariant);
    await fetchMatchup();
    setFading(false);
    setFlaggedCard(null);
  }, [fetchMatchup, showToast]);

  useEffect(() => {
    fetchMatchup();
  }, [fetchMatchup]);

  const handleVote = useCallback(async (preferred: "a" | "b") => {
    if (!matchup || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    stop();

    setFeedback({ side: preferred, correct: true });

    fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchupId: matchup.matchupId, preferred }),
    });

    await new Promise((r) => setTimeout(r, 1000));
    await transitionToNext("Vote recorded ✓", "vote");
    setSubmitting(false);
    submittingRef.current = false;
  }, [matchup, stop, transitionToNext]);

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
      await transitionToNext("Voice flagged ⚑", "flag");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const feedbackA = feedback?.side === "a" ? (feedback.correct ? "correct" : "incorrect") : null;
  const feedbackB = feedback?.side === "b" ? (feedback.correct ? "correct" : "incorrect") : null;

  return (
    <div className="h-dvh flex flex-col bg-surface overflow-hidden">
      <Header />

      <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-2 gap-3 relative">
        {/* Toast */}
        {toast && (
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-label font-semibold tracking-wide backdrop-blur-xl border animate-toast-in ${
              toast.variant === "flag"
                ? "bg-red-950/70 border-red-500/30 text-red-300"
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
          {/* Industry + Use Case + Script */}
          <section className="w-full max-w-2xl text-center shrink-0">
            {!loading && (matchup?.industry || matchup?.useCase) && (
              <div className="flex items-center justify-center gap-4 mb-2 flex-wrap">
                {matchup!.industry && (
                  <span className="text-sm text-on-surface-variant">
                    <span className="text-[#7ec8e3] font-semibold">Industry:</span>{" "}
                    {matchup!.industry}
                  </span>
                )}
                {matchup!.useCase && (
                  <span className="text-sm text-on-surface-variant">
                    <span className="text-[#d095ff] font-semibold">Use Case:</span>{" "}
                    {matchup!.useCase}
                  </span>
                )}
              </div>
            )}
            {!loading && !matchup?.industry && !matchup?.useCase && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-label opacity-60">
                Test Phrase
              </span>
            )}
            <h1 className="text-sm font-headline font-extrabold tracking-tight text-on-surface leading-snug px-4">
              {loading ? (
                <span className="text-on-surface-variant">Loading...</span>
              ) : (
                `\u201C${matchup?.phrase}\u201D`
              )}
            </h1>
          </section>

          {/* Voice Comparison Cards - Side by Side */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xl flex-1 min-h-0">
            <VoiceCard
              label="Voice A"
              name={matchup?.voiceA.name || "Voice A"}
              variant="a"
              isPlaying={playingId === matchup?.voiceA.id}
              isLoading={loadingId === matchup?.voiceA.id}
              flagged={flaggedCard === "a"}
              feedback={feedbackA}
              onPlay={() => matchup && play(matchup.voiceA.id, matchup.phrase)}
              onFlag={() => matchup && handleFlag(matchup.voiceA.id)}
            />
            <VoiceCard
              label="Voice B"
              name={matchup?.voiceB.name || "Voice B"}
              variant="b"
              isPlaying={playingId === matchup?.voiceB.id}
              isLoading={loadingId === matchup?.voiceB.id}
              flagged={flaggedCard === "b"}
              feedback={feedbackB}
              onPlay={() => matchup && play(matchup.voiceB.id, matchup.phrase)}
              onFlag={() => matchup && handleFlag(matchup.voiceB.id)}
            />
          </div>

          {/* Single Preference Vote */}
          <div className="w-full max-w-xl pb-2 shrink-0">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-surface-container-low p-3 rounded-2xl border border-white/5">
              <button
                onClick={() => handleVote("a")}
                disabled={submitting || loading}
                className={`h-12 rounded-xl text-base font-black transition-all ${
                  feedback?.side === "a"
                    ? feedback.correct
                      ? "bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                      : "bg-red-500 text-black shadow-[0_0_15px_rgba(248,113,113,0.4)]"
                    : "bg-surface-container-highest text-on-surface/50 border border-white/5 hover:bg-[#d095ff]/20"
                } disabled:opacity-40`}
              >
                {"\u2190 A"}
              </button>
              <span className="font-headline font-extrabold text-[11px] uppercase tracking-widest text-outline text-center">
                Preferred
              </span>
              <button
                onClick={() => handleVote("b")}
                disabled={submitting || loading}
                className={`h-12 rounded-xl text-base font-black transition-all ${
                  feedback?.side === "b"
                    ? feedback.correct
                      ? "bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                      : "bg-red-500 text-black shadow-[0_0_15px_rgba(248,113,113,0.4)]"
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
