# The Rack-25

The Rack-25 is a compact browser instrument rack built with Vite, React, TypeScript, Web Audio, Tone.js, smplr, webaudio-tinysynth, and a vendored DX7-style engine.

It runs entirely client-side: no accounts, no backend, no API routes.

## Features

- 17 selectable synth and sample engines.
- Real third-party/browser audio engines where practical.
- Built-in preset banks, including DX Stack, Tiny GM, SoundFont Rack, sampled keys, and Tone.js-derived presets.
- Local user presets with save, recall, delete, import, and export.
- On-screen piano keybed with black keys over white keys.
- Click/touch and drag-across-keybed playback.
- Computer keyboard playback.
- Octave shift for keybed and computer keyboard.
- Web MIDI support where the browser exposes Web MIDI.
- Global effects/settings modal.
- Open source credits modal.
- Compact dark UI using IM Fell English for headings and Merriweather for body text.
- Mobile layout designed to avoid page-level horizontal overflow on iPhone-sized screens.

## Engines

Current engine order:

1. DX Stack
2. FM Bells
3. Tiny GM
4. Warm Analog
5. Soft Poly
6. Mono Furnace
7. Classic OB
8. Sampled Keys
9. SoundFont Rack
10. Chip Arcade
11. Drum Synth Kit
12. Karplus Pluck
13. Modal Mallets
14. Open Piano
15. Granular Cloud
16. Formant Vox
17. Byte Crusher

Primary engine sources:

- `dx7-synth-js` for DX Stack.
- `webaudio-tinysynth` for Tiny GM.
- `smplr` for Sampled Keys and SoundFont Rack.
- `Tone.js` for FM Bells and the remaining synth engines.

## Presets

Preset expectations:

- DX Stack: 128 patches, defaulting to `E.PIANO 1`.
- Warm Analog: defaults to `Cool Guy Warm Analog`.
- Tiny GM: 128 presets.
- SoundFont Rack: 128 presets.
- Sampled Keys: 53 presets.
- Tone.js engines: 24 presets each.

User presets are stored in localStorage under:

```text
rack25:userPresets:v1
```

## Keyboard

Computer keyboard playback uses a chromatic row. Important mappings:

- `F` plays C3 at octave 0.
- `J` plays F.
- `U` plays F#.
- Octave controls affect both computer keyboard playback and the on-screen keybed.

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run Playwright e2e tests:

```bash
npm run test:e2e
```

The dev server binds to all interfaces because the script uses:

```bash
vite --host 0.0.0.0
```

## Testing

The Playwright suite covers:

- Boot and engine count.
- Engine ordering.
- Preset counts.
- DX Stack algorithm range.
- Default preset behavior.
- Audio-start behavior for every engine.
- Preset save, recall, delete, import, and export.
- Settings and credits modals.
- Computer keyboard mapping.
- Keybed click and drag behavior.
- Octave shift behavior.
- Footer/keybed layout.
- Header icon and favicon.
- Mobile compact layout and horizontal overflow checks.

Current verification command:

```bash
npm run build && npm run test:e2e
```

## Project Structure

```text
src/
  audio/       Audio engine wrappers and shared RackAudio routing
  data/        Engine catalog and built-in preset banks
  storage/     localStorage preset helpers
  types.ts     Shared TypeScript types
  main.tsx     Main React app
  styles.css   App styling and responsive layout
public/
  rack-25-icon.svg
tests/
  rack25.spec.ts
```

## Deployment

The app is a static Vite frontend and is suitable for static hosting, including Vercel Hobby. It should not require API routes or serverless functions.

## Notes

- Browsers may suspend audio until the first user interaction. The app renders immediately and attempts to resume audio when the user plays a note.
- Web MIDI availability depends on browser, platform, secure context, and permissions.
- On iOS, Chrome uses WebKit and may not expose Web MIDI.

## Product Spec

See [PRD-THE-RACK-25.md](./PRD-THE-RACK-25.md) for the current product requirements and acceptance criteria.
