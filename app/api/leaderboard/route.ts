import { createServerClient } from "@/lib/supabase";
import type { NextRequest } from "next/server";

function modelForProvider(provider: string | null | undefined) {
  switch ((provider || "").toLowerCase()) {
    case "elevenlabs":
      return "eleven_turbo_v2";
    case "cartesia":
      return "sonic-3";
    case "rime":
      return "mistv3";
    default:
      return "";
  }
}

const PROVIDER_DISPLAY: Record<string, string> = {
  cartesia: "Cartesia",
  elevenlabs: "ElevenLabs",
  rime: "Rime",
};

function isHumanDescription(description: string | null | undefined) {
  return /^Human \(.+\)$/.test(description ?? "");
}

function leaderboardProvider(
  provider: string | null | undefined,
  description: string | null | undefined,
) {
  if (!isHumanDescription(description)) return provider ?? "";
  const key = (provider ?? "").toLowerCase();
  return `Human - ${PROVIDER_DISPLAY[key] ?? provider ?? ""}`;
}

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0", 10);
  const industry = request.nextUrl.searchParams.get("industry") || "";
  const useCase = request.nextUrl.searchParams.get("useCase") || "";
  const voiceType = request.nextUrl.searchParams.get("voiceType") || "";
  const humansOnly = voiceType === "humans";

  const supabase = createServerClient();
  const hasPhraseFilter = industry !== "" || useCase !== "";

  if (!hasPhraseFilter) {
    let query = supabase
      .from("voices")
      .select("id, name, provider, description, elo_rating, match_count")
      .eq("active", true);
    if (humansOnly) query = query.ilike("description", "Human (%");
    const { data, error } = await query
      .order("elo_rating", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    const voices = data.map((voice, index) => ({
      id: voice.id,
      name: voice.name,
      provider: leaderboardProvider(voice.provider, voice.description),
      description: modelForProvider(voice.provider),
      isHuman: isHumanDescription(voice.description),
      eloRating: voice.elo_rating ?? 1500,
      matchCount: voice.match_count ?? 0,
      rank: offset + index + 1,
    }));

    return Response.json({ voices, filter: "overall" });
  }

  // Filtered: show ALL voices sorted by global ELO, with per-filter win stats

  // 1. Fetch ALL active voices (so every voice appears regardless of matchup history)
  let allVoicesQuery = supabase
    .from("voices")
    .select("id, name, provider, description, elo_rating, match_count")
    .eq("active", true);
  if (humansOnly) allVoicesQuery = allVoicesQuery.ilike("description", "Human (%");
  const { data: allVoices } = await allVoicesQuery;

  if (!allVoices || allVoices.length === 0) {
    return Response.json({ voices: [], filter: "filtered" });
  }

  // 2. Compute per-filter win/match stats from matchups → votes
  const phraseQuery = supabase.from("phrases").select("id").eq("active", true);
  if (industry) phraseQuery.eq("industry", industry);
  if (useCase) phraseQuery.eq("use_case", useCase);
  const { data: phrases } = await phraseQuery;

  const filterStats = new Map<string, { wins: number; matches: number }>();

  if (phrases && phrases.length > 0) {
    const phraseIds = phrases.map((p) => p.id);

    const { data: matchups } = await supabase
      .from("matchups")
      .select("id, voice_a_id, voice_b_id")
      .in("phrase_id", phraseIds);

    if (matchups && matchups.length > 0) {
      const matchupIds = matchups.map((m) => m.id);
      const matchupMap = new Map(matchups.map((m) => [m.id, m]));

      const { data: votes } = await supabase
        .from("votes")
        .select("matchup_id, winner")
        .eq("category", "preferred")
        .in("matchup_id", matchupIds);

      const ensure = (id: string) => {
        if (!filterStats.has(id)) filterStats.set(id, { wins: 0, matches: 0 });
        return filterStats.get(id)!;
      };

      for (const vote of votes || []) {
        const m = matchupMap.get(vote.matchup_id);
        if (!m) continue;
        const winnerId = vote.winner === "a" ? m.voice_a_id : m.voice_b_id;
        const loserId = vote.winner === "a" ? m.voice_b_id : m.voice_a_id;
        ensure(winnerId).wins += 1;
        ensure(winnerId).matches += 1;
        ensure(loserId).matches += 1;
      }

      for (const m of matchups) {
        ensure(m.voice_a_id);
        ensure(m.voice_b_id);
      }
    }
  }

  // 3. Merge: all voices with global ELO + filter-specific stats
  const ranked = allVoices
    .map((v) => {
      const fs = filterStats.get(v.id);
      return {
        id: v.id,
        name: v.name,
        provider: leaderboardProvider(v.provider, v.description),
        description: modelForProvider(v.provider),
        isHuman: isHumanDescription(v.description),
        eloRating: v.elo_rating ?? 1500,
        matchCount: v.match_count ?? 0,
        filterWins: fs?.wins ?? 0,
        filterMatches: fs?.matches ?? 0,
      };
    })
    .sort((a, b) => b.eloRating - a.eloRating)
    .slice(offset, offset + limit)
    .map((v, i) => ({ ...v, rank: offset + i + 1 }));

  return Response.json({ voices: ranked, filter: "filtered" });
}
