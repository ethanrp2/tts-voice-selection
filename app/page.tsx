"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const submittingRef = useRef(false);

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

  // Auto-advance when all 3 votes are cast
  useEffect(() => {
    const allVoted = votes.empathy && votes.authority && votes.energy;
    if (!allVoted || !matchup || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    stop();

    const submitAndAdvance = async () => {
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
        // Brief delay for visual feedback
        await new Promise((r) => setTimeout(r, 600));
        await fetchMatchup();
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
    };

    submitAndAdvance();
  }, [votes, matchup, stop, fetchMatchup]);

  const handleFlag = async (voiceId: string) => {
    if (!matchup || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    stop();

    try {
      await fetch("/api/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId,
          matchupId: matchup.matchupId,
        }),
      });
      await new Promise((r) => setTimeout(r, 600));
      await fetchMatchup();
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-surface overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-hidden gap-4">
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
            onFlag={() => matchup && handleFlag(matchup.voiceA.id)}
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
            onFlag={() => matchup && handleFlag(matchup.voiceB.id)}
          />
        </div>

        {/* Vote Toggles */}
        <div className="w-full max-w-xl space-y-3 shrink-0">
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
      </main>

      <BottomNav />
    </div>
  );
}
