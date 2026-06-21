# PRD: The Rack-25

## 1. Product Summary

**The Rack-25** is a browser-based synthesizer inspired by Roland ZENOLOGY Pro’s “many sounds in one approachable instrument” model, but built for the web, with 25 selectable synth engines sourced from open-source projects, open-source synthesis techniques, and permissively licensed browser-audio implementations.

The app should feel like a warm, friendly rack of instruments rather than a stern audio engineering exam. It should be powerful enough for musicians and sound tinkerers, but casual enough that someone can load it, press a key, turn a knob, and immediately make something charming, weird, lush, rude, glassy, wobbly, or enormous.

The app must run on **Vercel Hobby** and must use **no more than 12 API routes/serverless functions**. The required MVP architecture is **zero API routes**, with all synthesis, presets, MIDI input, keyboard input, and local preset storage handled client-side.

---

## 2. Core Goals

### 2.1 User Goals

Users should be able to:

1. Open the app in a modern browser and immediately play a synth.
2. Switch between 25 different sound engines.
3. Play notes using:
   - On-screen piano keybed.
   - Computer keyboard.
   - MIDI keyboard or controller, where browser support allows.
4. Adjust relevant engine parameters through visible knobs and controls.
5. Browse built-in presets for each engine.
6. Save and recall their own presets using browser localStorage.
7. Understand what each engine is for without reading a manual that feels like it was written by a haunted Eurorack module.
8. Use the app entirely without logging in.
9. Use the app on desktop and tablet-sized browsers, with mobile support as a secondary goal.

### 2.2 Business / Project Goals

1. Create a polished portfolio-quality web app.
2. Demonstrate browser audio, MIDI handling, state management, and local persistence.
3. Stay deployable on Vercel Hobby.
4. Avoid backend complexity.
5. Avoid proprietary or unclear licensing risk.
6. Build a maintainable framework where new engines could be added later.

---

## 3. Non-Goals

The first version will not include:

1. Cloud accounts.
2. Cloud preset sync.
3. Audio recording/export.
4. DAW plugin formats such as VST, AU, or CLAP.
5. Multi-track sequencing.
6. Full Roland ZEN-Core compatibility.
7. Importing Roland presets.
8. Sampling from user-uploaded audio.
9. AI sound generation.
10. Server-side audio rendering.
11. Marketplace/community preset sharing.
12. Mobile app packaging.
13. More than one active engine at a time.
14. Multi-engine layering or split-keyboard zones.

These may be considered future improvements, but they are not part of the MVP.

### 3.1 MVP Interpretation Rules

The MVP must prioritise a working, polished, browser-native instrument over perfect emulation of every source project.

For MVP, each of the 25 engines may be implemented as a **Rack-25-native interpretation** of the listed synthesis method and source project, provided it meets the following requirements:

1. It produces audible results that match the intended sound family.
2. It exposes a meaningful parameter set for that synthesis method.
3. It includes at least 8 built-in presets.
4. It follows the shared engine interface.
5. It includes source metadata and licence status.
6. It does not directly copy code, presets, or samples from a source unless licence-cleared.
7. It runs fully client-side.
8. It does not require an API route.
9. It does not require users to install anything.
10. It does not crash or produce unsafe volume spikes.

The app should not block MVP completion because a large external synth cannot be ported faithfully. If a listed source is unsuitable for direct use, build a simplified native engine based on the synthesis family and document the original source as `reference-only`.

### 3.2 Source Licence Fallback Rules

If an engine’s listed source project has unclear, restrictive, incompatible, or time-consuming licensing, the agent must not pause the build. Instead, apply this fallback hierarchy:

1. **Use direct dependency** only if licence and browser compatibility are clearly acceptable.
2. **Use adapted implementation** if the technique can be implemented safely without copying protected code or content.
3. **Use reference-only** if the project is GPL, has unclear preset/sample rights, is too large, or is not practical for browser use.
4. **Replace source reference** only if the original source is unusable even as a reference.

For MVP, GPL-family projects should default to `reference-only` unless the project owner explicitly chooses a GPL-compatible app licence.

No Yamaha DX7 cartridges, Roland presets, commercial sample packs, or trademarked patch names may be bundled unless rights are verified. When uncertain, create original Rack-25 presets.

### 3.3 WASM Scope

WASM is optional for MVP.

The coding agent should prefer TypeScript, Web Audio API, AudioWorklet, and Tone.js-style browser-native implementations first.

Use WASM only when all of the following are true:

1. The WASM source has a compatible licence.
2. Bundle size remains acceptable.
3. The engine can be lazy-loaded.
4. It does not require server-side compilation at runtime.
5. It does not introduce build/deployment instability on Vercel Hobby.
6. The app still works if that engine fails to load.

If WASM creates significant build complexity, implement a simpler Web Audio version for MVP and mark the source as `wasm-candidate/future`.

### 3.4 API Route Rule

MVP must use **zero API routes**.

The “maximum 12 API routes” constraint is a hard upper bound for future expansion, not permission to add backend functionality during MVP.

The coding agent must not create:

1. API routes for synthesis.
2. API routes for preset saving.
3. API routes for licence metadata.
4. API routes for MIDI.
5. API routes for sample processing.
6. API routes for analytics.
7. API routes for user accounts.

All MVP data must be:

- Bundled as static app data.
- Stored in localStorage.
- Loaded from static public assets.
- Generated client-side.

If the implementation framework creates serverless functions implicitly, this must be avoided or documented.

---

## 4. Product Principles

### 4.1 Warm, Casual, Approachable

The Rack-25 should feel like an inviting instrument wall in a cosy studio. It should avoid the typical cold black-and-neon “serious synth person in a basement at 2:17am” interface.

Design should use:

- Warm off-white, honey, clay, walnut, soft charcoal, faded orange, and muted teal tones.
- Rounded rack panels.
- Large friendly knobs.
- Clear labels.
- Helpful microcopy.
- Gentle animation.
- Tactile shadows and subtle texture.
- A sense of playful craft without becoming toy-like.

### 4.2 One Screen, One Instrument

The user should not need to bounce between five tabs just to make a brass pad go “bwoooom”. The main playing experience should fit into a single primary screen:

- Engine selector.
- Preset selector.
- Parameter controls.
- Piano keybed.
- MIDI/computer keyboard status.
- Save/recall controls.

### 4.3 Engine Differences Should Be Real

The 25 engines should not be 25 skins over the same oscillator. They should cover meaningfully different synthesis approaches and sound families.

### 4.4 Client-Side First

All audio work should run in the browser using Web Audio, AudioWorklet where appropriate, WASM only where practical, and static assets. The app should not depend on backend processing.

---

## 5. Target Users

### 5.1 Primary User: Curious Music Maker

A person who likes synths, makes music casually or semi-seriously, and wants an easy browser instrument for quick ideas.

Needs:

- Fast loading.
- Immediate sound.
- Presets.
- MIDI support.
- Simple controls.
- Broad sound range.

### 5.2 Secondary User: Sound Explorer

A person who may not know synthesis deeply but enjoys turning knobs and discovering odd noises.

Needs:

- Friendly labels.
- Clear engine descriptions.
- Undo/reset to preset.
- Built-in keyboard.
- No requirement for hardware.

### 5.3 Tertiary User: Developer / Portfolio Reviewer

Someone evaluating the app as a technical project.

Needs:

- Clean architecture.
- Obvious technical polish.
- Sensible use of open-source projects.
- Good performance.
- Clear limitations.

---

## 6. Platform Requirements

### 6.1 Deployment

The app must be deployable to **Vercel Hobby**.

### 6.2 API Route Limit

The app must contain **zero API routes for MVP** and never more than 12 API routes/serverless functions in future versions.

### 6.3 Recommended Stack

Preferred stack:

- Next.js App Router or Vite + React.
- TypeScript.
- Web Audio API.
- AudioWorklet for custom DSP where useful.
- Tone.js where it simplifies polyphony, scheduling, envelopes, effects, and synth primitives.
- Optional WASM modules only if they are small, browser-safe, and licensing is clear.
- Zustand or similar lightweight state management.
- localStorage for user presets.
- CSS Modules, Tailwind, or vanilla CSS with design tokens.

The simplest deployable path is:

- Next.js static-first app.
- Avoid `getServerSideProps`.
- Avoid unnecessary API routes.
- Avoid large serverless bundles.
- Keep all engine code client-side.

### 6.4 Reference Browser and Compatibility Priority

The reference browser for MVP is:

1. **Chrome desktop, latest stable** — primary target.
2. **Edge desktop, latest stable** — secondary target.
3. **Safari desktop, latest stable** — must support non-MIDI playback.
4. **Firefox desktop, latest stable** — must support non-MIDI playback.

MIDI support is required only where Web MIDI is available and permitted by the browser.

The app must remain fully usable without MIDI in all supported browsers through:

- On-screen piano keybed.
- Computer keyboard input.
- Preset browsing.
- Parameter editing.

