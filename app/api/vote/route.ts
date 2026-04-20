import { createServerClient } from "@/lib/supabase";
import { calculateElo } from "@/lib/elo";

interface VoteBody {
  matchupId: string;
  preferred: "a" | "b";
}

export async function POST(request: Request) {
  const body: VoteBody = await request.json();
  const { matchupId, preferred } = body;

  if (!matchupId || !preferred || !["a", "b"].includes(preferred)) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: matchup, error: matchupError } = await supabase
    .from("matchups")
    .select("voice_a_id, voice_b_id")
    .eq("id", matchupId)
    .single();

  if (matchupError || !matchup) {
    return Response.json({ error: "Matchup not found" }, { status: 404 });
  }

  const { voice_a_id, voice_b_id } = matchup;

  const { error: voteError } = await supabase.from("votes").insert({
    matchup_id: matchupId,
    category: "preferred",
    winner: preferred,
  });

  if (voteError) {
    return Response.json({ error: "Failed to save vote" }, { status: 500 });
  }

  // Fetch current ELO ratings for both voices
  const [{ data: voiceA }, { data: voiceB }] = await Promise.all([
    supabase.from("voices").select("elo_rating, match_count").eq("id", voice_a_id).single(),
    supabase.from("voices").select("elo_rating, match_count").eq("id", voice_b_id).single(),
  ]);

  const ratingA = voiceA?.elo_rating ?? 1500;
  const ratingB = voiceB?.elo_rating ?? 1500;

  const [newRatingA, newRatingB] = calculateElo(ratingA, ratingB, preferred);

  // Update both voices with new ELO ratings and increment match counts
  await Promise.all([
    supabase
      .from("voices")
      .update({
        elo_rating: newRatingA,
        match_count: (voiceA?.match_count ?? 0) + 1,
      })
      .eq("id", voice_a_id),
    supabase
      .from("voices")
      .update({
        elo_rating: newRatingB,
        match_count: (voiceB?.match_count ?? 0) + 1,
      })
      .eq("id", voice_b_id),
  ]);

  return Response.json({
    success: true,
    eloA: newRatingA,
    eloB: newRatingB,
    prevEloA: ratingA,
    prevEloB: ratingB,
  });
}
