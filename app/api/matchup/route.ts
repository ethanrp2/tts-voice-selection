import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();

  // Get 2 random active voices
  const { data: voices, error: voicesError } = await supabase
    .from("voices")
    .select("id, name")
    .eq("active", true);

  if (voicesError || !voices || voices.length < 2) {
    return Response.json(
      { error: "Not enough voices available" },
      { status: 500 }
    );
  }

  // Shuffle and pick 2
  const shuffled = voices.sort(() => Math.random() - 0.5);
  const voiceA = shuffled[0];
  const voiceB = shuffled[1];

  // Get a random active phrase
  const { data: phrases, error: phrasesError } = await supabase
    .from("phrases")
    .select("id, text")
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
    voiceA: { id: voiceA.id, name: voiceA.name },
    voiceB: { id: voiceB.id, name: voiceB.name },
  });
}
