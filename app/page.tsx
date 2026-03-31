"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "./components/header";
import { BottomNav } from "./components/bottom-nav";
import { VoiceCard } from "./components/voice-card";
import { VoteRow } from "./components/vote-row";
import { useAudio } from "./hooks/use-audio";

interface Matchup {
  matchupId: string;
  phrase: string;
  voiceA: { id: string; name: string };
  voiceB: { id: string; name: string };
}

type Votes = {
  empathy: "a" | "b" | null;
  authority: "a" | "b" | null;
  energy: "a" | "b" | null;
};

export default function VotePage() {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [votes, setVotes] = useState<Votes>({
    empathy: null,
    authority: null,
    energy: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { play, stop, playingId, loadingId } = useAudio();

  const allVoted = votes.empathy && votes.authority && votes.energy;

  const fetchMatchup = useCallback(async () => {
    setLoading(true);
    stop();
    try {
      const res = await fetch("/api/matchup");
      if (res.ok) {
        const data = await res.json();
        setMatchup(data);
        setVotes({ empathy: null, authority: null, energy: null });
      }
    } finally {
      setLoading(false);
    }
  }, [stop]);

  useEffect(() => {
    fetchMatchup();
  }, [fetchMatchup]);

  const handleSubmit = async () => {
    if (!allVoted || !matchup || submitting) return;
    setSubmitting(true);
    stop();

    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchupId: matchup.matchupId,
          votes: {
            empathy: votes.empathy!,
            authority: votes.authority!,
            energy: votes.energy!,
          },
        }),
      });
      await fetchMatchup();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-surface overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-1 overflow-hidden gap-3">
        {/* Test Phrase Section */}
        <section className="w-full max-w-2xl text-center shrink-0">
          <span className="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-label opacity-60">
            Test Phrase
          </span>
          <h1 className="text-xl md:text-3xl font-headline font-extrabold tracking-tight text-on-surface leading-snug px-2">
            {loading ? (
              <span className="text-on-surface-variant">Loading...</span>
            ) : (
              `\u201C${matchup?.phrase}\u201D`
            )}
          </h1>
        </section>

        {/* Voice Comparison Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xl shrink-0">
          <VoiceCard
            label="Profile A"
            name={matchup?.voiceA.name || "Voice A"}
            variant="a"
            isPlaying={playingId === matchup?.voiceA.id}
            isLoading={loadingId === matchup?.voiceA.id}
            onPlay={() =>
              matchup && play(matchup.voiceA.id, matchup.phrase)
            }
          />
          <VoiceCard
            label="Profile B"
            name={matchup?.voiceB.name || "Voice B"}
            variant="b"
            isPlaying={playingId === matchup?.voiceB.id}
            isLoading={loadingId === matchup?.voiceB.id}
            onPlay={() =>
              matchup && play(matchup.voiceB.id, matchup.phrase)
            }
          />
        </div>

        {/* Vote Toggles */}
        <div className="w-full max-w-xl space-y-2 shrink-0">
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

        {/* Next Pair Button */}
        <div className="w-full max-w-xs shrink-0 pt-1 pb-2">
          <button
            onClick={handleSubmit}
            disabled={!allVoted || submitting}
            className={`w-full py-4 rounded-full font-headline font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
              allVoted
                ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(208,149,255,0.3)] active:scale-95"
                : "bg-white/5 text-outline cursor-not-allowed border border-white/5"
            }`}
          >
            {submitting ? "Submitting..." : "Next Pair"}
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
