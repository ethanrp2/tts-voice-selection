#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const REQUESTED_VOICES = [
  "Addison",
  "Ana",
  "Angie",
  "Anna",
  "Ava",
  "Bree",
  "Bruno",
  "Clara",
  "Eric",
  "Finch",
  "Finn",
  "Hope",
  "Jeka",
  "Jessica Anne",
  "Juan Carlos",
  "Marcel",
  "Mark",
  "Maura",
  "Maya",
  "Michael",
  "Michelle",
  "Mike",
  "Monika",
  "Nathaniel",
  "Olivia",
  "Ranbir",
  "Raymond",
  "Rebecca",
  "Riya",
  "Stephanie",
  "Sully",
  "Valeria",
  "Wayne",
];

const ELO_CATEGORIES = ["appeal", "empathy", "authority", "energy"];
const FALLBACK_MODEL_ID = "eleven_v3";
const REPORT_PATH = path.join("reports", "elevenlabs-voice-sync-report.json");

function loadDotEnvFileIfPresent(envPath = ".env") {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function normalizeName(input) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pickBestModel(models) {
  if (!Array.isArray(models)) return FALLBACK_MODEL_ID;

  const ttsModels = models.filter((model) => model.can_do_text_to_speech);
  const byId = new Map(ttsModels.map((model) => [model.model_id, model]));

  const preferredOrder = [
    "eleven_v3",
    "eleven_multilingual_v2",
    "eleven_turbo_v2_5",
    "eleven_flash_v2_5",
  ];

  for (const modelId of preferredOrder) {
    if (byId.has(modelId)) return modelId;
  }

  return ttsModels[0]?.model_id || FALLBACK_MODEL_ID;
}

function resolveVoiceByName(availableVoices, requestedName) {
  const exact = availableVoices.filter(
    (voice) => voice.name?.toLowerCase() === requestedName.toLowerCase()
  );
  if (exact.length > 0) {
    return { matchType: "exact", voice: exact[0], candidates: exact };
  }

  const normalizedRequested = normalizeName(requestedName);
  const normalized = availableVoices.filter(
    (voice) => normalizeName(voice.name || "") === normalizedRequested
  );
  if (normalized.length > 0) {
    return { matchType: "normalized", voice: normalized[0], candidates: normalized };
  }

  const startsWith = availableVoices.filter((voice) =>
    normalizeName(voice.name || "").startsWith(normalizedRequested)
  );
  if (startsWith.length > 0) {
    return { matchType: "prefix", voice: startsWith[0], candidates: startsWith };
  }

  const contains = availableVoices.filter((voice) =>
    normalizeName(voice.name || "").includes(normalizedRequested)
  );
  if (contains.length > 0) {
    return { matchType: "contains", voice: contains[0], candidates: contains };
  }

  return { matchType: "missing", voice: null, candidates: [] };
}

async function elevenlabsRequest(url, { method = "GET", apiKey, body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      "xi-api-key": apiKey,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response;
}

async function main() {
  loadDotEnvFileIfPresent();

  const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!elevenlabsApiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY");
  }
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase URL or service role key in environment");
  }

  const report = {
    generatedAt: new Date().toISOString(),
    requestedVoiceCount: REQUESTED_VOICES.length,
    modelValidation: null,
    voiceListValidation: null,
    selectedModelId: FALLBACK_MODEL_ID,
    resolved: [],
    probes: [],
    inserted: [],
    missing: [],
    failures: [],
  };

  console.log("1) Validating ElevenLabs model + voice list permissions...");
  const modelsResponse = await elevenlabsRequest("https://api.elevenlabs.io/v1/models", {
    apiKey: elevenlabsApiKey,
  });
  const modelsText = await modelsResponse.text();
  report.modelValidation = { status: modelsResponse.status };

  if (!modelsResponse.ok) {
    report.failures.push({
      step: "model_validation",
      status: modelsResponse.status,
      body: modelsText,
    });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    throw new Error(
      `Model validation failed (${modelsResponse.status}). Ensure ELEVENLABS key has models_read.`
    );
  }

  const models = JSON.parse(modelsText);
  report.selectedModelId = pickBestModel(models);

  const voicesResponse = await elevenlabsRequest("https://api.elevenlabs.io/v1/voices", {
    apiKey: elevenlabsApiKey,
  });
  const voicesText = await voicesResponse.text();
  report.voiceListValidation = { status: voicesResponse.status };

  if (!voicesResponse.ok) {
    report.failures.push({
      step: "voice_list_validation",
      status: voicesResponse.status,
      body: voicesText,
    });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    throw new Error(
      `Voice list validation failed (${voicesResponse.status}). Ensure ELEVENLABS key has voices_read.`
    );
  }

  const voicePayload = JSON.parse(voicesText);
  const availableVoices = Array.isArray(voicePayload?.voices) ? voicePayload.voices : [];

  console.log(
    `2) Resolving ${REQUESTED_VOICES.length} requested names against ${availableVoices.length} voices...`
  );

  const resolvedRows = REQUESTED_VOICES.map((requestedName) => {
    const match = resolveVoiceByName(availableVoices, requestedName);
    const candidates = match.candidates.slice(0, 5).map((voice) => ({
      name: voice.name,
      voice_id: voice.voice_id,
    }));
    return {
      requestedName,
      matchType: match.matchType,
      resolvedVoiceName: match.voice?.name || null,
      resolvedVoiceId: match.voice?.voice_id || null,
      candidates,
    };
  });

  report.resolved = resolvedRows;
  report.missing = resolvedRows.filter((row) => !row.resolvedVoiceId);

  console.log("3) Probing each resolved voice with TTS...");
  for (const row of resolvedRows) {
    if (!row.resolvedVoiceId) {
      report.probes.push({
        requestedName: row.requestedName,
        voiceId: null,
        status: "skipped_missing_voice",
      });
      continue;
    }

    const ttsResponse = await elevenlabsRequest(
      `https://api.elevenlabs.io/v1/text-to-speech/${row.resolvedVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        apiKey: elevenlabsApiKey,
        body: {
          text: `Voice existence probe for ${row.requestedName}.`,
          model_id: report.selectedModelId,
        },
      }
    );
    const bodyBuffer = await ttsResponse.arrayBuffer();
    const byteLength = bodyBuffer.byteLength;

    report.probes.push({
      requestedName: row.requestedName,
      voiceId: row.resolvedVoiceId,
      statusCode: ttsResponse.status,
      ok: ttsResponse.ok,
      bytes: byteLength,
    });
  }

  const probePassedByName = new Map(
    report.probes
      .filter((probe) => probe.ok)
      .map((probe) => [probe.requestedName, true])
  );

  const readyForInsert = resolvedRows.filter(
    (row) => row.resolvedVoiceId && probePassedByName.has(row.requestedName)
  );

  console.log("4) Upserting valid ElevenLabs voices into Supabase...");
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  for (const row of readyForInsert) {
    const description = `ElevenLabs voice (${row.matchType} match): ${row.resolvedVoiceName}`;

    const { data, error } = await supabase
      .from("voices")
      .upsert(
        {
          name: row.requestedName,
          provider: "elevenlabs",
          elevenlabs_voice_id: row.resolvedVoiceId,
          cartesia_voice_id: null,
          description,
          active: true,
        },
        { onConflict: "provider,name" }
      )
      .select("id, name, provider, elevenlabs_voice_id")
      .single();

    if (error) {
      report.failures.push({
        step: "upsert_voice",
        requestedName: row.requestedName,
        error: error.message,
      });
      continue;
    }

    report.inserted.push(data);

    const eloRows = ELO_CATEGORIES.map((category) => ({
      voice_id: data.id,
      category,
      rating: 1200,
      match_count: 0,
      win_count: 0,
    }));

    const { error: eloError } = await supabase
      .from("elo_ratings")
      .upsert(eloRows, { onConflict: "voice_id,category" });

    if (eloError) {
      report.failures.push({
        step: "upsert_elo",
        requestedName: row.requestedName,
        voiceId: data.id,
        error: eloError.message,
      });
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("Done.");
  console.log(`Selected model: ${report.selectedModelId}`);
  console.log(`Resolved voices: ${resolvedRows.filter((r) => r.resolvedVoiceId).length}`);
  console.log(`Inserted voices: ${report.inserted.length}`);
  console.log(`Missing voices: ${report.missing.length}`);
  console.log(`Failures: ${report.failures.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
