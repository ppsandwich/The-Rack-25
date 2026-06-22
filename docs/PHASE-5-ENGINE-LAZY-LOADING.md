# Phase 5: Engine Lazy Loading

Date: 2026-06-22

## Decision

Lazy-load the actual third-party engine wrappers instead of importing them from the main audio host bundle.

This keeps the real engine work from phases 1 to 3 while reducing the initial app payload.

## Implemented

- `Dx7RackEngine` is loaded only when `DX Stack` or `Cartridge FM` is selected.
- `TinyGmRackEngine` is loaded only when `Tiny GM` is selected.
- `ToneRackEngine` is loaded only when `Warm Analog`, `FM Bells`, or `Drum Synth Kit` is selected.
- `RackAudio` now guards asynchronous engine loading with a load token so a stale import cannot attach after the user
  switches to another engine.
- Delayed notes are cancelled if the key is released before the lazy engine chunk finishes loading.

## Build Result

Before this phase, the main production JS chunk was about 556 kB minified.

After this phase:

- Main app chunk: about 245 kB minified.
- Tone engine chunk: about 254 kB minified.
- Tiny GM engine chunk: about 43 kB minified.
- DX7 engine chunk: about 15 kB minified.

The production build no longer emits the large chunk warning.

## Verification

- `npm run build`
- `npm run test:e2e`
