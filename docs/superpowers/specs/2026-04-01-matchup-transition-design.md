# Matchup Transition — Fade-Through + Toast

## Context

Users report confusion when all three vote selections (Empathy, Authority, Energy) are made and a new matchup loads. The swap is currently instantaneous with no visual indicator, so users don't realize the matchup changed (primary confusion) and sometimes aren't sure their vote was submitted (secondary confusion). The same confusion applies when a "Bad Voice" flag triggers a new matchup.

## Design

### Approach: Fade-Through with Confirmation Toast

A single animation path used for both triggers (vote completion and voice flagging), with parameterized toast content.

### Triggers

1. **All 3 votes cast** — the 3rd vote selection triggers the transition
2. **Bad voice flagged** — pressing the flag button triggers the transition

### Animation Flow

| Step | Duration | What Happens |
|------|----------|-------------- |
| 1. Trigger | 0ms | Audio playback stops immediately |
| 2. Flag flash (flag only) | ~150ms | Flagged card border briefly flashes red (`#ff716c`) |
| 3. Fade out | ~200ms | Main content area (phrase, voice cards, vote rows) transitions `opacity: 1 → 0` |
| 4. Data swap | During fade | Fetch new matchup, reset votes, update state (already happens async) |
| 5. Toast appears | At fade midpoint | Pill slides down from top of content area |
| 6. Fade in | ~300ms | New content fades in `opacity: 0 → 1` |
| 7. Toast dismisses | ~1.5s after appearing | Toast fades out |

**Total perceived transition: ~500ms** (toast lingers independently).

### Toast Content

| Trigger | Text | Accent |
|---------|------|--------|
| Vote completion | "Vote recorded ✓ — New matchup" | Default app styling (white on dark) |
| Bad voice flag | "Voice flagged ⚑ — New matchup" | Red accent (`#ff716c`, already in palette) |

### Toast Styling

- Positioned at top-center of the main content area
- Pill shape with the app's existing glassmorphism style (`bg-[#131313]/70 backdrop-blur-xl`)
- Small, non-intrusive — does not block interaction
- Auto-dismisses after ~1.5s with a fade-out

### Flag-Specific Addition

When a voice is flagged, the flagged card's border briefly flashes red (~150ms) **before** the fade-out begins. This gives instant "your flag was received" feedback tied to the specific card.

### What Does NOT Change

- The Header and BottomNav remain static — only the main content area participates in the fade
- Audio prefetch behavior remains the same (prefetch during/after fade)
- The fire-and-forget vote/flag submission pattern stays unchanged
- No new buttons, modals, or user actions introduced

### Implementation Notes

- Use CSS transitions on opacity for the fade (no JS animation libraries needed)
- A `transitioning` state variable controls the fade class
- Toast is a lightweight component rendered conditionally with its own fade timeout
- The flag border flash uses a temporary CSS class removed after 150ms
- All timings use existing Tailwind `transition-all` / `duration-*` utilities where possible

## Files to Modify

- `app/page.tsx` — add transition state, toast rendering, fade wrapper, flag flash logic

## Verification

1. Complete all 3 votes → content fades out/in, toast shows "Vote recorded ✓ — New matchup"
2. Flag a bad voice → card border flashes red, content fades out/in, toast shows "Voice flagged ⚑ — New matchup"
3. Toast auto-dismisses after ~1.5s
4. New matchup data (voices + phrase) is different after transition
5. Audio from previous matchup stops on transition
6. Rapid successive votes don't cause overlapping transitions
7. Works on mobile viewport sizes
