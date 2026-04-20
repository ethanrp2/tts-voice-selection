import { createServerClient } from "@/lib/supabase";

/** Pick a random index using weights (higher weight = more likely). */
function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export async function GET() {
  const supabase = createServerClient();

  // Get all active voices with match_count for balanced selection
  const { data: voices, error: voicesError } = await supabase
    .from("voices")
    .select("id, name, match_count, provider")
    .eq("active", true);

  if (voicesError || !voices || voices.length < 2) {
    return Response.json(
      { error: "Not enough voices available" },
      { status: 500 }
    );
  }

  // Weighted random: voices with fewer matches are more likely to be picked
  const weights = voices.map((v) => 1 / ((v.match_count ?? 0) + 1));

  const indexA = weightedRandomIndex(weights);
  const voiceA = voices[indexA];

  // Remove voice A from pool, recompute weights, pick voice B
  const remaining = voices.filter((_, i) => i !== indexA);
  const remainingWeights = remaining.map((v) => 1 / ((v.match_count ?? 0) + 1));
  const indexB = weightedRandomIndex(remainingWeights);
  const voiceB = remaining[indexB];

  // Get a random active phrase
  const { data: phrases, error: phrasesError } = await supabase
    .from("phrases")
    .select("id, text, use_case, industry, description")
    .eq("active", true);

  if (phrasesError || !phrases || phrases.length === 0) {
    return Response.json({ error: "No phrases available" }, { status: 500 });
  }

  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  // Create the matchup record
  const { data: matchup, error: matchupError } = await supabase
    .from("matchups")
    .insert({
      voice_a_id: voiceA.id,
      voice_b_id: voiceB.id,
      phrase_id: phrase.id,
    })
    .select("id")
    .single();

  if (matchupError) {
    return Response.json(
      { error: "Failed to create matchup" },
      { status: 500 }
    );
  }

  return Response.json({
    matchupId: matchup.id,
    phrase: phrase.text,
    useCase: phrase.use_case || null,
    industry: phrase.industry || null,
    description: phrase.description || null,
    voiceA: { id: voiceA.id, name: voiceA.name, provider: voiceA.provider },
    voiceB: { id: voiceB.id, name: voiceB.name, provider: voiceB.provider },
  });
}
