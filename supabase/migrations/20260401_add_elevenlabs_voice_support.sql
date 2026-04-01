-- Adds ElevenLabs provider support while preserving existing Cartesia rows.

alter table public.voices
  add column if not exists elevenlabs_voice_id text;

alter table public.voices
  alter column cartesia_voice_id drop not null;

update public.voices
set provider = 'cartesia'
where provider is null;

alter table public.voices
  alter column provider set not null;

alter table public.voices
  drop constraint if exists voices_provider_check;

alter table public.voices
  add constraint voices_provider_check
  check (provider in ('cartesia', 'elevenlabs', 'rime'));

alter table public.voices
  drop constraint if exists voices_provider_voice_id_consistency_chk;

alter table public.voices
  add constraint voices_provider_voice_id_consistency_chk
  check (
    (provider = 'cartesia' and cartesia_voice_id is not null and elevenlabs_voice_id is null)
    or
    (provider = 'elevenlabs' and elevenlabs_voice_id is not null and cartesia_voice_id is null)
    or
    (provider = 'rime')
  );

create unique index if not exists voices_provider_name_uidx
  on public.voices (provider, name);

create unique index if not exists voices_cartesia_voice_id_uidx
  on public.voices (cartesia_voice_id)
  where provider = 'cartesia' and cartesia_voice_id is not null;

create unique index if not exists voices_elevenlabs_voice_id_uidx
  on public.voices (elevenlabs_voice_id)
  where provider = 'elevenlabs' and elevenlabs_voice_id is not null;