### 6.5 Responsive Layout Requirements

Desktop is the primary experience.

#### Desktop, width 1024px and above

Use a full rack layout:

- Header across top.
- Engine/preset browser on left or top.
- Parameter rack in the centre.
- Macro strip above or below main controls.
- Piano keybed fixed near bottom.
- Status/footer at bottom.

#### Tablet, width 768px–1023px

Use a stacked rack layout:

- Header.
- Engine/preset controls.
- Macro strip.
- Parameter groups as collapsible panels.
- Piano keybed remains visible by default but may be shorter.

#### Mobile, below 768px

Mobile is supported but not optimised for deep sound design.

Requirements:

- App must load.
- User can select engine.
- User can select preset.
- User can play on a simplified keybed.
- User can hide/show keybed.
- User can edit macro controls.
- Detailed parameter rack may appear as collapsible groups.
- MIDI may be unavailable or awkward; this is acceptable.

Mobile does not need to show every advanced control at once.

---

## 7. Open-Source Engine Sourcing Strategy

### 7.1 Definition of “Sourced From Open-Source Projects”

Each engine must be based on at least one of the following:

1. Directly using an open-source browser audio library.
2. Porting a permissively licensed open-source synth technique.
3. Implementing a synthesis model described by an open-source project.
4. Using an open-source project as a reference implementation, without copying incompatible code.
5. Using open-source sample/instrument sets only where licensing allows redistribution or loading.

### 7.2 Licensing Rules

Before implementation, every engine source must be reviewed for:

- License type.
- Compatibility with web distribution.
- Whether source code must be disclosed.
- Whether preset/sample content can be bundled.
- Attribution requirements.
- Whether commercial use is allowed.
- Whether generated audio has restrictions.

The app must include an **Open Source Credits** screen listing:

- Engine name.
- Source project(s).
- License.
- Attribution text.
- Link to source.
- Notes about whether code was directly used, adapted, or only referenced.

### 7.3 License Risk Handling

If a source project has a restrictive or unclear license:

- Do not directly copy code.
- Do not bundle presets or samples.
- Use it only as inspiration for a clean-room implementation, if legally acceptable.
- Replace it with another source if ambiguity remains.

### 7.4 Preset Handling

Built-in presets should be included only when:

1. The source project provides presets.
2. The preset license allows redistribution.
3. Presets are technically compatible with the web engine.
4. Attribution is preserved.

If a source engine has no usable presets, The Rack-25 must include original starter presets created for that engine.

---

## 8. The 25 Engines: Researched Source Modules

The Rack-25 must include exactly 25 selectable engines in MVP.

Each engine must be based on a researched open-source synth, browser-audio module, DSP library, or synthesis project. The implementation should not blindly copy source code. Each engine must be classified as one of:

- **Direct dependency**: suitable to use directly in the browser, subject to final licence review.
- **Adapted implementation**: suitable to implement using the same broad DSP technique or public API pattern.
- **Reference-only**: useful as design inspiration, but source code should not be embedded unless the app’s licence strategy supports it.
- **WASM candidate**: could be compiled or loaded as WebAssembly if bundle size, performance, and licence constraints are acceptable.

For Vercel Hobby, the preferred approach remains **client-side engine modules with zero API routes**. Do not create API routes per engine. Do not render audio server-side.

### 8.1 Engine Source Matrix

| # | Rack-25 Engine | Synthesis Method | Source Module / Project | Licence / Risk | Implementation Strategy | Why It Belongs |
|---:|---|---|---|---|---|---|
| 1 | Warm Analog | Subtractive / virtual analogue | Tone.js MonoSynth / PolySynth | Likely safe direct web dependency after licence check | Direct dependency or adapted implementation | Bread-and-butter basses, leads, plucks, and pads. This is the dependable ham sandwich of the rack. |
| 2 | Soft Poly | Polyphonic subtractive | Helm | GPL-3.0; reference-only unless app licence supports GPL | Reference-only | Good model for approachable polyphonic subtractive synthesis with modulation. |
| 3 | Mono Furnace | Monophonic subtractive bass | Monique Mono-Synth | Dual GPL/MIT noted; final file-level licence review required | Adapted implementation if MIT-covered portions are usable; otherwise reference-only | Gives the rack a dedicated mono bass/lead engine with glide and aggressive tone shaping. |
| 4 | Classic OB | Vintage analogue / SEM-style subtractive | OB-Xd / OB-Xf | GPL-family and version-specific licensing complexity | Reference-only | Adds wide vintage pads, brass, and slow filter movement inspired by classic analogue polysynths. |
| 5 | FM Bells | 2–4 operator FM | Tone.js FMSynth | Likely safe direct web dependency after licence check | Direct dependency or adapted implementation | Simple FM for bells, glass, electric piano-ish sounds, and polite metallic nonsense. |
| 6 | DX Stack | 6-operator FM | WebDX7 | MIT-licensed web/WASM project, final review required | WASM candidate or adapted implementation | Adds more serious DX-style FM without inventing a six-operator synth from scratch. |
| 7 | Cartridge FM | DX7-style FM preset architecture | Dexed | GPL-3.0; reference-only unless app licence supports GPL | Reference-only | Useful for FM architecture, parameter naming, and preset design; do not bundle Yamaha/DX7 ROM content. |
| 8 | Wavetable Drift | Wavetable synthesis | Vital | GPL-3.0 and preset/content restrictions; reference-only | Reference-only / clean-room implementation | Strong reference for modern wavetable movement, spectral shaping, and macro-led sound design. |
| 9 | Surge Hybrid | Hybrid subtractive / wavetable / FM / physical modelling | Surge XT | Open-source but licence compatibility must be reviewed before direct use | Reference-only or carefully scoped adapted implementation | Excellent model for a broad “workhorse” engine with multiple oscillator types and flexible modulation. |
| 10 | Additive Lantern | Additive synthesis | ZynAddSubFX AddSynth | GPL-2.0-or-later; reference-only unless compatible | Reference-only / adapted implementation | Gives the rack harmonic partial stacks, organ-ish tones, glass pads, and evolving spectra. |
| 11 | Pad Weaver | PAD / Fourier-style pad synthesis | ZynAddSubFX PADsynth | GPL-2.0-or-later; reference-only unless compatible | Reference-only / clean implementation | Adds lush, evolving, choir-like and string-like pad textures. |
| 12 | Noise Harmonics | Subtractive from filtered noise bands | ZynAddSubFX SubSynth | GPL-2.0-or-later; reference-only unless compatible | Reference-only / adapted implementation | Useful for breathy, windy, bowed, synthetic reed, and spectral-noise instruments. |
| 13 | Sampled Keys | Sample playback | WebAudioFont | Browser-focused sample technology; final sample licence review required | Direct dependency if sample licences allow; otherwise adapted loader | Gives users immediate piano, EP, organ, strings, and familiar instrument sounds. |
| 14 | SoundFont Rack | SoundFont / rendered sample instruments | soundfont-player / smplr-style browser playback | Archived or dependent on sample pack licences; review required | Adapted implementation | Useful fallback for General MIDI-ish playable instruments without huge synthesis code. |
| 15 | Tiny GM | Lightweight General MIDI-style synth | WebAudio TinySynth | Open-source browser synth; final licence review required | Direct dependency or adapted implementation | Adds cheap, cheerful, instantly recognisable instrument-ish tones. Excellent for “browser toy, but in a good way”. |
| 16 | Chip Arcade | Pulse / triangle / noise chip synthesis | Open-source Web Audio chiptune examples + Web Audio primitives | Prefer clean implementation | Adapted implementation | Provides 8-bit leads, arps, square basses, noise percussion, and tiny heroic theme tunes. |
| 17 | Drum Synth Kit | Algorithmic percussion synthesis | Tone.js MembraneSynth / MetalSynth / NoiseSynth | Likely safe direct web dependency after licence check | Direct dependency or adapted implementation | Adds kick, snare, hats, toms, metallic hits, and keyboard-mapped percussion. |
| 18 | Karplus Pluck | Physical modelling / Karplus-Strong | Faust physical modelling examples | Some examples declare MIT; verify per file | WASM candidate or adapted implementation | Adds plucked strings, harp, koto-ish sounds, rubber-band basses, and resonant twangs. |
| 19 | Modal Mallets | Modal synthesis / resonator bank | Faust physical modelling library / STK-style models | Verify Faust/STK example licences | WASM candidate or adapted implementation | Adds marimba, kalimba, bowls, struck bars, and woody percussion. |
| 20 | Open Piano | Physical-modelled piano | OpenPiano | Licence review required | Reference-only / adapted implementation | Useful for lightweight modelled piano behaviour without shipping massive sample libraries. |
| 21 | Granular Cloud | Granular synthesis | Web Audio Granular Synthesiser / GRNLR / Oi Grandad references | Mixed licences; GRNLR GPL-3.0; review required | Clean-room adapted implementation | Adds clouds, sprays, textures, frozen tones, and ambient smearing. No upload required for MVP; use generated buffers. |
| 22 | Formant Vox | Formant / vocal filter-bank synthesis | Faust / open formant synthesis examples | Verify per source | Adapted implementation | Adds vowel pads, robot choir, talking leads, and synthetic “aa-ee-oo” movement. |
| 23 | Byte Crusher | Digital degradation / bitcrushed oscillator | Web Audio custom DSP / Elementary Audio | Elementary is MIT; final review required | Direct dependency or custom AudioWorklet | Adds crunchy, broken-toy, lo-fi, aliased, sample-rate-reduced sounds. The app needs at least one engine that sounds like it fell down the stairs. |
| 24 | Vector Blend | Vector synthesis / four-source crossfade | Web Audio oscillator/sample blending; inspired by open vector synth patterns | Prefer clean implementation | Adapted implementation | Adds joystick-style blending between four sources for evolving pads and hybrid keys. |
| 25 | Zen Rack | Macro hybrid synth | Surge XT, Vital, Tone.js, ZynAddSubFX as combined references | Reference-only / app-owned implementation | Clean implementation using app-owned architecture | The flagship “inspired by ZENOLOGY Pro, but absolutely not pretending to be Roland” engine. Broad, macro-led, accessible, and preset-friendly. |

