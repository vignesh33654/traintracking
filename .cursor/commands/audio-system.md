# Audio System

## Introduction

Handles sound playback with support for rapid, overlapping sounds via an audio pool pattern.

## Getting Started

```tsx
const { play, stop } = useSound('/sounds/click.mp3');
play(); // triggers sound
```

## Core Concepts

**Audio Pool** — Single `Audio` element cannot overlap. Pool pre-loads N elements, cycles through them.

**Volume State** — Managed via Zustand store, persisted to localStorage.

## Files

| File | Purpose |
|------|---------|
| `app/config/audio.config.ts` | Constants |
| `app/hooks/useSound.ts` | Pool management |
| `app/stores/useAudioStore.ts` | Volume state |

## Examples

```tsx
// Basic usage
const { play } = useSound(SOUND_PATHS.SCROLL);
play();


## Edge Cases

- **First render** — Skip play to avoid browser autoplay block
- **Volume 0** — Early return, no audio element touched
- **Pool exhausted** — Cycles back to first element (may cut off oldest sound)
- **Audio load fail** — Logged in dev only, silent in prod