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

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0", 10);
  const industry = request.nextUrl.searchParams.get("industry") || "";
  const useCase = request.nextUrl.searchParams.get("useCase") || "";

  const supabase = createServerClient();
  const hasFilter = industry !== "" || useCase !== "";

  if (!hasFilter) {
    const { data, error } = await supabase
      .from("voices")
      .select("id, name, provider, description, win_count, match_count")
      .eq("active", true)
      .order("win_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    const voices = data.map((voice, index) => ({
      id: voice.id,
      name: voice.name,
      provider: voice.provider,
      description: modelForProvider(voice.provider),
      winCount: voice.win_count ?? 0,
      matchCount: voice.match_count ?? 0,
      rank: offset + index + 1,
    }));

    return Response.json({ voices, filter: "overall" });
  }

  // Filtered: compute wins from votes → matchups → phrases
  const phraseQuery = supabase.from("phrases").select("id").eq("active", true);
  if (industry) phraseQuery.eq("industry", industry);
  if (useCase) phraseQuery.eq("use_case", useCase);
  const { data: phrases } = await phraseQuery;

  if (!phrases || phrases.length === 0) {
    return Response.json({ voices: [], filter: "filtered" });
  }

  const phraseIds = phrases.map((p) => p.id);

  const { data: matchups } = await supabase
    .from("matchups")
    .select("id, voice_a_id, voice_b_id")
    .in("phrase_id", phraseIds);

  if (!matchups || matchups.length === 0) {
    // No matchups for this filter yet — return all active voices with 0 wins
    const { data: allVoices } = await supabase
      .from("voices")
      .select("id, name, provider")
      .eq("active", true)
      .range(offset, offset + limit - 1);

    const voices = (allVoices || []).map((v, i) => ({
      id: v.id,
      name: v.name,
      provider: v.provider,
      description: modelForProvider(v.provider),
      winCount: 0,
      matchCount: 0,
      rank: offset + i + 1,
    }));
    return Response.json({ voices, filter: "filtered" });
  }

  const matchupIds = matchups.map((m) => m.id);
  const matchupMap = new Map(matchups.map((m) => [m.id, m]));

  const { data: votes } = await supabase
    .from("votes")
    .select("matchup_id, winner")
    .eq("category", "preferred")
    .in("matchup_id", matchupIds);

  // Tally wins and matches per voice
  const stats = new Map<string, { wins: number; matches: number }>();

  const ensure = (id: string) => {
    if (!stats.has(id)) stats.set(id, { wins: 0, matches: 0 });
    return stats.get(id)!;
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

  // Also count matchups with no votes yet
  for (const m of matchups) {
    ensure(m.voice_a_id);
    ensure(m.voice_b_id);
  }

  // Fetch voice details
  const voiceIds = [...stats.keys()];
  const { data: voiceData } = await supabase
    .from("voices")
    .select("id, name, provider")
    .eq("active", true)
    .in("id", voiceIds);

  const voiceMap = new Map((voiceData || []).map((v) => [v.id, v]));

  const ranked = [...stats.entries()]
    .filter(([id]) => voiceMap.has(id))
    .map(([id, s]) => ({
      id,
      name: voiceMap.get(id)!.name,
      provider: voiceMap.get(id)!.provider,
      description: modelForProvider(voiceMap.get(id)!.provider),
      winCount: s.wins,
      matchCount: s.matches,
    }))
    .sort((a, b) => b.winCount - a.winCount)
    .slice(offset, offset + limit)
    .map((v, i) => ({ ...v, rank: offset + i + 1 }));

  return Response.json({ voices: ranked, filter: "filtered" });
}