### 8.2 Required Diversity Coverage

The 25 engines must collectively cover at least the following synthesis families:

1. Subtractive synthesis.
2. Virtual analogue poly synthesis.
3. Monophonic analogue bass synthesis.
4. FM synthesis.
5. Six-operator DX-style FM.
6. Wavetable synthesis.
7. Hybrid synthesis.
8. Additive synthesis.
9. PAD / Fourier-style pad synthesis.
10. Noise-band subtractive synthesis.
11. Sample playback.
12. General MIDI-style synthesis.
13. Chiptune synthesis.
14. Drum synthesis.
15. Physical modelling.
16. Karplus-Strong plucked-string synthesis.
17. Modal synthesis.
18. Granular synthesis.
19. Formant synthesis.
20. Bitcrushed / degraded digital synthesis.
21. Vector synthesis.
22. Macro-controlled performance synthesis.

This diversity requirement exists to prevent the app from becoming “25 slightly different saw waves wearing different hats”.

### 8.3 Licence and Usage Rules Per Engine

Before implementation, every engine must receive a licence status:

```ts
type EngineLicenceStatus =
  | "approved-direct-use"
  | "approved-adapted-use"
  | "reference-only"
  | "blocked";
```

Each engine metadata record must include:

```ts
type EngineSourceMetadata = {
  engineId: string;
  sourceProjectName: string;
  sourceUrl: string;
  sourceLicence: string;
  usageStrategy:
    | "direct-dependency"
    | "adapted-implementation"
    | "reference-only"
    | "wasm-candidate";
  licenceStatus:
    | "approved-direct-use"
    | "approved-adapted-use"
    | "reference-only"
    | "blocked";
  attributionRequired: boolean;
  presetContentAllowed: boolean;
  sampleContentAllowed: boolean;
  notes: string;
};
```

Rules:

1. Do not embed GPL source code unless the project intentionally accepts the resulting licence obligations.
2. Do not bundle presets from any source unless preset redistribution is clearly allowed.
3. Do not bundle samples unless sample redistribution is clearly allowed.
4. Do not use Roland, Yamaha, Korg, Moog, Oberheim, Sequential, or other manufacturer trademarks in engine names, preset names, or marketing copy except in legally safe comparative/internal documentation.
5. Do not import DX7 cartridge content unless the cartridge/preset licence is confirmed.
6. Prefer clean Web Audio implementations for GPL-heavy desktop synths.
7. Include every source project in the Open Source Credits screen, even if used as reference-only.

### 8.4 Final Engine Names and User-Facing Descriptions

| Engine | User-Facing Description |
|---|---|
| Warm Analog | Classic synth basses, leads, pads, and plucks. Friendly, useful, not trying to win a modular argument. |
| Soft Poly | Smooth polyphonic tones with lots of gentle movement. Good for chords and patient filter sweeps. |
| Mono Furnace | A chunky mono bass and lead machine with glide, bite, and mild furniture damage. |
| Classic OB | Wide vintage-inspired brass, pads, and big open filter sounds. |
| FM Bells | Bright bells, glassy plucks, electric keys, and shiny digital pokes. |
| DX Stack | Deeper six-operator FM for complex metallic, electric, and percussive sounds. |
| Cartridge FM | DX-style patch behaviour for classic FM sound design experiments. |
| Wavetable Drift | Moving digital waves for evolving pads, sharp leads, and animated textures. |
| Surge Hybrid | A flexible hybrid synth engine for modern, layered sound design. |
| Additive Lantern | Harmonic partials, glowing tones, organs, glass, and spectral pads. |
| Pad Weaver | Slow, lush, synthetic pads made from broad harmonic smears. |
| Noise Harmonics | Breath, wind, reeds, synthetic bowing, and filtered noise instruments. |
| Sampled Keys | Familiar keyboard and instrument sounds using browser-friendly sample playback. |
| SoundFont Rack | A compact instrument shelf for useful bread-and-butter sounds. |
| Tiny GM | Lightweight General MIDI-ish sounds for quick sketches and charming fake realism. |
| Chip Arcade | Square waves, triangle basses, noise hits, and small heroic bleeping. |
| Drum Synth Kit | Playable synthetic drums mapped across the keyboard. |
| Karplus Pluck | Plucked strings, harps, kotos, rubber bands, and resonant twangs. |
| Modal Mallets | Tuned percussion, bowls, kalimbas, marimbas, and struck-object sounds. |
| Open Piano | Lightweight modelled piano-like tones with expressive decay and tone controls. |
| Granular Cloud | Clouds, sprays, frozen textures, ambient smears, and microscopic chaos. |
| Formant Vox | Vowel pads, robot choirs, talking leads, and synthetic voice-like movement. |
| Byte Crusher | Crunchy digital leads, broken toys, and intentional browser noises. |
| Vector Blend | Blend four sources with an XY pad for evolving hybrid sounds. |
| Zen Rack | The broad, macro-led flagship engine: fast to use, wide in range, and very preset-friendly. |

### 8.5 Engine Implementation Priority

Build the engines in this order to reduce technical risk:

1. Warm Analog.
2. FM Bells.
3. Drum Synth Kit.
4. Chip Arcade.
5. Tiny GM.
6. Sampled Keys.
7. Karplus Pluck.
8. Byte Crusher.
9. Wavetable Drift.
10. Granular Cloud.
11. Additive Lantern.
12. Modal Mallets.
13. Formant Vox.
14. Vector Blend.
15. Mono Furnace.
16. Soft Poly.
17. Pad Weaver.
18. Noise Harmonics.
19. SoundFont Rack.
20. Classic OB.
21. DX Stack.
22. Cartridge FM.
23. Open Piano.
24. Surge Hybrid.
25. Zen Rack.

Reasoning:

- Start with browser-native Web Audio/Tone.js engines.
- Add sample playback once the preset system is stable.
- Add physical modelling and granular once AudioWorklet patterns are proven.
- Add GPL-heavy/reference engines late as clean-room interpretations.
- Build Zen Rack last, because it should benefit from the shared components created for the other engines.

### 8.6 Minimum Presets Per Engine

Each engine must include at least 8 built-in presets.

For engines where source presets are licence-safe, they may be adapted or included.

For engines where source presets are not licence-safe, create original Rack-25 presets.

| Engine Type | Required Preset Categories |
|---|---|
| Subtractive / analogue | Bass, lead, pad, pluck, soft, bright, weird, showcase |
| FM | Bell, electric key, metallic pluck, bass, pad, percussion, weird, showcase |
| Wavetable / hybrid | Pad, lead, bass, motion, soft, aggressive, weird, showcase |
| Additive / pad | Organ, glass, choir-ish, pad, shimmer, dark, weird, showcase |
| Sample / SoundFont / GM | Piano/key, organ, strings, bass, mallet, lead, pad, useful sketch |
| Chiptune | Square lead, triangle bass, pulse arp, noise hit, fake drum, soft chip, bright chip, boss room |
| Drum | Kick kit, snare kit, hats kit, electro kit, soft kit, noisy kit, tom kit, full kit |
| Physical modelling | Pluck, harp, mallet, bowl, woody, metallic, soft, showcase |
| Granular | Cloud, freeze, shimmer, spray, drone, soft dust, strange swarm, showcase |
| Formant | Choir, robot vowel, talking lead, pad, bass vowel, soft ahh, bright eee, weird |
| Bitcrushed | Broken lead, tiny bass, crushed keys, toy pad, alias stab, lo-fi pluck, harsh, showcase |
| Vector | Four-source pad, morph lead, hybrid key, moving bass, soft blend, bright blend, weird blend, showcase |

### 8.7 Architecture Impact

The researched engine list changes the architecture in four important ways:

