"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "../components/header";
import { BottomNav } from "../components/bottom-nav";
import { LeaderboardCard } from "../components/leaderboard-card";
import { LeaderboardRow } from "../components/leaderboard-row";

const INDUSTRIES = [
  "Healthcare",
  "Insurance",
  "Home Services",
  "Financial Services",
  "Automotive",
  "Retail",
  "Resorts & Hospitality",
];

const USE_CASES = [
  "Lead Qualification",
  "Appt. Scheduling",
  "Financial Services",
  "Customer Support",
  "Inbound Triage",
  "Account Management",
  "Authentication",
  "Healthcare/Insurance",
  "Lead Capture",
  "Objection Handling",
];

interface VoiceEntry {
  id: string;
  name: string;
  provider: string;
  description: string;
  winCount: number;
  matchCount: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [voices, setVoices] = useState<VoiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [industry, setIndustry] = useState("");
  const [useCase, setUseCase] = useState("");

  const LIMIT = 20;

  const buildUrl = useCallback(
    (newOffset: number) => {
      const params = new URLSearchParams();
      params.set("limit", String(LIMIT));
      params.set("offset", String(newOffset));
      if (industry) params.set("industry", industry);
      if (useCase) params.set("useCase", useCase);
      return `/api/leaderboard?${params.toString()}`;
    },
    [industry, useCase]
  );

  const fetchLeaderboard = useCallback(
    async (reset = false) => {
      setLoading(true);
      const newOffset = reset ? 0 : offset;
      try {
        const res = await fetch(buildUrl(newOffset));
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
    [offset, buildUrl]
  );

  useEffect(() => {
    setOffset(0);
    setVoices([]);
    setHasMore(true);

    const fetchInitial = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(LIMIT));
        params.set("offset", "0");
        if (industry) params.set("industry", industry);
        if (useCase) params.set("useCase", useCase);
        const res = await fetch(`/api/leaderboard?${params.toString()}`);
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
  }, [industry, useCase]);

  const hasFilter = industry !== "" || useCase !== "";
  const filterLabel = hasFilter
    ? [industry, useCase].filter(Boolean).join(" × ")
    : "";

  const top3 = voices.slice(0, 3);
  const rest = voices.slice(3);

  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <Header showDesktopNav />

      <main className="flex-1 max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        {/* Hero Title + Filters */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tighter mb-3">
                TOP VOICES
              </h1>
              <p className="text-on-surface-variant font-body text-base md:text-lg max-w-md">
                {hasFilter ? (
                  <>
                    Rankings for{" "}
                    <span className="text-on-surface font-semibold">
                      {filterLabel}
                    </span>
                  </>
                ) : (
                  "Overall rankings based on human preference across all industries and use cases."
                )}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="bg-surface-container-low border border-white/[0.06] rounded-xl pl-3 pr-8 py-2 text-xs font-label font-semibold tracking-wide text-on-surface/80 focus:outline-none focus:border-[#7ec8e3]/40 focus:shadow-[0_0_12px_rgba(126,200,227,0.15)] appearance-none cursor-pointer transition-all hover:border-white/10"
                >
                  <option value="">All Industries</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm pointer-events-none">
                  expand_more
                </span>
              </div>
              <div className="relative">
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="bg-surface-container-low border border-white/[0.06] rounded-xl pl-3 pr-8 py-2 text-xs font-label font-semibold tracking-wide text-on-surface/80 focus:outline-none focus:border-[#d095ff]/40 focus:shadow-[0_0_12px_rgba(208,149,255,0.15)] appearance-none cursor-pointer transition-all hover:border-white/10"
                >
                  <option value="">All Use Cases</option>
                  {USE_CASES.map((uc) => (
                    <option key={uc} value={uc}>
                      {uc}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
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
                winCount={voice.winCount}
                matchCount={voice.matchCount}
              />
            ))}
          </section>
        )}

        {/* Table List for Ranks 4+ */}
        {rest.length > 0 && (
          <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-white/5">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-white/5 font-label text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
              <div className="col-span-1">Rank</div>
              <div className="col-span-8 md:col-span-7">Voice Model</div>
              <div className="col-span-3 md:col-span-2 text-right">Wins</div>
              <div className="hidden md:block col-span-2 text-right">
                Matchups
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {rest.map((voice) => (
                <LeaderboardRow
                  key={voice.id}
                  rank={voice.rank}
                  name={voice.name}
                  provider={voice.provider}
                  description={voice.description || ""}
                  winCount={voice.winCount}
                  matchCount={voice.matchCount}
                />
              ))}
            </div>
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
              {hasFilter
                ? "No votes recorded for this filter yet. Try a different combination."
                : "Start voting to see voices ranked here."}
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

      <div className="h-24" />

      <div className="fixed bottom-0 left-0 w-full z-50">
        <BottomNav />
      </div>
    </div>
  );
}
