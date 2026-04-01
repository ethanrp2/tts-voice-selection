import { createServerClient } from "@/lib/supabase";

interface TTSBody {
  voiceId: string;
  text: string;
}

type VoiceRow = {
  provider?: string | null;
  cartesia_voice_id?: string | null;
  rime_speaker?: string | null;
  elevenlabs_voice_id?: string | null;
};

async function getVoiceById(voiceId: string): Promise<VoiceRow | null> {
  const supabase = createServerClient();
  const selectVariants = [
    "provider, cartesia_voice_id, rime_speaker, elevenlabs_voice_id",
    "provider, cartesia_voice_id, rime_speaker",
    "provider, cartesia_voice_id, elevenlabs_voice_id",
    "provider, cartesia_voice_id",
  ] as const;

  for (const selectClause of selectVariants) {
    const { data, error } = await supabase
      .from("voices")
      .select(selectClause)
      .eq("id", voiceId)
      .single();

    if (!error) return data as VoiceRow;
    if (error.code !== "42703") return null;
  }

  return null;
}

export async function POST(request: Request) {
  const body: TTSBody = await request.json();
  const { voiceId, text } = body;

  if (!voiceId || !text) {
    return Response.json({ error: "Missing voiceId or text" }, { status: 400 });
  }

  const voice = await getVoiceById(voiceId);

  if (!voice) {
    return Response.json({ error: "Voice not found" }, { status: 404 });
  }

  const provider = (voice.provider || "cartesia").toLowerCase();
  const cartesiaVoiceId = voice.cartesia_voice_id || null;
  const rimeSpeaker = voice.rime_speaker || cartesiaVoiceId;
  // Temporary backward-compatibility: before DB migration is applied, existing
  // schemas store provider IDs in cartesia_voice_id.
  const elevenLabsVoiceId =
    voice.elevenlabs_voice_id || (provider === "elevenlabs" ? cartesiaVoiceId : null);

  let upstream: Response;

  if (provider === "rime") {
    const apiKey = process.env.RIME_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Rime API key not configured" },
        { status: 500 }
      );
    }
    if (!rimeSpeaker) {
      return Response.json(
        { error: "Rime speaker not configured for voice" },
        { status: 500 }
      );
    }

    upstream = await fetch("https://users.rime.ai/v1/rime-tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "audio/mp3",
      },
      body: JSON.stringify({
        text,
        speaker: rimeSpeaker,
        modelId: "mistv2",
        lang: "eng",
      }),
    });
  } else if (provider === "elevenlabs") {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_v3";

    if (!apiKey) {
      return Response.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }
    if (!elevenLabsVoiceId) {
      return Response.json(
        { error: "ElevenLabs voice ID not configured for voice" },
        { status: 500 }
      );
    }

    upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
        }),
      }
    );
  } else if (provider === "cartesia") {
    const apiKey = process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Cartesia API key not configured" },
        { status: 500 }
      );
    }
    if (!cartesiaVoiceId) {
      return Response.json(
        { error: "Cartesia voice ID not configured for voice" },
        { status: 500 }
      );
    }

    upstream = await fetch("https://api.cartesia.ai/tts/bytes", {
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
          id: cartesiaVoiceId,
        },
        output_format: {
          container: "wav",
          encoding: "pcm_s16le",
          sample_rate: 24000,
        },
        speed: "normal",
        generation_config: {
          speed: 1,
          volume: 1,
        },
      }),
    });
  } else {
    return Response.json(
      { error: `Unsupported provider: ${provider}` },
      { status: 400 }
    );
  }

  if (!upstream.ok) {
    const errorText = await upstream.text();
    return Response.json(
      { error: "TTS generation failed", details: errorText, provider },
      { status: upstream.status }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