1. **Engine modules must support multiple implementation styles.** Some engines will be pure TypeScript/Web Audio, some may use Tone.js, some may use AudioWorklet, and some may later use WASM.
2. **Licensing must be tracked as data.** The app must not treat “open-source” as one magic permission bucket. Each engine needs explicit licence metadata.
3. **Preset loading must distinguish app-owned presets from source presets.** Built-in source presets are allowed only where redistribution is clear. Otherwise, use Rack-25 original presets.
4. **The UI must expose different control types.** These engines require knobs, sliders, switches, drawbars, XY pads, envelope editors, and possibly compact harmonic/partial editors.

### 8.8 Open Source Credits Requirement

The Open Source Credits screen must list, at minimum:

- Tone.js.
- WebAudioFont.
- WebAudio TinySynth.
- WebDX7.
- Dexed.
- Helm.
- Monique Mono-Synth.
- OB-Xd / OB-Xf.
- Vital.
- Surge XT.
- ZynAddSubFX.
- Faust.
- Web Audio Modules.
- Elementary Audio.
- Maximilian.
- Csound WASM.
- GRNLR.
- Oi Grandad.
- OpenPiano.
- soundfont-player / smplr-style browser sample playback sources, if used.

For each source:

- Project name.
- Source URL.
- Licence.
- Usage strategy.
- Whether code is directly used.
- Whether presets are directly used.
- Whether samples are directly used.
- Attribution text.
- Notes for future maintainers.

### 8.9 Updated Acceptance Criteria for Engine Sources

The MVP is not complete until:

1. All 25 engines have source metadata.
2. All 25 engines have a licence status.
3. No blocked source is used.
4. GPL-family projects are treated as reference-only unless the project licence strategy explicitly allows direct use.
5. Every engine has at least 8 built-in presets.
6. Every preset is either:
   - App-owned.
   - Licence-cleared from a source project.
   - Adapted from a source only where adaptation is legally permitted.
7. Every engine has a parameter schema.
8. Every engine has at least 4 macro controls.
9. Every engine appears in the Open Source Credits screen.
10. The final app still uses no more than 12 Vercel API routes, with a target of zero.

### 8.10 Engine Completion Checklist

An engine is complete when all of the following are true:

1. It implements the shared `SynthEngine` interface.
2. It can be selected from the engine browser.
3. It creates sound after audio unlock.
4. It responds to note on and note off.
5. It responds to velocity where appropriate.
6. It safely handles `allNotesOff`.
7. It disposes cleanly when switching engines.
8. It has source metadata.
9. It has licence metadata.
10. It has at least 8 built-in presets.
11. It has at least 8 editable parameters, unless technically inappropriate.
12. It has at least 4 macro controls.
13. Its controls update sound in real time.
14. Its presets update visible controls correctly.
15. It does not produce unsafe output volume.
16. It can play a C major chord if polyphonic.
17. It can play rapid repeated notes without stuck notes.
18. It works after switching away and back.
19. It appears in Open Source Credits.
20. It has at least one manual QA note describing expected sound character.

### 8.11 Minimum Parameter Counts by Engine Type

Each engine must expose enough controls to feel meaningfully editable.

| Engine Type | Minimum Parameters | Minimum Macros |
|---|---:|---:|
| Simple subtractive | 12 | 4 |
| Poly subtractive | 14 | 4 |
| FM | 12 | 4 |
| DX-style FM | 16 | 6 |
| Wavetable | 12 | 4 |
| Additive | 12 | 4 |
| Sample playback | 8 | 4 |
| GM-style | 8 | 4 |
| Chiptune | 10 | 4 |
| Drum synth | 12 | 4 |
| Physical modelling | 10 | 4 |
| Granular | 12 | 4 |
| Formant | 10 | 4 |
| Bitcrushed digital | 10 | 4 |
| Vector | 10 | 4 |
| Hybrid flagship | 16 | 8 |

If an engine cannot justify the required number of controls, the engine design is probably too thin and should be expanded.

### 8.12 Audio Quality Standard

MVP engines do not need to perfectly emulate their source projects, but they must meet a basic quality bar.

For each engine:

1. Default preset must sound intentional.
2. Presets must be volume-normalised relative to each other.
3. Short notes must not click harshly unless the preset intentionally does so.
4. Long notes must not drift into uncontrolled volume or feedback.
5. Parameter changes must not crash audio.
6. Filter and effect controls must avoid extreme unsafe ranges.
7. Engine should have a recognisable sonic identity.
8. Engine should not sound identical to another engine with different labels.

Subjective quality target:

> Good enough that a user would plausibly record a short idea with it, even if they would not mistake it for a commercial flagship synth.

### 8.13 Sample Asset Limits

Sample-based engines must stay lightweight.

MVP sample rules:

1. Total bundled sample assets should target under 30MB compressed.
2. No individual sample pack should exceed 10MB compressed without explicit justification.
3. Prefer short, loopable, multi-use samples.
4. Prefer generated or synthesised samples where possible.
5. Do not bundle commercial, proprietary, unclear, or unlicensed samples.
6. Lazy-load sample assets only when a sample-based engine is selected.
7. If sample loading fails, show a friendly error and allow engine switching.
8. Sampled Keys and SoundFont Rack may share sample infrastructure.

If suitable licence-safe samples cannot be confirmed, implement these engines using lightweight synthetic or generated waveforms for MVP.

---

## 9. Global Audio Features

### 9.1 Polyphony

Each engine must declare its polyphony behaviour:

- `mono`
- `poly`
- `drum-map`
- `drone`
- `texture`

Default polyphony:

- Poly engines: 8 voices.
- Mono engines: 1 voice with glide.
- Drum engines: at least 8 simultaneous drum voices.
- Drone/texture engines: continuous or note-triggered depending on engine.

The app must expose a global voice limit setting:

- 4 voices.
- 8 voices default.
- 16 voices.
- 32 voices where performance allows.

### 9.2 Master Effects

MVP should include a small global effects chain:

1. EQ/tone tilt.
2. Chorus.
3. Delay.
4. Reverb.
5. Limiter.

The global effects panel should be collapsible.

Required global effect parameters:

- Tone.
- Chorus amount.
- Delay amount.
- Delay time.
- Delay feedback.
- Reverb amount.
- Reverb size.
- Master volume.

### 9.3 Safety Limiter

The app must include a master limiter or gain safety stage to prevent dangerous volume spikes.

Requirements:

- Default master volume should be conservative.
- No preset should load at painful volume.
- Engine outputs must be normalised enough to avoid large jumps when switching engines.
- A panic button must immediately stop all active voices and reset stuck MIDI notes.

### 9.4 Audio Unlock

Because browsers require user interaction before audio starts, the app must show a friendly start overlay:

Title:

> Wake the rack

Body:

> Browsers are shy about audio. Tap once and we’ll plug the little beast in.

Button:

> Start playing

After the first user gesture, initialise the audio context.

---

## 10. User Interface Requirements

### 10.1 Main Layout

The app should have one primary page with these regions:

1. Header.
2. Engine browser.
3. Preset browser.
4. Parameter rack.
5. Macro strip.
6. Piano keybed.
7. Footer/status bar.

### 10.2 Header

Header must include:

- App name: The Rack-25.
- Current engine name.
- Current preset name.
- MIDI status.
- Keyboard input status.
- Panic button.
- Settings button.
- Credits/about button.

Suggested header copy:

- App subtitle: “Twenty-five little sound machines. One warm wooden rack.”
- Panic button label: “Panic / Shush Everything”

### 10.3 Engine Browser

The engine browser must allow the user to:

- Select any of the 25 engines.
- Search/filter engines by name.
- Filter by sound type:
  - Bass.
  - Lead.
  - Pad.
  - Keys.
  - Percussion.
  - Texture.
  - Experimental.
- See a short description of each engine.
- See whether an engine is Low, Medium, or High CPU.
- See whether an engine supports polyphony, mono glide, or drums.

Engine switching behaviour:

- If no unsaved parameter changes exist, switch immediately.
- If unsaved parameter changes exist, show a lightweight confirm dialog:
  - “Switch engines and lose these tweaks?”
  - Buttons: “Keep tweaking” and “Switch anyway”.
- Switching engine should stop currently playing notes.
- The new engine should load its default preset.

### 10.4 Preset Browser

Preset browser must support:

- Built-in presets.
- User presets.
- Search by preset name.
- Filter by type/tag.
- Sort alphabetically.
- Sort by recently used.
- Favourite user presets.

Preset metadata:

- Preset ID.
- Preset name.
- Engine ID.
- Author/source.
- Tags.
- Parameters.
- Created date for user presets.
- Updated date for user presets.
- Version number.

Built-in presets must be read-only.

User presets must support:

- Save new.
- Save over existing.
- Rename.
- Duplicate.
- Delete.
- Favourite/unfavourite.
- Export as JSON file.
- Import from JSON file.

### 10.5 Parameter Rack

