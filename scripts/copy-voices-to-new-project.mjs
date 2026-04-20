#!/usr/bin/env node
/**
 * Copies all voice rows (+ ELO seed ratings) from the SOURCE Supabase project
 * to a NEW project. Run after executing setup.sql in the new project.
 *
 * Usage:
 *   SOURCE_URL=https://old.supabase.co SOURCE_KEY=... \
 *   DEST_URL=https://new.supabase.co   DEST_KEY=...   \
 *   node scripts/copy-voices-to-new-project.mjs
 */
import { createClient } from "@supabase/supabase-js";

const sourceUrl = process.env.SOURCE_URL;
const sourceKey = process.env.SOURCE_KEY;
const destUrl   = process.env.DEST_URL;
const destKey   = process.env.DEST_KEY;

if (!sourceUrl || !sourceKey || !destUrl || !destKey) {
  console.error(
    "Required env vars: SOURCE_URL, SOURCE_KEY, DEST_URL, DEST_KEY"
  );
  process.exit(1);
}

const source = createClient(sourceUrl, sourceKey);
const dest   = createClient(destUrl, destKey);

const { data: voices, error } = await source
  .from("voices")
  .select("*");

if (error) {
  console.error("Failed to read voices from source:", error.message);
  process.exit(1);
}

console.log(`Found ${voices.length} voices in source project`);

for (const v of voices) {
  const { error: insertErr } = await dest.from("voices").insert({
    id: v.id,
    name: v.name,
    provider: v.provider,
    cartesia_voice_id: v.cartesia_voice_id,
    elevenlabs_voice_id: v.elevenlabs_voice_id,
    rime_speaker: v.rime_speaker,
    description: v.description,
    active: v.active,
    flag_count: v.flag_count ?? 0,
  });

  if (insertErr) {
    console.warn(`  Skip ${v.name} (${v.provider}): ${insertErr.message}`);
  } else {
    console.log(`  Copied ${v.name} (${v.provider})`);
  }
}

const categories = ["appeal", "empathy", "authority", "energy"];
let eloCount = 0;

for (const v of voices) {
  for (const cat of categories) {
    const { error: eloErr } = await dest.from("elo_ratings").insert({
      voice_id: v.id,
      category: cat,
      rating: 1200,
      match_count: 0,
      win_count: 0,
    });
    if (!eloErr) eloCount++;
  }
}

console.log(`\nSeeded ${eloCount} ELO rating rows (fresh 1200 for all)`);
console.log("Done!");
