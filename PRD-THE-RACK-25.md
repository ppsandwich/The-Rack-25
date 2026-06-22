# PRD: The Rack-25

## 1. Product Summary

**The Rack-25** is a browser-based instrument rack for quickly browsing, playing, and editing a curated set of synth and sample engines. The app is now a compact, dark, client-side React/Vite application with 17 selectable engines, local presets, computer keyboard input, MIDI input where available, and an on-screen piano keybed.

The current product direction has shifted from "25 in-house interpretations" to a smaller rack built around real open-source/browser audio engines where practical:

- `dx7-synth-js` for the DX-style FM engine.
- `webaudio-tinysynth` for Tiny GM.
- `smplr` for sampled piano, mallet, electric piano, and SoundFont playback.
- `Tone.js` for the remaining synth engines.

The app remains fully client-side and uses **zero API routes**.

---

## 2. Current Product Goals

Users should be able to:

1. Open the app in a modern browser and see the full instrument immediately.
2. Select from 17 engines.
3. Browse a large preset bank for each engine.
4. Play notes with:
   - On-screen piano keybed.
   - Computer keyboard.
   - MIDI keyboard or controller where Web MIDI is available.
5. Edit engine parameters with compact knob controls.
6. Save, recall, delete, import, and export user presets with localStorage.
7. Use the app on desktop and small screens without horizontal page overflow.
8. Understand open-source usage through a dedicated credits modal.

Project goals:

1. Keep the app deployable as a static Vite build.
2. Keep all audio and state client-side.
3. Prefer real third-party browser engines over in-house placeholder synths.
4. Maintain a compact, sophisticated dark UI using the existing warm palette.
5. Preserve useful end-to-end coverage for audio-start behavior, presets, layout, and mobile overflow.

---

## 3. Non-Goals

The current version does not include:

1. Cloud accounts or cloud preset sync.
2. Backend audio rendering.
3. API routes.
4. DAW plugin formats.
5. Multi-track sequencing.
6. User-uploaded audio sampling.
7. AI sound generation.
8. Multi-engine layering or split zones.
9. A marketplace or community preset sharing.
10. Full emulation of Roland, Yamaha, or other proprietary products.
11. Bundling commercial or unclear sample content.

---

## 4. Platform and Architecture

### 4.1 Stack

The implemented stack is:

- Vite.
- React.
- TypeScript.
- Vanilla CSS.
- Web Audio API.
- Tone.js.
- smplr.
- webaudio-tinysynth.
- Vendored `dx7-synth-js`.
- Playwright for end-to-end testing.

### 4.2 Deployment

The app must remain deployable as a static frontend application. MVP and current production architecture use **zero API routes**.

### 4.3 Storage

User presets are stored in browser localStorage under:

`rack25:userPresets:v1`

Imports and exports use JSON files. Imported presets must be validated against installed engine IDs before saving.

---

## 5. Current Engine List

The app currently includes exactly 17 selectable engines.

| Order | Engine | Engine Basis | Source / Dependency | Preset Count Target |
|---:|---|---|---|---:|
| 1 | DX Stack | 6-operator DX-style FM | Vendored `dx7-synth-js`; public online DX7 patch archive data | 128 |
| 2 | FM Bells | FM synth | Tone.js FMSynth | 24 |
| 3 | Tiny GM | General MIDI-style synthesis | webaudio-tinysynth | 128 |
| 4 | Warm Analog | Subtractive synth | Tone.js MonoSynth / PolySynth | 24 |
| 5 | Soft Poly | Poly subtractive synth | Tone.js PolySynth | 24 |
| 6 | Mono Furnace | Mono bass/lead synth | Tone.js MonoSynth | 24 |
| 7 | Classic OB | Vintage-style poly synth | Tone.js PolySynth / MonoSynth voices | 24 |
| 8 | Sampled Keys | Sampled piano, EP, mallet | smplr sampled instruments | 53 |
| 9 | SoundFont Rack | GM-style SoundFont playback | smplr Soundfont / FluidR3_GM-hosted samples | 128 |
| 10 | Chip Arcade | Chiptune-style synth | Tone.js Synth | 24 |
| 11 | Drum Synth Kit | Algorithmic drums | Tone.js MembraneSynth / NoiseSynth / MetalSynth | 24 |
| 12 | Karplus Pluck | Plucked string synthesis | Tone.js PluckSynth | 24 |
| 13 | Modal Mallets | Struck modal tones | Tone.js MetalSynth | 24 |
| 14 | Open Piano | Lightweight modelled piano-style synth | Tone.js PolySynth | 24 |
| 15 | Granular Cloud | Granular texture engine | Tone.js GrainPlayer with generated buffer | 24 |
| 16 | Formant Vox | Formant/vocal synth | Tone.js Synth and Filter nodes | 24 |
| 17 | Byte Crusher | Lo-fi digital synth | Tone.js Synth, BitCrusher, Distortion | 24 |

