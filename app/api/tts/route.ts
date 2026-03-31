import { createServerClient } from "@/lib/supabase";

interface TTSBody {
  voiceId: string;
  text: string;
}

export async function POST(request: Request) {
  const body: TTSBody = await request.json();
  const { voiceId, text } = body;

  if (!voiceId || !text) {
    return Response.json({ error: "Missing voiceId or text" }, { status: 400 });
  }

  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Cartesia API key not configured" },
      { status: 500 }
    );
  }

  // Look up the Cartesia voice ID
  const supabase = createServerClient();
  const { data: voice, error } = await supabase
    .from("voices")
    .select("cartesia_voice_id")
    .eq("id", voiceId)
    .single();

  if (error || !voice) {
    return Response.json({ error: "Voice not found" }, { status: 404 });
  }

  // Proxy to Cartesia TTS API
  const cartesiaResponse = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "Cartesia-Version": "2025-04-16",
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "sonic-3",
      transcript: text,
      voice: {
        mode: "id",
        id: voice.cartesia_voice_id,
      },
      output_format: {
        container: "wav",
        encoding: "pcm_f32le",
        sample_rate: 44100,
      },
      speed: "normal",
      generation_config: {
        speed: 1,
        volume: 1,
      },
    }),
  });

  if (!cartesiaResponse.ok) {
    const errorText = await cartesiaResponse.text();
    return Response.json(
      { error: "TTS generation failed", details: errorText },
      { status: cartesiaResponse.status }
    );
  }

  // Stream the audio bytes back
  const audioBytes = await cartesiaResponse.arrayBuffer();
  return new Response(audioBytes, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