The parameter rack displays controls generated from the selected engine’s parameter schema.

Supported control types:

- Knob.
- Toggle.
- Dropdown.
- XY pad.
- Slider.
- Drawbar.
- Envelope mini-editor.
- Button.
- Meter/readout.

Each parameter must define:

- ID.
- Display label.
- Type.
- Minimum value.
- Maximum value.
- Default value.
- Step size.
- Unit.
- Short help text.
- MIDI CC mapping eligibility.
- Whether it can be automated internally.
- UI group.

Parameter groups:

- Oscillators / Source.
- Filter / Tone.
- Envelope.
- Modulation.
- Character.
- Effects.
- Output.

Knob interaction requirements:

- Drag up/down to adjust.
- Shift-drag for fine adjustment.
- Double-click to reset to default.
- Hover/focus shows value.
- Keyboard accessible with arrow keys.
- Touch friendly on tablets.

### 10.6 Macro Strip

Each engine should expose 4–8 macro controls for fast editing.

Required macro names where possible:

- Tone.
- Shape.
- Motion.
- Bite.
- Space.
- Width.
- Punch.
- Level.

Macros should map to one or more underlying parameters.

Example:

- “Tone” may adjust filter cutoff, brightness, and formant width depending on engine.
- “Space” may adjust reverb amount and delay send.
- “Bite” may adjust drive, modulation index, or bit depth.

Macros must be part of the preset format.

### 10.7 Piano Keybed

The piano keybed must be visible by default.

Requirements:

- Toggle show/hide.
- Default visible.
- Minimum range: C2 to C6.
- Highlight notes currently playing.
- Support mouse click/touch press.
- Support dragging across keys.
- Show note labels on C notes by default.
- Optional setting to show all note labels.
- Sustain behaviour should work with MIDI sustain pedal and optional UI sustain toggle.

Keybed controls:

- Octave down.
- Octave up.
- Current octave display.
- Velocity slider.
- Hold/sustain toggle.
- Keybed visibility toggle.

### 10.8 Computer Keyboard Playing

The user must be able to play notes using the computer keyboard.

Default mapping:

Lower row:

- Z = C
- S = C#
- X = D
- D = D#
- C = E
- V = F
- G = F#
- B = G
- H = G#
- N = A
- J = A#
- M = B

Upper row:

- Q = C one octave up
- 2 = C#
- W = D
- 3 = D#
- E = E
- R = F
- 5 = F#
- T = G
- 6 = G#
- Y = A
- 7 = A#
- U = B

Controls:

- `[` octave down.
- `]` octave up.
- Space = sustain toggle, unless focused on text input.
- Escape = panic.

Rules:

- Keyboard playing must not trigger when user is typing into text fields.
- Pressing a mapped key starts a note.
- Releasing it stops the note.
- Repeated keydown events must not retrigger unless key was released.
- Active computer keys must be visually reflected on the piano keybed.

### 10.9 MIDI Support

MIDI must use browser Web MIDI where available.

Requirements:

- MIDI input device selection.
- “All devices” option.
- Note on/off support.
- Velocity support.
- Pitch bend support where engine supports it.
- Mod wheel support.
- Sustain pedal support.
- Basic CC mapping.
- MIDI learn for eligible parameters.
- MIDI panic/reset.

MIDI states:

- Not supported by browser.
- Permission needed.
- No MIDI devices found.
- Connected.
- Device disconnected.
- Listening for MIDI learn.

When unsupported, show friendly message:

> MIDI is not available in this browser. The computer keyboard and on-screen keys still work fine. Slightly less cable spaghetti, at least.

### 10.10 Settings Panel

Settings must include:

- Audio device status, where available.
- Sample rate display.
- Buffer/performance mode:
  - Eco.
  - Balanced default.
  - Fancy.
- Global polyphony limit.
- Keybed visibility.
- Computer keyboard input on/off.
- MIDI input on/off.
- MIDI device selector.
- Theme:
  - Warm Studio default.
  - Dusk Rack.
  - Paper & Walnut.
- Reset all local data.
- Export all user presets.
- Import presets.
- Open-source credits.

---

## 11. Preset System

### 11.1 Built-In Presets

Each engine must include at least 8 built-in presets.

Target total:

- 25 engines × 8 presets = 200 built-in presets minimum.

Where source projects provide presets and licensing allows use, include them.

If source presets are not available or are unsuitable, create original presets.

Each engine should include at least:

- 1 bass preset where appropriate.
- 1 lead preset where appropriate.
- 1 pad/texture preset where appropriate.
- 1 soft preset.
- 1 bright preset.
- 1 weird preset.
- 1 performance-friendly preset.
- 1 showcase preset.

Some engines, such as Drum Synth Kit, may use equivalent categories.

### 11.2 User Presets

User presets must be saved in localStorage.

Storage key:

`rack25:userPresets:v1`

User preset schema:

```json
{
  "id": "user_abc123",
  "schemaVersion": 1,
  "engineId": "warm-analog",
  "name": "My Reasonably Big Pad",
  "author": "local-user",
  "tags": ["pad", "warm"],
  "parameters": {},
  "macros": {},
  "globalEffects": {},
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE",
  "isFavourite": false
}
```

### 11.3 Preset Migration

The app must include a simple migration layer.

Requirements:

- Every preset includes `schemaVersion`.
- If schema version is old, migration functions can update it.
- If migration fails, preset should not crash the app.
- Failed preset should show as unavailable with error details in developer console.

### 11.4 Import / Export

Users must be able to export:

- Single user preset.
- All user presets.

Users must be able to import:

- Single preset JSON.
- Preset pack JSON.

Import validation:

- Must reject unknown schema.
- Must reject missing engine ID.
- Must reject malformed parameter values.
- Must warn if preset is for an engine not present.
- Must avoid overwriting existing presets unless user confirms.

### 11.5 Preset Creation Responsibility

The coding agent must create original Rack-25 built-in presets wherever source presets are unavailable, unsuitable, unclear, or licence-restricted.

Each built-in preset must include:

- Name.
- Engine ID.
- Tags.
- Parameter values.
- Macro values.
- Optional short description.
- Author set to `Rack-25`.

Preset names should be original and should not copy famous factory patch names.

The first preset for each engine must be a safe default named:

`Init: [Engine Name]`

Example:

`Init: Warm Analog`

The `Init` preset should be simple, stable, and useful for sound design.

### 11.6 Preset Validation Rules

Imported presets must be validated before being saved.

Validation requirements:

1. `schemaVersion` must be present and supported.
2. `engineId` must match an installed engine.
3. `name` must be a non-empty string under 80 characters.
4. `parameters` must be an object.
5. Every parameter must exist in the engine schema.
6. Numeric parameter values must be clamped to allowed min/max.
7. Dropdown values must match allowed options.
8. Boolean values must be actual booleans.
9. Unknown parameters must be ignored and reported in console.
10. Imported presets must receive new local IDs to avoid collisions unless user confirms overwrite.
11. Malformed JSON must show a friendly error.
12. Imported presets must not execute code.

The app must never use `eval` or dynamic script execution when importing presets.

---

## 12. Audio Engine Architecture

### 12.1 Engine Interface

All engines must implement a common interface.

```ts
type EngineId = string;

type SynthEngine = {
  id: EngineId;
  name: string;
  description: string;
  sourceCredits: SourceCredit[];
  cpuCost: "low" | "medium" | "high";
  voiceMode: "mono" | "poly" | "drum-map" | "drone" | "texture";
  defaultPresetId: string;
  parameterSchema: ParameterDefinition[];
  macroSchema: MacroDefinition[];
  builtInPresets: Preset[];

  create(context: AudioContext, destination: AudioNode): EngineInstance;
};
```

```ts
type EngineInstance = {
  noteOn(note: number, velocity: number): void;
  noteOff(note: number): void;
  allNotesOff(): void;
  setParameter(parameterId: string, value: number | string | boolean): void;
  setMacro(macroId: string, value: number): void;
  setPitchBend?(value: number): void;
  setModWheel?(value: number): void;
  setSustain?(isDown: boolean): void;
  dispose(): void;
};
```

### 12.2 Parameter Definition

```ts
type ParameterDefinition = {
  id: string;
  label: string;
  group: "source" | "filter" | "envelope" | "modulation" | "character" | "effects" | "output";
  controlType: "knob" | "slider" | "toggle" | "dropdown" | "xy" | "drawbar" | "envelope" | "button";
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | string | boolean;
  unit?: string;
  options?: { label: string; value: string }[];
  helpText: string;
  midiLearn: boolean;
};
```

### 12.3 Engine Loading

For MVP, engines may be bundled directly.

Optional optimisation:

- Lazy-load engine modules with dynamic imports.
- Load only the selected engine and shared audio utilities.
- Keep large sample sets external/static and lazy-loaded.

Rules:

- Engine switching must dispose of the old engine cleanly.
- Active notes must be stopped before disposal.
- Preset changes must update engine parameters without recreating the audio context unless required.
- Audio context should be created once after user unlock.