### 5.1 Removed Engines

The following earlier in-house/reference engines were removed from the app and should not appear in the UI or credits:

- Cartridge FM.
- Wavetable Drift.
- Surge Hybrid.
- Additive Lantern.
- Pad Weaver.
- Noise Harmonics.
- Vector Blend.
- Zen Rack.

### 5.2 Engine Ordering

The engine browser must list these first:

1. DX Stack.
2. FM Bells.
3. Tiny GM.

The remaining engines follow the current catalog order.

### 5.3 Engine Source Policy

Current policy is to avoid presenting reference-only or in-house placeholder engines as equivalent to real engine integrations. All visible engines should be backed by one of:

- Direct third-party dependency.
- Vendored open-source engine code.
- Tone.js engine primitives.
- smplr sample playback.
- webaudio-tinysynth.

---

## 6. Presets

### 6.1 Built-In Presets

Current preset expectations:

- DX Stack: 128 DX patches.
- Tiny GM: 128 GM-style patches.
- SoundFont Rack: 128 patches.
- Sampled Keys: 53 patches.
- Tone.js engines: 24 third-party-derived Tone preset mappings each.

DX Stack should load `E.PIANO 1` as its initial/default patch.

Preset buttons should show only the preset name. Author/source/tag metadata must not appear inside preset buttons.

### 6.2 User Presets

Users can:

- Save the current sound as a user preset.
- Recall user presets.
- Delete user presets.
- Export the current preset.
- Export all user presets.
- Import preset JSON.

User presets remain local to the browser.

### 6.3 Preset Schema

Presets include:

- `id`
- `schemaVersion`
- `engineId`
- `name`
- `author`
- `source`
- `tags`
- `parameters`
- `macros`
- optional source metadata

Macros remain in the preset data model for compatibility, but the visible macro slider strip has been removed from the UI.

---

## 7. User Interface

### 7.1 Visual Direction

The UI uses a compact dark theme while retaining the original warm palette:

- Dark charcoal/background.
- Walnut and brown panel surfaces.
- Honey and clay accents.
- Muted teal primary actions.
- Warm off-white text.

Typography:

- Headings use **IM Fell English**.
- Body and control text use **Merriweather**.

The app has a custom SVG icon:

- Displayed left of the title in the top bar.
- Used as the SVG favicon.

### 7.2 Top Bar

The top bar contains:

- App icon.
- App title: `The Rack-25`.
- Panic button.
- Settings button.
- Credits button.

The top bar no longer displays:

- Subtitle text.
- Active engine name.
- Active preset name.

### 7.3 Engine Browser

Engine buttons show:

- Engine name.
- Short description.

Engine buttons must not show the old metadata line such as:

`GM Style / Low CPU / poly`

The browser supports:

- Search.
- Tag filters: All, Bass, Lead, Pad, Keys, Percussion, Texture, Experimental.

### 7.4 Preset Browser

Preset buttons show only:

- Preset name.

Preset buttons must not show:

- Author.
- Credits.
- Tags.
- Source metadata.

Preset actions:

- Export current.
- Export all.
- Import.

### 7.5 Center Panel

The center panel contains:

- Current engine title.
- Save preset button.
- Parameter groups.

The previous macro slider strip above the engine title has been removed.

Parameter groups are generated from engine parameter schemas and currently use compact knob controls.

### 7.6 Keybed

The on-screen keybed should look like a real piano layout:

- Black notes sit above white notes, not inline.
- The middle visible note on the keybed is C3.
- The keybed supports click/touch and drag across keys.
- Active notes are highlighted.

Octave shift controls are placed below the keybed:

- `Oct -`
- Current octave display.
- `Oct +`

Octave shift affects both:

- On-screen keybed playback.
- Computer keyboard playback.

The footer must not overlap octave controls.

### 7.7 Computer Keyboard Mapping

The current computer keyboard mapping uses a chromatic row with `F` mapped to C3 at octave shift 0.

Important regression expectations:

- `F` plays C3 before octave shift.
- With octave shift +1, `F` plays C4/MIDI 60.
- `J` plays F, not F#.
- `U` plays F#.
- Octave shift affects computer keyboard playback.
- Keyboard input must not trigger while typing into text fields.

### 7.8 Mobile Layout

Small-screen layout is a supported experience, not just a fallback.

Requirements:

