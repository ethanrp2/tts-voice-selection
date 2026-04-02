This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Reset App State

To reset the app data back to baseline in Supabase (delete all `votes` and reset all `elo_ratings` to default), run:

```bash
pnpm reset:app-state
```

It will print a small before/after summary so you can confirm the reset happened.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Set these Environment Variables in Vercel for both `Preview` and `Production` before deploying:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CARTESIA_API_KEY`
- `RIME_API_KEY`
- `ELEVENLABS_API_KEY`

Important:
- `NEXT_PUBLIC_*` values are inlined at build time, so changing them requires a redeploy.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` as a `NEXT_PUBLIC_*` variable.
- Voice synthesis is provider-aware (`cartesia` / `rime` / `elevenlabs`) based on each row in `voices`.
- ElevenLabs sync needs API key permissions: `models_read`, `voices_read`, and text-to-speech access.
- Apply `supabase/migrations/20260401_add_rime_speaker_column.sql` when you want dedicated `rime_speaker` storage.
- Use `.env.example` as the canonical variable list.

## ElevenLabs Voice Sync

1. Apply `supabase/migrations/20260401_add_elevenlabs_voice_support.sql`.
2. Ensure `ELEVENLABS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SUPABASE_URL` are set.
3. Run:

```bash
pnpm sync:elevenlabs-voices
```

The script validates API permissions, resolves requested names to voice IDs, probes each resolved voice with TTS, upserts valid voices into `voices`, upserts baseline ELO rows, and writes a report to `reports/elevenlabs-voice-sync-report.json`.

## Cartesia Voice Sync

Ensure `CARTESIA_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SUPABASE_URL` are set, then run:

```bash
pnpm sync:cartesia-voices
```

The script:
- Fetches the full Cartesia voice catalog with pagination (`starting_after`).
- Resolves requested names using exact normalized base-name match (e.g. `"Brooke - Big Sister"` resolves to `Brooke`).
- Probes each resolved voice via Cartesia TTS (`sonic-3`) and only upserts probe-passing voices.
- Upserts baseline ELO rows for inserted/updated voices.
- Deactivates obsolete Cartesia rows (`active=false`) that are not in the verified target set.
- Leaves non-Cartesia providers unchanged.
- Writes a report to `reports/cartesia-voice-sync-report.json`, including missing requested names that were skipped.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