### 12.4 Performance Requirements

The app should target:

- Smooth UI while playing 8 voices.
- No obvious clicks during normal note on/off.
- Engine switch under 500ms for non-sample engines.
- Engine switch under 2s for sample-heavy engines on reasonable broadband.
- No memory leak after 50 engine switches.
- No stuck notes after MIDI disconnect or browser tab visibility changes.

Performance modes:

- Eco:
  - Lower polyphony.
  - Disable expensive visual animation.
  - Lower effect quality where applicable.
- Balanced:
  - Default.
- Fancy:
  - Higher polyphony and richer effects where supported.

### 12.5 Shared Engine Utilities

To avoid duplicating audio code across 25 engines, the app should include shared utilities:

1. Voice allocator.
2. ADSR envelope helper.
3. Oscillator factory.
4. Noise generator.
5. Filter factory.
6. LFO helper.
7. MIDI note-to-frequency converter.
8. Velocity scaling helper.
9. Parameter smoothing helper.
10. Safe gain/limiter helper.
11. Effect send bus helper.
12. Engine disposal helper.

Parameter smoothing is required for controls likely to click when changed abruptly, especially:

- Filter cutoff.
- Oscillator frequency/detune.
- FM index.
- Gain.
- Distortion amount.
- Delay feedback.
- Granular density.
- Formant morph.

### 12.6 Stuck Note Prevention

The app must aggressively prevent stuck notes.

Trigger `allNotesOff` when:

1. User presses Panic.
2. User presses Escape.
3. Engine changes.
4. Preset changes, if the engine cannot safely update while notes are held.
5. MIDI device disconnects.
6. Browser tab becomes hidden.
7. Audio context is suspended.
8. Computer keyboard focus leaves the app window.
9. User disables MIDI.
10. User disables computer keyboard input.

The app must track active notes separately for:

- MIDI input.
- Computer keyboard input.
- On-screen keybed.

This prevents one input method from accidentally releasing notes held by another method.

---

## 13. State Management

### 13.1 Global App State

State must include:

- Current engine ID.
- Current preset ID.
- Current parameter values.
- Current macro values.
- Unsaved changes flag.
- Active notes.
- Computer keyboard octave.
- Keybed visibility.
- MIDI enabled.
- Selected MIDI device.
- MIDI mappings.
- Global effects state.
- Master volume.
- Theme.
- Performance mode.

### 13.2 Local Persistence

Persist in localStorage:

- User presets.
- Last selected engine.
- Last selected preset.
- Theme.
- Keybed visibility.
- Computer keyboard enabled state.
- MIDI mappings.
- Performance mode.
- Global polyphony setting.

Do not persist:

- Currently active notes.
- Audio context.
- MIDI device object references.
- Runtime errors.

### 13.3 Storage Keys

Use versioned keys:

- `rack25:userPresets:v1`
- `rack25:settings:v1`
- `rack25:midiMappings:v1`
- `rack25:lastSession:v1`

---

## 14. Accessibility Requirements

The app must be usable without a mouse.

Requirements:

- All controls keyboard focusable.
- Visible focus states.
- ARIA labels for knobs and sliders.
- Knobs operable with arrow keys.
- Parameter value announced to screen readers.
- Piano keys labelled by note.
- Buttons use actual button elements.
- Preset and engine selectors usable with keyboard.
- Colour contrast meets WCAG AA where practical.
- Motion should respect reduced-motion preferences.

Knob keyboard behaviour:

- Arrow up/right increases value.
- Arrow down/left decreases value.
- Shift + arrow changes value more finely.
- Home sets minimum.
- End sets maximum.
- Enter or double-click resets default where appropriate.

### 14.2 Custom Control Accessibility

Custom controls must behave like standard controls.

#### Knobs

Knobs must expose:

- `role="slider"`.
- `aria-label`.
- `aria-valuemin`.
- `aria-valuemax`.
- `aria-valuenow`.
- `aria-valuetext` where units are useful.

Keyboard support:

- Arrow keys adjust by step.
- Shift + arrow adjusts by fine step.
- PageUp/PageDown adjust by larger step.
- Home sets minimum.
- End sets maximum.
- Enter resets to default.

#### XY Pads

XY pads must expose two accessible sliders or an equivalent keyboard-accessible control.

Keyboard support:

- Arrow keys move X/Y.
- Shift + arrows move finely.
- Home/End reset X.
- PageUp/PageDown adjust Y.
- Reset button available.

#### Drawbars

Drawbars must be keyboard-accessible sliders.

#### Piano Keybed

Each key must be focusable or playable through an accessible alternative.

At minimum:

- The computer keyboard mapping must be documented on screen.
- The keybed must visually highlight active notes.
- Screen readers must be able to identify note names.

---

## 15. Visual Design Direction

### 15.1 Look and Feel

The app should feel like:

- A warm studio.
- A friendly rack of gear.
- A nice object on a desk.
- Slightly handmade.
- Slightly premium.
- Not sterile.
- Not cyberpunk.
- Not skeuomorphic to the point of parody.

### 15.2 Suggested Palette

Design tokens should be created for:

- Background: warm cream.
- Rack panel: soft walnut / muted clay.
- Control surface: parchment / warm grey.
- Primary accent: muted orange.
- Secondary accent: teal.
- Text: soft charcoal.
- Warning: dusty red.
- Success: olive green.
- Keybed white keys: ivory.
- Keybed black keys: charcoal brown.

### 15.3 Typography

Use friendly, readable type.

Suggested direction:

- Rounded sans for UI.
- Slightly characterful display type for logo.
- Monospace only for technical readouts.

Avoid:

- Overly futuristic sci-fi fonts.
- Tiny unreadable knob labels.
- All-caps everywhere.

### 15.4 Motion

Use subtle motion:

- Knob hover lift.
- Engine card selection slide.
- Preset load pulse.
- Key press highlight.
- MIDI connection toast.

Respect reduced motion.

---

## 16. Functional Requirements

### FR-001: Audio Unlock

When the user first opens the app, audio must be locked until they click/tap the start button.

Acceptance criteria:

- User sees friendly start overlay.
- Clicking start creates/resumes AudioContext.
- Default engine and preset become playable.
- Overlay does not appear again during same session unless audio context is lost.

### FR-002: Engine Selection

User can select any of 25 engines.

Acceptance criteria:

- All 25 engines visible in engine browser.
- Selecting engine loads its default preset.
- Active notes stop when switching.
- Old engine is disposed.
- New engine plays within expected performance limits.
- Unsaved changes warning appears when relevant.

### FR-003: Preset Loading

User can browse and load presets for current engine.

Acceptance criteria:

- Built-in presets appear.
- User presets appear.
- Preset search works.
- Loading preset updates all visible controls.
- Loading preset updates sound.
- Built-in presets cannot be overwritten.

### FR-004: User Preset Save

User can save current settings as a new preset.

Acceptance criteria:

- User enters preset name.
- Preset is saved to localStorage.
- Preset appears in user preset list.
- Preset survives page reload.
- Preset includes engine ID and parameter values.

### FR-005: User Preset Recall

User can reload a saved preset.

Acceptance criteria:

- User preset loads correctly.
- Parameter controls reflect saved values.
- Sound updates correctly.
- Missing/invalid values fall back safely.

### FR-006: Preset Management

User can rename, duplicate, delete, favourite, import, and export user presets.

Acceptance criteria:

- Actions only apply to user presets.
- Delete requires confirmation.
- Export downloads valid JSON.
- Import validates schema.
- Favourite status persists.

### FR-007: Parameter Controls

User can adjust all relevant parameters for loaded engine.

Acceptance criteria:

- Controls generated from engine schema.
- Value changes update sound in real time.
- Values are clamped to valid ranges.
- Double-click resets to default.
- Shift-drag/fine adjustment works.
- Controls are accessible via keyboard.

### FR-008: Piano Keybed

User can play notes using on-screen keybed.

Acceptance criteria:

- Keybed visible by default.
- Keybed can be hidden.
- Mouse/touch starts and stops notes.
- Active notes are highlighted.
- Octave controls work.
- Velocity slider affects note velocity.
- Sustain toggle works.

### FR-009: Computer Keyboard Input

User can play notes using computer keyboard.

Acceptance criteria:

- Default key mapping works.
- Key releases stop notes.
- Octave up/down works.
- Escape triggers panic.
- Input does not trigger while typing in text fields.
- Active notes are reflected visually.

### FR-010: MIDI Input

User can connect and play from MIDI devices where browser supports Web MIDI.

Acceptance criteria:

- App requests MIDI permission only when user enables MIDI.
- MIDI support state is displayed.
- Device list appears.
- Note on/off works.
- Velocity works.
- Sustain pedal works.
- Pitch bend works where supported.
- MIDI disconnect handled gracefully.
- Unsupported browsers show friendly fallback message.

### FR-011: MIDI Learn

User can map eligible parameters to MIDI CC controls.

