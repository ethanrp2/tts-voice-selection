-- Adds an explicit speaker column for Rime voices while keeping backward
-- compatibility with legacy rows that store provider voice IDs in
-- cartesia_voice_id.

alter table public.voices
  add column if not exists rime_speaker text;

update public.voices
set rime_speaker = lower(cartesia_voice_id)
where provider = 'rime'
  and rime_speaker is null
  and cartesia_voice_id is not null;

alter table public.voices
  drop constraint if exists voices_provider_voice_id_consistency_chk;

alter table public.voices
  add constraint voices_provider_voice_id_consistency_chk
  check (
    (provider = 'cartesia' and cartesia_voice_id is not null and elevenlabs_voice_id is null)
    or
    (provider = 'elevenlabs' and elevenlabs_voice_id is not null and cartesia_voice_id is null)
    or
    (provider = 'rime' and coalesce(rime_speaker, cartesia_voice_id) is not null)
  );

create unique index if not exists voices_rime_speaker_uidx
  on public.voices (rime_speaker)
  where provider = 'rime' and rime_speaker is not null;
