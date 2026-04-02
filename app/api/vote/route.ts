import { createServerClient } from "@/lib/supabase";
import { calculateElo } from "@/lib/elo";

interface VoteBody {
  matchupId: string;
  votes: {
    appeal: "a" | "b";
    empathy: "a" | "b";
    authority: "a" | "b";
    energy: "a" | "b";
  };
}

export async function POST(request: Request) {
  const body: VoteBody = await request.json();
  const { matchupId, votes } = body;

  if (!matchupId || !votes?.appeal || !votes?.empathy || !votes?.authority || !votes?.energy) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Get the matchup to find voice IDs
  const { data: matchup, error: matchupError } = await supabase
    .from("matchups")
    .select("voice_a_id, voice_b_id")
    .eq("id", matchupId)
    .single();

  if (matchupError || !matchup) {
    return Response.json({ error: "Matchup not found" }, { status: 404 });
  }

  const { voice_a_id, voice_b_id } = matchup;

  // Insert votes for each category
  const categories = ["appeal", "empathy", "authority", "energy"] as const;
  for (const category of categories) {
    const { error } = await supabase.from("votes").insert({
      matchup_id: matchupId,
      category,
      winner: votes[category],
    });

    if (error) {
      return Response.json(
        { error: `Failed to save ${category} vote` },
        { status: 500 }
      );
    }
  }

  // Update ELO for each category
  for (const category of categories) {
    const winner = votes[category];

    // Get current ratings
    const { data: ratingA } = await supabase
      .from("elo_ratings")
      .select("rating, match_count, win_count")
      .eq("voice_id", voice_a_id)
      .eq("category", category)
      .single();

    const { data: ratingB } = await supabase
      .from("elo_ratings")
      .select("rating, match_count, win_count")
      .eq("voice_id", voice_b_id)
      .eq("category", category)
      .single();

    if (!ratingA || !ratingB) continue;

    const [newRatingA, newRatingB] = calculateElo(
      ratingA.rating,
      ratingB.rating,
      winner
    );

    await supabase
      .from("elo_ratings")
      .update({
        rating: newRatingA,
        match_count: ratingA.match_count + 1,
        win_count: ratingA.win_count + (winner === "a" ? 1 : 0),
        updated_at: new Date().toISOString(),
      })
      .eq("voice_id", voice_a_id)
      .eq("category", category);

    await supabase
      .from("elo_ratings")
      .update({
        rating: newRatingB,
        match_count: ratingB.match_count + 1,
        win_count: ratingB.win_count + (winner === "b" ? 1 : 0),
        updated_at: new Date().toISOString(),
      })
      .eq("voice_id", voice_b_id)
      .eq("category", category);
  }

  return Response.json({ success: true });
}
