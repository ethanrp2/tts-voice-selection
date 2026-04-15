import { createServerClient } from "@/lib/supabase";

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
  const winnerId = preferred === "a" ? voice_a_id : voice_b_id;
  const loserId = preferred === "a" ? voice_b_id : voice_a_id;

  const { error: voteError } = await supabase.from("votes").insert({
    matchup_id: matchupId,
    category: "preferred",
    winner: preferred,
  });

  if (voteError) {
    return Response.json({ error: "Failed to save vote" }, { status: 500 });
  }

  const [{ data: winner }, { data: loser }] = await Promise.all([
    supabase.from("voices").select("win_count, match_count").eq("id", winnerId).single(),
    supabase.from("voices").select("match_count").eq("id", loserId).single(),
  ]);

  await Promise.all([
    supabase
      .from("voices")
      .update({
        win_count: (winner?.win_count ?? 0) + 1,
        match_count: (winner?.match_count ?? 0) + 1,
      })
      .eq("id", winnerId),
    supabase
      .from("voices")
      .update({
        match_count: (loser?.match_count ?? 0) + 1,
      })
      .eq("id", loserId),
  ]);

  return Response.json({ success: true });
}
