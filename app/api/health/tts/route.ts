import { synthesizeElevenLabsSpeech } from "@/lib/elevenlabs";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const cartesiaKey = process.env.CARTESIA_API_KEY;
  const rimeKey = process.env.RIME_API_KEY;

  let elevenLabsVoice: {
    id: string;
    name: string;
    elevenlabsVoiceId: string | null;
  } | null = null;

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("voices")
      .select("id, name, elevenlabs_voice_id, cartesia_voice_id")
      .eq("provider", "elevenlabs")
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (data) {
      elevenLabsVoice = {
        id: data.id,
        name: data.name,
        elevenlabsVoiceId:
          data.elevenlabs_voice_id || data.cartesia_voice_id || null,
      };
    }
  } catch (error) {
    return Response.json({
      ok: false,
      step: "supabase",
      error: error instanceof Error ? error.message : "Supabase query failed",
      env: {
        elevenLabsApiKeyConfigured: Boolean(apiKey),
        cartesiaApiKeyConfigured: Boolean(cartesiaKey),
        rimeApiKeyConfigured: Boolean(rimeKey),
      },
    });
  }

  if (!apiKey) {
    return Response.json({
      ok: false,
      step: "env",
      error: "ELEVENLABS_API_KEY is not configured",
      elevenLabsVoice,
      env: {
        elevenLabsApiKeyConfigured: false,
        cartesiaApiKeyConfigured: Boolean(cartesiaKey),
        rimeApiKeyConfigured: Boolean(rimeKey),
      },
    });
  }

  if (!elevenLabsVoice?.elevenlabsVoiceId) {
    return Response.json({
      ok: false,
      step: "voice",
      error: "No active ElevenLabs voice with a configured voice ID",
      elevenLabsVoice,
      env: {
        elevenLabsApiKeyConfigured: true,
        cartesiaApiKeyConfigured: Boolean(cartesiaKey),
        rimeApiKeyConfigured: Boolean(rimeKey),
      },
    });
  }

  const synthesis = await synthesizeElevenLabsSpeech(
    apiKey,
    elevenLabsVoice.elevenlabsVoiceId,
    "Voice Arena health check.",
  );

  if (!synthesis.ok) {
    return Response.json({
      ok: false,
      step: "elevenlabs",
      error: "ElevenLabs synthesis failed",
      details: synthesis.details,
      modelId: synthesis.modelId,
      status: synthesis.status,
      elevenLabsVoice,
      env: {
        elevenLabsApiKeyConfigured: true,
        cartesiaApiKeyConfigured: Boolean(cartesiaKey),
        rimeApiKeyConfigured: Boolean(rimeKey),
      },
    });
  }

  const bytes = (await synthesis.response.arrayBuffer()).byteLength;

  return Response.json({
    ok: true,
    bytes,
    modelId: synthesis.modelId,
    elevenLabsVoice,
    env: {
      elevenLabsApiKeyConfigured: true,
      cartesiaApiKeyConfigured: Boolean(cartesiaKey),
      rimeApiKeyConfigured: Boolean(rimeKey),
    },
  });
}