- No page-level horizontal overflow on iPhone-sized screens.
- The app must not require scrolling right to see the full UI.
- Engine and preset lists become compact horizontal rails.
- Header becomes a single compact row with icon/title and icon-only action buttons.
- Parameter controls become smaller and denser.
- Keybed and octave controls fit within viewport width.
- Major panels must use `min-width: 0` and width constraints to avoid Safari overflow.
- `html`, `body`, `#root`, and `.app` must prevent horizontal page overflow.

Current tested mobile widths:

- 390px wide viewport.
- 430px wide viewport.

---

## 8. Audio Features

### 8.1 Audio Initialization

The app should not show a startup or "wake" modal. The full instrument UI should be visible immediately on load.

The audio graph and selected default engine should initialize on load. Because browsers may suspend audio until user interaction, note/key interactions should attempt to resume the audio context before playing.

There should be no `Start playing` button in normal app flow.

### 8.2 Global Effects and Settings

Settings include:

- Tone.
- Chorus.
- Delay.
- Delay time.
- Delay feedback.
- Reverb.
- Reverb size.
- Master volume.

The settings modal remains compact and usable on small screens.

### 8.3 Panic

The Panic button stops all active voices and clears active note state.

### 8.4 Safety

All engines should avoid unsafe output levels. Switching engines should stop active notes.

---

## 9. Credits and Licensing

The app includes an Open Source Credits modal.

Credits should list visible engines and their actual source projects. Since the reference-only engines were removed, they should not appear as app engines or credit cards.

Current visible source projects include:

- DX7 Synth JS.
- Tone.js.
- WebAudio TinySynth.
- smplr sampled instruments.
- smplr Soundfont.

The app must continue to avoid bundling unclear commercial/proprietary content. Source preset/sample metadata should remain in data where useful, but visible preset buttons should stay clean.

---

## 10. Acceptance Criteria

### 10.1 Functional

1. App boots and shows exactly 17 engines.
2. First three engines are DX Stack, FM Bells, Tiny GM.
3. Every engine can be selected.
4. Every engine exposes presets.
5. Every engine exposes editable controls.
6. Every engine starts one or more audio nodes when played.
7. DX Stack exposes algorithms 1 through 32.
8. DX Stack defaults to E.PIANO 1.
9. Tiny GM has 128 presets.
10. SoundFont Rack has 128 presets.
11. Sampled Keys has 53 presets.
12. Tone.js engines have 24 presets each.
13. Preset save, recall, delete, import, and export work.
14. Settings modal works.
15. Credits modal shows 17 visible engine credit entries.
16. Panic clears active notes.

### 10.2 UI

1. Top bar shows icon and title.
2. Favicon points to the same app icon.
3. Top bar does not show active preset or active engine.
4. Engine buttons do not show CPU/family/play-mode metadata.
5. Preset buttons do not show author/source/tag metadata.
6. Macro slider strip is not visible.
7. Piano keybed shows black keys above white keys.
8. Octave controls are below the keybed and not overlapped by the footer.
9. Mobile layout has no page-level horizontal overflow at 390px and 430px widths.

### 10.3 Keyboard and Keybed

1. Middle keybed note is C3.
2. `F` key plays C3 at octave 0.
3. Octave +1 makes `F` play MIDI 60.
4. `J` plays F, not F#.
5. Dragging across the keybed triggers multiple notes.
6. Octave shift affects computer keyboard and on-screen keybed playback.

### 10.4 Architecture

1. Build is static and client-side.
2. No API routes are required.
3. Engine data and presets are bundled or loaded client-side.
4. User presets use localStorage.
5. Third-party engines are lazy-loaded where implemented that way.

---

## 11. Verification

Current required verification command:

```bash
npm run build && npm run test:e2e
```

The Playwright suite should cover:

- Boot and engine list count.
- Engine switching.
- Preset counts by engine family.
- DX Stack algorithm range.
- Audio node start behavior.
- Preset save/recall/delete/import/export.
- Settings and credits modals.
- Keyboard mapping.
- Keybed click and drag behavior.
- Octave shift behavior.
- Footer/keybed non-overlap.
- Header icon and favicon.
- Mobile compact layout and horizontal overflow checks.

Current expected result:

- 4 Playwright tests passing.

---

## 12. Future Considerations

Potential future work:

1. Add a collapsible/advanced parameter mode to reduce mobile scrolling further.
2. Add MIDI device selection and richer MIDI CC mapping.
3. Add favorites or preset tagging UI.
4. Add optional keybed hide/show.
5. Add better source attribution for individual imported preset banks.
6. Add more direct engine integrations only when they are browser-safe and licence-compatible.
7. Add visual meters or lightweight oscilloscope if it does not compromise mobile layout.

Any future engine expansion should preserve the current standard: visible engines should be backed by real browser-compatible third-party engines or clearly documented app-owned implementations, with licensing and credits kept accurate.
