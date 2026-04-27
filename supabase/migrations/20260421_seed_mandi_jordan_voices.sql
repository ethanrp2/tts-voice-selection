-- Seed Mandi & Jordan voices (Cartesia + ElevenLabs).
-- created_at is set BEFORE the oldest existing voice (2026-04-01) so these
-- sort to the top of any chronological listing — i.e. prepended, not appended.
--
-- Idempotent via ON CONFLICT (provider, name) DO NOTHING.

INSERT INTO public.voices (name, provider, cartesia_voice_id, elevenlabs_voice_id, active, flag_count, match_count, elo_rating, created_at)
VALUES
  ('mandi',     'cartesia',   'baa05162-4492-455e-8258-c7562ab46a1f', NULL, true, 0, 0, 1500, '2026-03-31T00:00:00Z'),
  ('mandi_cx',  'cartesia',   '30f5bfe1-db64-4c9a-83d2-6e72aa3a3c84', NULL, true, 0, 0, 1500, '2026-03-31T00:00:01Z'),
  ('jordan',    'cartesia',   '5b00ef47-6e48-49b3-ab6b-7ea55ffcb7ce', NULL, true, 0, 0, 1500, '2026-03-31T00:00:02Z'),
  ('jordan_cx', 'cartesia',   '43e12bc4-2495-4605-90cd-8348e07a2f3c', NULL, true, 0, 0, 1500, '2026-03-31T00:00:03Z'),
  ('mandi',     'elevenlabs', NULL, 'QPzE4mhWdjtILnYSFWfR', true, 0, 0, 1500, '2026-03-31T00:00:04Z'),
  ('mandi_cx',  'elevenlabs', NULL, 'sFacRowovPlDU9CDDej7', true, 0, 0, 1500, '2026-03-31T00:00:05Z'),
  ('jordan',    'elevenlabs', NULL, 'NaFoIHM0mngMOebLkkxk', true, 0, 0, 1500, '2026-03-31T00:00:06Z'),
  ('jordan_cx', 'elevenlabs', NULL, 'NoaWcPwWLhCDoVaVpx5m', true, 0, 0, 1500, '2026-03-31T00:00:07Z')
ON CONFLICT (provider, name) DO NOTHING;
