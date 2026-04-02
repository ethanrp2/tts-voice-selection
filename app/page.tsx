"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/header";
import { BottomNav } from "./components/bottom-nav";
import { VoiceCard } from "./components/voice-card";
import { VoteRow } from "./components/vote-row";
import { useAudio, prefetchAudio } from "./hooks/use-audio";

interface Matchup {
  matchupId: string;
  phrase: string;
  voiceA: { id: string; name: string };
  voiceB: { id: string; name: string };
}

type Votes = {
  appeal: "a" | "b" | null;
  empathy: "a" | "b" | null;
  authority: "a" | "b" | null;
  energy: "a" | "b" | null;
};

export default function VotePage() {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [votes, setVotes] = useState<Votes>({
    appeal: null,
    empathy: null,
    authority: null,
    energy: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "vote" | "flag" } | null>(null);
  const [flaggedCard, setFlaggedCard] = useState<"a" | "b" | null>(null);
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
        setVotes({ appeal: null, empathy: null, authority: null, energy: null });
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

  // Auto-advance when all 3 votes are cast
  useEffect(() => {
    const allVoted = votes.appeal && votes.empathy && votes.authority && votes.energy;
    if (!allVoted || !matchup || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    stop();

    const submitAndAdvance = async () => {
      try {
        fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchupId: matchup.matchupId,
            votes: {
              appeal: votes.appeal!,
              empathy: votes.empathy!,
              authority: votes.authority!,
              energy: votes.energy!,
            },
          }),
        });
        await transitionToNext("Vote recorded ✓", "vote");
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
    };

    submitAndAdvance();
  }, [votes, matchup, stop, transitionToNext]);

  const handleFlag = async (voiceId: string) => {
    if (!matchup || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    stop();

    // Determine which card was flagged for the red flash
    const flaggedSide = voiceId === matchup.voiceA.id ? "a" : "b";
    setFlaggedCard(flaggedSide);

    try {
      fetch("/api/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId,
          matchupId: matchup.matchupId,
        }),
      });
      // Brief delay for the red flash to be visible before fade
      await new Promise((r) => setTimeout(r, 150));
      await transitionToNext("Voice flagged ⚑", "flag");
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
            className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-label font-semibold tracking-wide backdrop-blur-xl border animate-toast-in ${
              toast.variant === "flag"
                ? "bg-red-950/70 border-red-500/30 text-red-300"
                : "bg-[#131313]/70 border-white/10 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Fade wrapper for transition */}
        <div
          className={`w-full flex-1 min-h-0 flex flex-col items-center gap-3 transition-opacity duration-200 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Test Phrase Section */}
          <section className="w-full max-w-2xl text-center shrink-0">
            <span className="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-label opacity-60">
              Test Phrase
            </span>
            <h1 className="text-base font-headline font-extrabold tracking-tight text-on-surface leading-snug px-2">
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
              label="Profile A"
              name={matchup?.voiceA.name || "Voice A"}
              variant="a"
              isPlaying={playingId === matchup?.voiceA.id}
              isLoading={loadingId === matchup?.voiceA.id}
              flagged={flaggedCard === "a"}
              onPlay={() =>
                matchup && play(matchup.voiceA.id, matchup.phrase)
              }
              onFlag={() => matchup && handleFlag(matchup.voiceA.id)}
            />
            <VoiceCard
              label="Profile B"
              name={matchup?.voiceB.name || "Voice B"}
              variant="b"
              isPlaying={playingId === matchup?.voiceB.id}
              isLoading={loadingId === matchup?.voiceB.id}
              flagged={flaggedCard === "b"}
              onPlay={() =>
                matchup && play(matchup.voiceB.id, matchup.phrase)
              }
              onFlag={() => matchup && handleFlag(matchup.voiceB.id)}
            />
          </div>

          {/* Vote Toggles */}
          <div className="w-full max-w-xl space-y-2 pb-2 shrink-0">
            <VoteRow
              category="Appeal"
              selected={votes.appeal}
              onSelect={(c) => setVotes((v) => ({ ...v, appeal: c }))}
            />
            <VoteRow
              category="Empathy"
              selected={votes.empathy}
              onSelect={(c) => setVotes((v) => ({ ...v, empathy: c }))}
            />
            <VoteRow
              category="Authority"
              selected={votes.authority}
              onSelect={(c) => setVotes((v) => ({ ...v, authority: c }))}
            />
            <VoteRow
              category="Energy"
              selected={votes.energy}
              onSelect={(c) => setVotes((v) => ({ ...v, energy: c }))}
            />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
