import { createServerClient } from "@/lib/supabase";

interface FlagBody {
  voiceId: string;
  matchupId?: string;
}

export async function POST(request: Request) {
  const body: FlagBody = await request.json();
  const { voiceId, matchupId } = body;

  if (!voiceId) {
    return Response.json({ error: "Missing voiceId" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Insert flag record
  const { error: flagError } = await supabase.from("voice_flags").insert({
    voice_id: voiceId,
    matchup_id: matchupId || null,
  });

  if (flagError) {
    return Response.json({ error: "Failed to flag voice" }, { status: 500 });
  }

  // Increment flag_count on the voice
  const { data: voice } = await supabase
    .from("voices")
    .select("flag_count")
    .eq("id", voiceId)
    .single();

  if (voice) {
    const newCount = (voice.flag_count || 0) + 1;
    await supabase
      .from("voices")
      .update({ flag_count: newCount })
      .eq("id", voiceId);

    // Auto-deactivate if flagged too many times
    if (newCount >= 10) {
      await supabase
        .from("voices")
        .update({ active: false })
        .eq("id", voiceId);
    }
  }

  return Response.json({ success: true });
}