Acceptance criteria:

- User enters MIDI learn mode for parameter.
- Moving a MIDI control maps CC to parameter.
- Mapping persists in localStorage.
- User can remove mapping.
- Incoming CC updates parameter and UI.
- Parameter schema controls MIDI eligibility.

### FR-012: Panic Button

User can stop all sound immediately.

Acceptance criteria:

- Panic button visible in header.
- Escape key triggers panic.
- Panic sends all-notes-off to current engine.
- Sustain state clears.
- Active note UI clears.

### FR-013: Global Effects

User can adjust global effects.

Acceptance criteria:

- Effects panel available.
- Tone, chorus, delay, reverb, and master volume work.
- Limiter prevents major spikes.
- Effects values can be saved in user presets if enabled.

### FR-014: Settings

User can adjust persistent settings.

Acceptance criteria:

- Settings panel opens from header.
- Theme selection works.
- Keybed visibility setting persists.
- Performance mode persists.
- Polyphony setting persists.
- Reset local data works after confirmation.

### FR-015: Open Source Credits

User can view credits.

Acceptance criteria:

- Credits screen lists every engine source.
- Credits include license and attribution.
- Credits distinguish direct use, adapted code, and conceptual reference.
- Credits are accessible from settings/about.

### FR-016: Unsaved Changes Behaviour

The app must track unsaved changes whenever the user changes a parameter, macro, global effect, or preset name after loading a preset.

Unsaved changes are cleared when:

1. User saves a new preset.
2. User overwrites an existing user preset.
3. User loads another preset and confirms losing changes.
4. User switches engine and confirms losing changes.
5. User resets to Init and confirms.

Built-in presets cannot be overwritten.

If a user edits a built-in preset and clicks save, the app must create a new user preset using:

`[Built-in Preset Name] Copy`

### FR-017: Engine Switching Rules

When switching engines:

1. Trigger panic/all-notes-off.
2. Dispose current engine.
3. Clear active note state.
4. Load selected engine module.
5. Load that engine’s default preset.
6. Reset parameter UI to default preset values.
7. Preserve global settings such as theme, keybed visibility, MIDI mappings, and master volume.
8. Show engine load error if module fails.
9. Do not preserve old engine parameters unless implementing future cross-engine morphing.

If the user has unsaved changes, confirm before switching.

### FR-018: MIDI Mapping Rules Across Engines

MIDI mappings are engine-specific by default.

A mapping must include:

- Engine ID.
- Parameter ID.
- MIDI channel.
- CC number.
- Value range.

When switching engines:

1. Only mappings for the selected engine are active.
2. If a mapped parameter no longer exists, ignore the mapping and show it as broken in settings.
3. User can delete broken mappings.
4. Global mappings may be supported only for global controls such as master volume, reverb amount, delay amount, and panic.

### FR-019: Computer Keyboard Edge Cases

Computer keyboard input must account for browser and text-entry behaviour.

Rules:

1. Do not play notes when focus is inside input, textarea, select, or contenteditable element.
2. Ignore repeated keydown events while a key is held.
3. Release all computer-keyboard notes on window blur.
4. Release all computer-keyboard notes when keyboard input is disabled.
5. Support non-US keyboard layouts on a best-effort basis, but MVP mapping may use physical `KeyboardEvent.code`.
6. Show the active mapping in a help panel.

Use `KeyboardEvent.code` rather than `KeyboardEvent.key` for musical layout consistency where practical.

### FR-020: LocalStorage Failure Handling

localStorage may be unavailable, full, or blocked.

If localStorage write fails:

1. Show a friendly error.
2. Do not lose the current sound settings.
3. Offer preset export as JSON.
4. Disable further save actions until storage is available or user clears space.

If localStorage read fails:

1. App should still load.
2. Built-in presets should still work.
3. User presets should show unavailable.
4. Console should include technical error details.

---

## 17. Error Handling

### 17.1 Audio Context Error

If audio context fails:

Show:

> The rack could not wake up. Your browser may be blocking audio. Try refreshing, or check your audio settings.

### 17.2 MIDI Permission Denied

Show:

> MIDI permission was declined. No drama — the on-screen keys and computer keyboard still work.

### 17.3 MIDI Device Disconnected

Show toast:

> MIDI device disconnected. The rack has stopped any hanging notes, because nobody likes a haunted C#.

Action:

- Trigger panic.
- Clear selected device if unavailable.

### 17.4 Preset Import Error

Show clear validation error:

> This preset could not be imported because it is missing an engine ID.

Do not crash.

### 17.5 Engine Load Error

Show fallback panel:

> This engine failed to load. Try another engine, or refresh the page.

Actions:

- Stop all notes.
- Dispose partial engine.
- Allow user to switch engines.

---

## 18. Data Models

### 18.1 Engine Metadata

```ts
type EngineMetadata = {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  cpuCost: "low" | "medium" | "high";
  voiceMode: "mono" | "poly" | "drum-map" | "drone" | "texture";
  sourceCredits: SourceCredit[];
};
```

### 18.2 Source Credit

```ts
type SourceCredit = {
  projectName: string;
  projectUrl: string;
  license: string;
  usageType: "direct-code" | "adapted-code" | "reference-only" | "samples" | "presets";
  attributionText: string;
  notes?: string;
};
```

### 18.3 Preset

```ts
type Preset = {
  id: string;
  schemaVersion: number;
  engineId: string;
  name: string;
  author: string;
  source: "built-in" | "user" | "imported";
  tags: string[];
  parameters: Record<string, number | string | boolean>;
  macros: Record<string, number>;
  globalEffects?: Record<string, number | string | boolean>;
  createdAt?: string;
  updatedAt?: string;
  isFavourite?: boolean;
};
```

### 18.4 MIDI Mapping

```ts
type MidiMapping = {
  id: string;
  engineId: string;
  parameterId: string;
  cc: number;
  channel: number | "all";
  min: number;
  max: number;
};
```

---

## 19. Routing

MVP should use a minimal route structure.

Required pages/routes:

1. `/`
   - Main synth app.

Optional static pages:

2. `/about`
   - About and credits.
3. `/privacy`
   - Simple privacy page explaining local-only storage.

No API routes are required for MVP.

If using Next.js, avoid accidental serverless functions by keeping pages static and avoiding server-only data fetching.

Maximum API route budget:

- 0 used in MVP.
- Up to 12 allowed by project constraint.
- Any future API route must be documented in this section.

Potential future API routes, not in MVP:

1. `/api/health`
2. `/api/preset-pack/validate`
3. `/api/feedback`

These should not be implemented unless needed.

---

## 20. Privacy

The Rack-25 should be privacy-friendly.

Requirements:

- No account required.
- No server-side preset storage.
- No analytics unless explicitly added later.
- User presets remain in localStorage.
- MIDI device access only requested after user action.
- No audio is uploaded.
- No keyboard input is transmitted.
- No microphone access required.

Privacy page must explain:

- Presets are stored locally in the browser.
- Clearing browser data may remove presets.
- Export presets if user wants backup.
- MIDI access is handled by the browser.

---

## 21. Testing Requirements

### 21.1 Unit Tests

Test:

- Preset validation.
- Preset migration.
- Parameter clamping.
- MIDI message parsing.
- Keyboard note mapping.
- Engine metadata completeness.
- localStorage save/load.
- Import/export validation.

### 21.2 Integration Tests

Test:

- Load app.
- Unlock audio.
- Switch engine.
- Load preset.
- Adjust parameter.
- Save preset.
- Reload page.
- Recall preset.
- Delete preset.
- Toggle keybed.
- Computer keyboard note on/off.

### 21.3 Manual Audio QA

For each engine:

- Play low, middle, and high notes.
- Test short and long notes.
- Test velocity response.
- Test all controls.
- Test preset changes.
- Test panic.
- Test engine disposal.
- Listen for clicks, runaway volume, stuck notes.

### 21.4 Browser QA

Minimum target browsers:

- Chrome desktop.
- Edge desktop.
- Safari desktop.
- Firefox desktop.

Expected differences:

- MIDI may not be available in all browsers.
- App must still be usable without MIDI.

### 21.5 Performance QA

Test:

- 8-note chords on poly engines.
- Rapid engine switching.
- 50 preset changes.
- 10 minutes idle with drone engine.
- MIDI disconnect while notes held.
- Browser tab hidden then restored.

---

## 22. Acceptance Criteria for MVP

The MVP is complete when:

1. App deploys successfully to Vercel Hobby.
2. App uses zero API routes.
3. User can unlock audio and play sound.
4. 25 engines are present and selectable.
5. Each engine has relevant parameters exposed as controls.
6. Each engine has at least 8 built-in presets.
7. Piano keybed is visible by default and playable.
8. Keybed can be hidden.
9. Computer keyboard note input works.
10. MIDI input works in supported browsers.
11. MIDI fallback is clear in unsupported browsers.
12. User can save presets to localStorage.
13. User can recall presets after page reload.
14. User can import/export presets.
15. Panic button stops all sound.
16. Open-source credits are present.
17. App does not require login.
18. App does not upload audio.
19. App feels warm, casual, approachable, and polished.
20. App can be used without reading external documentation.

