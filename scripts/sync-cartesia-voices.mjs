#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const REQUESTED_VOICES = [
  "Adam",
  "Allie",
  "Anna",
  "Brian",
  "Brooke",
  "Dallas",
  "Elena",
  "Ellen",
  "Ethan",
  "Eve",
  "Florence",
  "Holly",
  "Jacqueline",
  "Janelle",
  "Joan",
  "Kathy",
  "Katie",
  "Miguel",
  "Mike",
  "Nancy",
  "Pierre",
  "Sarah",
  "Sofia",
  "Summer",
  "Susan",
  "Suzanne",
];

const ELO_CATEGORIES = ["overall", "empathy", "authority", "energy"];
const REPORT_PATH = path.join("reports", "cartesia-voice-sync-report.json");
const CARTESIA_API_BASE = "https://api.cartesia.ai";
const CARTESIA_VERSION = "2025-04-16";
const CARTESIA_MODEL_ID = "sonic-3";

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

function baseName(fullName) {
  return fullName.split(" - ")[0].trim();
}

function sanitizeJsonText(text) {
  return text.replace(/[\u0000-\u001F]/g, " ");
}

function parseJsonLenient(text) {
  return JSON.parse(sanitizeJsonText(text));
}

function resolveVoiceByBaseName(availableVoices, requestedName) {
  const normalizedRequested = normalizeName(requestedName);
  const matches = availableVoices.filter(
    (voice) => normalizeName(baseName(voice.name || "")) === normalizedRequested
  );

  if (matches.length === 0) {
    return { matchType: "missing", voice: null, candidates: [] };
  }

  const exactName = matches.find((voice) =>
    baseName(voice.name || "").toLowerCase() === requestedName.toLowerCase()
  );

  return {
    matchType: exactName ? "exact" : "normalized_base",
    voice: exactName || matches[0],
    candidates: matches,
  };
}

