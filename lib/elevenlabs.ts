export const ELEVENLABS_MODEL_FALLBACKS = [
  "eleven_v3",
  "eleven_multilingual_v2",
  "eleven_flash_v2_5",
  "eleven_turbo_v2",
] as const;

export function elevenLabsModelCandidates(): string[] {
  const override = process.env.ELEVENLABS_MODEL_ID?.trim();
  if (!override) return [...ELEVENLABS_MODEL_FALLBACKS];

  return [
    override,
    ...ELEVENLABS_MODEL_FALLBACKS.filter((modelId) => modelId !== override),
  ];
}

export function primaryElevenLabsModelId(): string {
  return elevenLabsModelCandidates()[0];
}

type ElevenLabsSynthesisResult =
  | { ok: true; response: Response; modelId: string }
  | { ok: false; status: number; details: string; modelId: string };

export async function synthesizeElevenLabsSpeech(
  apiKey: string,
  voiceId: string,
  text: string,
): Promise<ElevenLabsSynthesisResult> {
  const models = elevenLabsModelCandidates();
  let lastFailure: Extract<ElevenLabsSynthesisResult, { ok: false }> = {
    ok: false,
    status: 502,
    details: "No ElevenLabs models attempted",
    modelId: models[0] ?? "",
  };

  for (const modelId of models) {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
        }),
      },
    );

    if (response.ok) {
      return { ok: true, response, modelId };
    }

    const details = await response.text();
    lastFailure = { ok: false, status: response.status, details, modelId };

    // Auth, permission, and missing-voice errors won't improve with another model.
    if (
      response.status === 401 ||
      response.status === 403 ||
      response.status === 404
    ) {
      break;
    }
  }

  return lastFailure;
}