### 22.1 Definition of MVP Complete

The MVP is complete only when the following are true:

1. The app builds and deploys to Vercel Hobby.
2. The app uses zero API routes.
3. The app opens on Chrome desktop and produces sound after user unlock.
4. All 25 engines are selectable.
5. All 25 engines produce distinct audible results.
6. All 25 engines have source and licence metadata.
7. No engine uses blocked source material.
8. Each engine has at least 8 presets.
9. Each engine has required minimum parameters and macros.
10. Piano keybed is visible by default.
11. Computer keyboard playing works.
12. MIDI input works in Chrome where device/browser permission allows.
13. MIDI fallback copy appears in unsupported browsers.
14. User presets save to localStorage.
15. User presets survive reload.
16. Preset import/export works.
17. Panic button works.
18. Engine switching does not leave stuck notes.
19. Open Source Credits screen exists.
20. The UI feels warm, casual, polished, and approachable.
21. The app remains usable without MIDI, account, backend, or external hardware.

---

## 23. Implementation Notes for AI Coding Agent

### 23.1 Build Order

Recommended build sequence:

1. Create app shell and visual design tokens.
2. Implement audio unlock.
3. Implement engine interface.
4. Build one reference engine: Warm Analog.
5. Implement parameter schema rendering.
6. Implement piano keybed.
7. Implement computer keyboard input.
8. Implement preset schema and localStorage.
9. Implement engine browser.
10. Add remaining 24 engines progressively.
11. Add MIDI input.
12. Add MIDI learn.
13. Add global effects.
14. Add import/export.
15. Add credits/about.
16. Add accessibility pass.
17. Add performance pass.
18. Add preset pack.

### 23.2 Engine Implementation Priority

Start with simpler engines:

1. Warm Analog.
2. FM Bells.
3. Chip Arcade.
4. Noise Lab.
5. Supersaw Stack.
6. Bass Furnace.
7. Drawbar Organ.
8. Physical Pluck.

Then add more complex engines:

9. Sampled Keys.
10. Tiny GM.
11. Wavetable Drift.
12. String Machine.
13. Modal Mallets.
14. Additive Lantern.
15. Formant Vox.
16. Byte Crusher.
17. Drone Hearth.
18. Resonant Pad.
19. Drum Synth Kit.
20. Acid Line.
21. Vector Blend.
22. Phase Shapes.
23. Granular Cloud.
24. Mutable Texture.
25. Zen Rack.

Note: this older implementation priority is superseded by the researched engine priority in Section 8.5 where there is a conflict.

### 23.3 Avoiding Vercel Hobby Issues

Do:

- Keep the app static/client-side.
- Bundle static JSON where possible.
- Lazy-load large engine modules.
- Store user data locally.
- Avoid server-side rendering requirements.
- Avoid API routes unless absolutely needed.

Do not:

- Create one API route per engine.
- Render audio server-side.
- Store presets in a database.
- Add auth.
- Add cloud sync.
- Add server-side sample processing.

### 23.4 Compatibility Notes

MIDI support must be progressive enhancement.

The app must remain useful with:

- No MIDI.
- No external keyboard.
- No account.
- No internet after initial load, except where static sample assets have not yet been cached.

### 23.5 Preset Naming Tone

Preset names should fit the warm/casual identity.

Examples:

- “Sofa Bass”
- “Sunbeam Pad”
- “Polite Laser”
- “Cardboard Prophet”
- “Small Haunted Toy”
- “Honey Keys”
- “Garage Choir”
- “Mallets In A Cupboard”
- “Very Legal Supersaw”
- “Fog Machine Apology”

Avoid names that copy Roland, Yamaha, Korg, Moog, or other proprietary preset identities.

### 23.6 Implementation Decision Defaults

If the coding agent encounters ambiguity, use these defaults:

1. Choose client-side over server-side.
2. Choose Web Audio over WASM.
3. Choose original Rack-25 presets over source presets.
4. Choose reference-only over risky direct source use.
5. Choose smaller sample assets over realism.
6. Choose stable sound over extreme modulation.
7. Choose fewer advanced controls over confusing UI.
8. Choose Chrome desktop behaviour as reference.
9. Choose accessibility-compatible controls over purely visual custom widgets.
10. Choose zero API routes unless explicitly instructed otherwise.

### 23.7 Suggested File Structure

```txt
/src
  /app
    page.tsx
    about/page.tsx
    privacy/page.tsx
  /audio
    audioContext.ts
    engineHost.ts
    globalEffects.ts
    limiter.ts
    midi.ts
    keyboardInput.ts
    noteUtils.ts
    voiceAllocator.ts
  /engines
    /warm-analog
      engine.ts
      metadata.ts
      presets.ts
    /fm-bells
      engine.ts
      metadata.ts
      presets.ts
    /...
  /presets
    builtInPresetIndex.ts
    presetSchema.ts
    presetValidation.ts
    presetMigration.ts
    presetStorage.ts
  /ui
    /components
      Knob.tsx
      Slider.tsx
      Toggle.tsx
      XYPad.tsx
      Drawbar.tsx
      PianoKeybed.tsx
      EngineBrowser.tsx
      PresetBrowser.tsx
      ParameterRack.tsx
      MacroStrip.tsx
      SettingsPanel.tsx
      CreditsPanel.tsx
  /state
    useRackStore.ts
  /styles
    tokens.css
    globals.css
  /data
    sourceCredits.ts
    engineRegistry.ts
/public
  /samples
    /sampled-keys
    /soundfont-rack
```

This structure is not mandatory, but any alternative must preserve clear separation between:

- Audio engine logic.
- UI controls.
- Preset storage.
- Source metadata.
- Input handling.
- Global app state.

### 23.8 Recommended First Vertical Slice

Before building all 25 engines, implement one complete vertical slice:

1. Warm Analog engine.
2. Audio unlock.
3. Piano keybed.
4. Computer keyboard input.
5. Parameter rack.
6. Built-in presets.
7. User preset save/recall.
8. Panic button.
9. Engine metadata.
10. Credits entry.

Only after this slice works should the agent add the remaining engines.

This prevents the project becoming 25 half-built engines with no playable app around them.

---

## 24. Self-Review Passes Already Applied

### Pass 1: “25 engines” was ambiguous

Original ambiguity:

- “25 different engines, sourced from open-source projects” could mean directly embedding 25 full synth codebases, which would create licensing, bundle-size, and architecture risk.

Resolution added:

- Defined “sourced from open-source projects”.
- Added license review requirements.
- Added direct/adapted/reference-only usage types.
- Added replacement rule for unclear licenses.

### Pass 2: Vercel Hobby API limit needed clearer architecture

Original ambiguity:

- The app could accidentally use too many Next.js API routes or serverless functions.

Resolution added:

- MVP target is zero API routes.
- Static/client-side architecture is required.
- Route budget documented.
- Future API routes are explicitly marked out of scope.

### Pass 3: Presets were underspecified

Original ambiguity:

- “Built-in presets where presets have been provided by the engine” could leave engines without presets.

Resolution added:

- Each engine must have at least 8 built-in presets.
- Source presets can be used only if licensed and technically compatible.
- App-created original presets fill gaps.

### Pass 4: Parameter controls needed a schema

Original ambiguity:

- “Knobs to adjust all relevant parameters” could be interpreted differently per engine.

Resolution added:

- Parameter schema model.
- Required parameter list per engine.
- UI control types.
- Accessibility and MIDI learn eligibility.

### Pass 5: MIDI support needed fallback behaviour

Original ambiguity:

- Browser MIDI support varies.

Resolution added:

- MIDI treated as progressive enhancement.
- Unsupported/permission/no-device states defined.
- App remains playable with computer keyboard and on-screen keybed.

### Pass 6: Audio safety needed explicit requirements

Original ambiguity:

- Browser synths can produce harsh spikes or stuck notes.

Resolution added:

- Master limiter.
- Conservative default volume.
- Panic button.
- MIDI disconnect handling.
- Voice disposal requirements.

### Pass 7: AI agent implementation needed build order

Original ambiguity:

- A coding agent could try to build all 25 engines at once and produce soup with knobs.

Resolution added:

- Recommended implementation sequence.
- Engine priority order.
- Common engine interface.
- Data models and acceptance criteria.

---

## 25. Final Build Guidance

The key architectural decision is: **do not build this as 25 API-backed synths**. Build it as a static/client-side synth host with 25 engine modules, shared parameter schemas, localStorage presets, and Web MIDI as progressive enhancement.

The researched engine list should guide the sound design, but the MVP should use safe, browser-native implementations wherever possible. Treat risky source projects as references, not dependencies. The goal is a playable, warm, polished synth rack that works in the browser, not a licence goblin containment exercise with a keybed attached.
