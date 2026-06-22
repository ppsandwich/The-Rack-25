# Phase 4: Surge/Vital WASM Feasibility

Date: 2026-06-22

## Decision

Do not integrate Surge XT or Vital directly into Rack-25 during this phase.

Both projects are valid open source references, but neither currently presents as a drop-in browser audio engine. The
work needed is a dedicated native-to-WASM port with an AudioWorklet ABI, not an application-level dependency change.
Rack-25 should keep `Surge Hybrid` and `Wavetable Drift` as reference-only engines until that port exists.

## What Was Checked

- npm package search for a maintained Surge XT, Vital, WASM, or AudioWorklet browser synth artifact.
- Surge XT upstream repository: `https://github.com/surge-synthesizer/surge`
- Vital upstream repository: `https://github.com/mtytel/vital`
- Upstream build files and docs for `wasm`, `emscripten`, `webassembly`, and `audio worklet` targets.
- Upstream license/readme constraints.

## Findings

### Surge XT

- License: GPLv3.
- Build system: CMake/JUCE native plugin and standalone targets.
- Exposed formats include native plugin/standalone routes such as VST3, CLAP, LV2, standalone, plus Python/Rust binding
  paths for native development.
- No browser-ready package, Emscripten target, WebAssembly target, or AudioWorklet integration was found in the checked
  upstream tree.

### Vital

- License: GPLv3, with documented non-GPL commercial licensing option.
- Build system: JUCE `.jucer` native plugin, standalone, test, and headless projects.
- Plugin/standalone project definitions include authentication-related build flags. Headless/test projects define
  `NO_AUTH`, which may be useful for a future DSP-only investigation but is not a browser build target.
- The README explicitly says not to redistribute the bundled free-version presets, and not to use Vital/Vital Audio/Tytel
  names for marketing or binary distribution.
- No browser-ready package, Emscripten target, WebAssembly target, or AudioWorklet integration was found in the checked
  upstream tree.

## Implications For Rack-25

- Directly bundling a Surge XT or Vital WASM binary would make Rack-25 a GPL distribution of that derived engine and would
  require corresponding source, build scripts, notices, and careful license compliance.
- Vital factory presets cannot be bundled from the upstream project. Rack-25 must continue using original presets for any
  Vital-inspired engine.
- The current metadata should remain `reference-only` for `Surge Hybrid` and `Wavetable Drift`.
- The existing actual-engine integrations remain the practical browser-native route for this app right now:
  - DX-style engines: vendored/adapted `dx7-synth-js`.
  - Tiny GM: direct `webaudio-tinysynth`.
  - Warm Analog, FM Bells, Drum Synth Kit: direct Tone.js engines.

## Future Implementation Path

If exact Surge XT or Vital DSP becomes a hard requirement, treat it as a separate engine-port project:

1. Create a separate `rack25-native-engines` workspace.
2. Produce a minimal headless DSP build without native UI, plugin wrappers, networking, auth, or bundled presets.
3. Compile with Emscripten to a deterministic WASM module.
4. Wrap the WASM module in an `AudioWorkletProcessor`; keep the React app communicating over `AudioParam` automation and
   structured note/control messages.
5. Add explicit GPL source distribution, notices, and reproducible build instructions for the generated WASM artifact.
6. Run browser CPU, memory, note-stealing, denormal, sample-rate, and offline-render tests before enabling it in the UI.

## Recommendation

Phase 4 should close as a feasibility/documentation phase. The next implementation work with the highest return is to
lazy-load the existing actual engine integrations so the app keeps the real engines already added while reducing the main
bundle cost.
