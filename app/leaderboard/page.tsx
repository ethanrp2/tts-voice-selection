"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "../components/header";
import { BottomNav } from "../components/bottom-nav";
import { FilterPills } from "../components/filter-pills";
import { LeaderboardCard } from "../components/leaderboard-card";
import { LeaderboardRow } from "../components/leaderboard-row";

interface VoiceEntry {
  id: string;
  name: string;
  provider: string;
  description: string;
  rating: number;
  matchCount: number;
  winCount: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [category, setCategory] = useState("overall");
  const [voices, setVoices] = useState<VoiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  const fetchLeaderboard = useCallback(
    async (reset = false) => {
      setLoading(true);
      const newOffset = reset ? 0 : offset;
      try {
        const res = await fetch(
          `/api/leaderboard?category=${category}&limit=${LIMIT}&offset=${newOffset}`
        );
        if (res.ok) {
          const data = await res.json();
          if (reset) {
            setVoices(data.voices);
            setOffset(data.voices.length);
          } else {
            setVoices((prev) => [...prev, ...data.voices]);
            setOffset((prev) => prev + data.voices.length);
          }
          setHasMore(data.voices.length === LIMIT);
        }
      } finally {
        setLoading(false);
      }
    },
    [category, offset]
  );

  useEffect(() => {
    setOffset(0);
    setVoices([]);
    setHasMore(true);

    const fetchInitial = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/leaderboard?category=${category}&limit=${LIMIT}&offset=0`
        );
        if (res.ok) {
          const data = await res.json();
          setVoices(data.voices);
          setOffset(data.voices.length);
          setHasMore(data.voices.length === LIMIT);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [category]);

  const top3 = voices.slice(0, 3);
  const rest = voices.slice(3);

  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <Header showDesktopNav />

      <main className="flex-1 max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        {/* Hero Title Section */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tighter mb-3">
                TOP VOICES
              </h1>
              <p className="text-on-surface-variant font-body text-base md:text-lg max-w-md">
                Global ranking of AI synthesis engines based on human matchups.
              </p>
            </div>
            <FilterPills
              selected={category}
              onSelect={(c) => setCategory(c)}
            />
          </div>
        </section>

        {/* Top 3 Bento Cards */}
        {top3.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {top3.map((voice) => (
              <LeaderboardCard
                key={voice.id}
                rank={voice.rank}
                name={voice.name}
                provider={voice.provider}
                description={voice.description || ""}
                rating={voice.rating}
                matchCount={voice.matchCount}
                winCount={voice.winCount}
              />
            ))}
          </section>
        )}

        {/* Table List for Ranks 4+ */}
        {rest.length > 0 && (
          <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-white/5">
            {/* List Header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b border-white/5 font-label text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
              <div className="col-span-1">Rank</div>
              <div className="col-span-8 md:col-span-7">Voice Model</div>
              <div className="col-span-3 md:col-span-2 text-right">ELO</div>
              <div className="hidden md:block col-span-2 text-right">
                Matchups
              </div>
            </div>
            {/* List Rows */}
            <div className="divide-y divide-white/5">
              {rest.map((voice) => (
                <LeaderboardRow
                  key={voice.id}
                  rank={voice.rank}
                  name={voice.name}
                  provider={voice.provider}
                  description={voice.description || ""}
                  rating={voice.rating}
                  matchCount={voice.matchCount}
                />
              ))}
            </div>
            {/* Load More */}
            {hasMore && (
              <div className="p-4 text-center border-t border-white/5">
                <button
                  onClick={() => fetchLeaderboard(false)}
                  disabled={loading}
                  className="bg-surface-container-highest px-6 py-2 rounded-full text-on-surface font-label text-[10px] uppercase tracking-widest hover:bg-surface-bright transition-colors disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load More Entries"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {!loading && voices.length === 0 && (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">
              leaderboard
            </span>
            <p className="font-headline text-xl font-bold">No rankings yet</p>
            <p className="text-sm mt-2">
              Start voting to see voices ranked here.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && voices.length === 0 && (
          <div className="text-center py-20 text-on-surface-variant">
            <p className="font-headline text-xl font-bold">
              Loading rankings...
            </p>
          </div>
        )}
      </main>

      {/* Spacer for fixed bottom nav */}
      <div className="h-24" />

      {/* Fixed Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <BottomNav />
      </div>
    </div>
  );
}