async function cartesiaRequest(url, { method = "GET", apiKey, body } = {}) {
  return fetch(url, {
    method,
    headers: {
      "Cartesia-Version": CARTESIA_VERSION,
      "X-API-Key": apiKey,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function fetchAllCartesiaVoices(apiKey, report) {
  const allVoices = [];
  let cursor = null;
  let pageCount = 0;

  while (pageCount < 200) {
    const url = cursor
      ? `${CARTESIA_API_BASE}/voices?starting_after=${encodeURIComponent(cursor)}`
      : `${CARTESIA_API_BASE}/voices`;

    const response = await cartesiaRequest(url, { apiKey });
    const text = await response.text();

    report.catalogPages.push({
      page: pageCount + 1,
      status: response.status,
      cursor,
    });

    if (!response.ok) {
      throw new Error(`Cartesia voices fetch failed (${response.status})`);
    }

    const payload = parseJsonLenient(text);
    const pageVoices = Array.isArray(payload?.data) ? payload.data : [];
    allVoices.push(...pageVoices);

    pageCount += 1;

    if (!payload?.has_more || !payload?.next_page) break;
    if (payload.next_page === cursor) break;

    cursor = payload.next_page;
  }

  const deduped = Array.from(
    new Map(allVoices.map((voice) => [voice.id, voice])).values()
  );

  return deduped;
}

async function upsertCartesiaVoiceWithoutConstraints(supabase, row) {
  const description = `Cartesia voice (${row.matchType} match): ${row.resolvedVoiceName}`;

  const { data: byName, error: byNameError } = await supabase
    .from("voices")
    .select("id, name, provider, cartesia_voice_id, active")
    .eq("provider", "cartesia")
    .eq("name", row.requestedName)
    .limit(1)
    .maybeSingle();

  if (byNameError) throw new Error(byNameError.message);

  if (byName) {
    const { data, error } = await supabase
      .from("voices")
      .update({
        cartesia_voice_id: row.resolvedVoiceId,
        description,
        active: true,
      })
      .eq("id", byName.id)
      .eq("provider", "cartesia")
      .select("id, name, provider, cartesia_voice_id, active")
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data: byVoiceId, error: byVoiceIdError } = await supabase
    .from("voices")
    .select("id, name, provider, cartesia_voice_id, active")
    .eq("provider", "cartesia")
    .eq("cartesia_voice_id", row.resolvedVoiceId)
    .limit(1)
    .maybeSingle();

  if (byVoiceIdError) throw new Error(byVoiceIdError.message);

  if (byVoiceId) {
    const { data, error } = await supabase
      .from("voices")
      .update({
        name: row.requestedName,
        description,
        active: true,
      })
      .eq("id", byVoiceId.id)
      .eq("provider", "cartesia")
      .select("id, name, provider, cartesia_voice_id, active")
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from("voices")
    .insert({
      name: row.requestedName,
      provider: "cartesia",
      cartesia_voice_id: row.resolvedVoiceId,
      description,
      active: true,
    })
    .select("id, name, provider, cartesia_voice_id, active")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function seedEloRows(supabase, voiceId) {
  const eloRows = ELO_CATEGORIES.map((category) => ({
    voice_id: voiceId,
    category,
    rating: 1200,
    match_count: 0,
    win_count: 0,
  }));

  const { error: upsertError } = await supabase
    .from("elo_ratings")
    .upsert(eloRows, { onConflict: "voice_id,category" });

  if (!upsertError) return null;
  if (
    !upsertError.message?.includes(
      "there is no unique or exclusion constraint matching the ON CONFLICT specification"
    )
  ) {
    return upsertError;
  }

  for (const row of eloRows) {
    const { data: existing, error: existingError } = await supabase
      .from("elo_ratings")
      .select("id")
      .eq("voice_id", row.voice_id)
      .eq("category", row.category)
      .limit(1)
      .maybeSingle();

    if (existingError) return existingError;

    if (existing) {
      const { error: updateError } = await supabase
        .from("elo_ratings")
        .update({
          rating: row.rating,
          match_count: row.match_count,
          win_count: row.win_count,
        })
        .eq("id", existing.id);
      if (updateError) return updateError;
    } else {
      const { error: insertError } = await supabase.from("elo_ratings").insert(row);
      if (insertError) return insertError;
    }
  }

  return null;
}

async function main() {
  loadDotEnvFileIfPresent();

  const cartesiaApiKey = process.env.CARTESIA_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!cartesiaApiKey) {
    throw new Error("Missing CARTESIA_API_KEY");
  }
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase URL or service role key in environment");
  }

  const report = {
    generatedAt: new Date().toISOString(),
    requestedVoiceCount: REQUESTED_VOICES.length,
    modelId: CARTESIA_MODEL_ID,
    catalogPages: [],
    availableVoiceCount: 0,
    resolved: [],
    missing: [],
    probes: [],
    upserted: [],
    deactivated: [],
    failures: [],
  };

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log("1) Fetching full Cartesia voice catalog...");
  const availableVoices = await fetchAllCartesiaVoices(cartesiaApiKey, report);
  report.availableVoiceCount = availableVoices.length;

  console.log(
    `2) Resolving ${REQUESTED_VOICES.length} requested names against ${availableVoices.length} voices...`
  );

  const resolvedRows = REQUESTED_VOICES.map((requestedName) => {
    const match = resolveVoiceByBaseName(availableVoices, requestedName);
    const candidates = match.candidates.slice(0, 5).map((voice) => ({
      name: voice.name,
      id: voice.id,
    }));

    return {
      requestedName,
      matchType: match.matchType,
      resolvedVoiceName: match.voice?.name || null,
      resolvedVoiceId: match.voice?.id || null,
      candidates,
    };
  });

  report.resolved = resolvedRows;
  report.missing = resolvedRows.filter((row) => !row.resolvedVoiceId);

  console.log("3) Probing each resolved voice with Cartesia TTS...");
  for (const row of resolvedRows) {
    if (!row.resolvedVoiceId) {
      report.probes.push({
        requestedName: row.requestedName,
        voiceId: null,
        status: "skipped_missing_voice",
      });
      continue;
    }

    const ttsResponse = await cartesiaRequest(`${CARTESIA_API_BASE}/tts/bytes`, {
      method: "POST",
      apiKey: cartesiaApiKey,
      body: {
        model_id: CARTESIA_MODEL_ID,
        transcript: `Voice existence probe for ${row.requestedName}.`,
        voice: {
          mode: "id",
          id: row.resolvedVoiceId,
        },
        output_format: {
          container: "wav",
          encoding: "pcm_s16le",
          sample_rate: 24000,
        },
      },
    });

    const bodyBuffer = await ttsResponse.arrayBuffer();

    report.probes.push({
      requestedName: row.requestedName,
      voiceId: row.resolvedVoiceId,
      statusCode: ttsResponse.status,
      ok: ttsResponse.ok,
      bytes: bodyBuffer.byteLength,
    });
  }

  const probePassedByName = new Map(
    report.probes.filter((probe) => probe.ok).map((probe) => [probe.requestedName, true])
  );

  const readyForUpsert = resolvedRows.filter(
    (row) => row.resolvedVoiceId && probePassedByName.has(row.requestedName)
  );

  console.log("4) Upserting verified Cartesia voices into Supabase...");
  for (const row of readyForUpsert) {
    let data;
    try {
      data = await upsertCartesiaVoiceWithoutConstraints(supabase, row);
    } catch (error) {
      report.failures.push({
        step: "upsert_voice",
        requestedName: row.requestedName,
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    report.upserted.push(data);

    const eloError = await seedEloRows(supabase, data.id);
    if (eloError) {
      report.failures.push({
        step: "upsert_elo",
        requestedName: row.requestedName,
        voiceId: data.id,
        error: eloError.message,
      });
    }
  }

  const targetNames = new Set(readyForUpsert.map((row) => row.requestedName));

  console.log("5) Deactivating obsolete Cartesia voices...");
  const { data: existingCartesia, error: existingCartesiaError } = await supabase
    .from("voices")
    .select("id, name, active")
    .eq("provider", "cartesia");

  if (existingCartesiaError) {
    report.failures.push({
      step: "fetch_existing_cartesia",
      error: existingCartesiaError.message,
    });
  } else {
    const toDeactivate = (existingCartesia || []).filter(
      (voice) => !targetNames.has(voice.name) && voice.active !== false
    );

    for (const voice of toDeactivate) {
      const { error } = await supabase
        .from("voices")
        .update({ active: false })
        .eq("id", voice.id)
        .eq("provider", "cartesia");

      if (error) {
        report.failures.push({
          step: "deactivate_voice",
          voiceId: voice.id,
          name: voice.name,
          error: error.message,
        });
        continue;
      }

      report.deactivated.push({ id: voice.id, name: voice.name });
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("Done.");
  console.log(`Available Cartesia voices: ${report.availableVoiceCount}`);
  console.log(`Resolved voices: ${resolvedRows.filter((r) => r.resolvedVoiceId).length}`);
  console.log(`Probe-passing voices: ${readyForUpsert.length}`);
  console.log(`Missing voices: ${report.missing.length}`);
  console.log(`Upserted voices: ${report.upserted.length}`);
  console.log(`Deactivated voices: ${report.deactivated.length}`);
  console.log(`Failures: ${report.failures.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
