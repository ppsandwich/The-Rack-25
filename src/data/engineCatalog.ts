import type { EngineDefinition, EngineModel, MacroDefinition, ParameterDefinition, Preset } from "../types";
import { dx7OnlinePatches } from "./dx7OnlinePatches";
import { sampledKeysPresets } from "./sampledKeysPresets";
import { soundfontRackPresets } from "./soundfontRackPresets";
import { tinyGmPresets } from "./tinyGmPresets";
import { toneThirdPartyEngineIds, toneThirdPartyPresets } from "./toneThirdPartyPresets";

const sourceLinks: Record<string, { project: string; url: string; licence: string; usage: "direct-dependency" | "adapted-implementation" | "reference-only" | "wasm-candidate"; status: "approved-direct-use" | "approved-adapted-use" | "reference-only"; notes?: string }> = {
  "warm-analog": { project: "Tone.js MonoSynth / PolySynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use" },
  "soft-poly": { project: "Tone.js PolySynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js PolySynth directly for this engine." },
  "mono-furnace": { project: "Tone.js MonoSynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js MonoSynth directly for this engine." },
  "classic-ob": { project: "Tone.js PolySynth / MonoSynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js PolySynth with MonoSynth voices directly for this vintage-style engine." },
  "fm-bells": { project: "Tone.js FMSynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use" },
  "dx-stack": { project: "DX7 Synth JS", url: "https://github.com/mmontag/dx7-synth-js", licence: "MIT", usage: "adapted-implementation", status: "approved-adapted-use" },
  "sampled-keys": { project: "smplr sampled instruments", url: "https://github.com/danigb/smplr", licence: "MIT code; hosted samples have their own source licences", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses smplr's SplendidGrandPiano, ElectricPiano, and Mallet instruments directly. Samples are fetched from the smplr public sample hosts at runtime." },
  "soundfont-rack": { project: "smplr Soundfont", url: "https://github.com/danigb/smplr", licence: "MIT code; hosted samples have their own source licences", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses smplr's Soundfont instrument directly with FluidR3_GM browser-hosted samples loaded on demand." },
  "tiny-gm": { project: "WebAudio TinySynth", url: "https://github.com/g200kg/webaudio-tinysynth", licence: "Apache-2.0", usage: "direct-dependency", status: "approved-direct-use" },
  "chip-arcade": { project: "Tone.js Synth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js Synth directly for this chiptune-style engine." },
  "drum-synth-kit": { project: "Tone.js MembraneSynth / NoiseSynth / MetalSynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use" },
  "karplus-pluck": { project: "Tone.js PluckSynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js PluckSynth directly for Karplus-style string synthesis." },
  "modal-mallets": { project: "Tone.js MetalSynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js MetalSynth directly for struck modal and mallet tones." },
  "open-piano": { project: "Tone.js PolySynth", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js PolySynth directly for the modelled piano-style engine." },
  "granular-cloud": { project: "Tone.js GrainPlayer", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js GrainPlayer directly with an app-generated source buffer." },
  "formant-vox": { project: "Tone.js Synth / Filter", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js Synth and Filter nodes directly for formant shaping." },
  "byte-crusher": { project: "Tone.js Synth / BitCrusher / Distortion", url: "https://github.com/Tonejs/Tone.js", licence: "MIT", usage: "direct-dependency", status: "approved-direct-use", notes: "Rack-25 uses Tone.js Synth, BitCrusher, and Distortion directly." }
};

const baseParams: ParameterDefinition[] = [
  { id: "level", label: "Level", type: "knob", min: 0, max: 1, default: 0.62, step: 0.01, group: "Output", help: "Engine output level before the safety limiter." },
  { id: "shape", label: "Shape", type: "knob", min: 0, max: 1, default: 0.45, step: 0.01, group: "Source", help: "Blends oscillator or tone source character." },
  { id: "detune", label: "Detune", type: "knob", min: 0, max: 35, default: 7, step: 1, unit: "ct", group: "Source", help: "Adds width by detuning a second source." },
  { id: "cutoff", label: "Cutoff", type: "knob", min: 80, max: 9000, default: 2600, step: 1, unit: "Hz", group: "Filter / Tone", help: "Sets the main filter brightness." },
  { id: "resonance", label: "Resonance", type: "knob", min: 0.1, max: 16, default: 1.2, step: 0.1, group: "Filter / Tone", help: "Emphasises frequencies around the cutoff." },
  { id: "attack", label: "Attack", type: "knob", min: 0.001, max: 2.5, default: 0.02, step: 0.001, unit: "s", group: "Envelope", help: "How quickly the note fades in." },
  { id: "decay", label: "Decay", type: "knob", min: 0.01, max: 3, default: 0.24, step: 0.01, unit: "s", group: "Envelope", help: "How quickly the note settles after attack." },
  { id: "sustain", label: "Sustain", type: "knob", min: 0, max: 1, default: 0.58, step: 0.01, group: "Envelope", help: "Held note level." },
  { id: "release", label: "Release", type: "knob", min: 0.02, max: 5, default: 0.65, step: 0.01, unit: "s", group: "Envelope", help: "How long the note fades after release." },
  { id: "motion", label: "Motion", type: "knob", min: 0, max: 1, default: 0.25, step: 0.01, group: "Modulation", help: "Adds slow movement or grain motion." },
  { id: "bite", label: "Bite", type: "knob", min: 0, max: 1, default: 0.2, step: 0.01, group: "Character", help: "Adds grit, FM index, noise, or drive depending on engine." },
  { id: "space", label: "Space", type: "knob", min: 0, max: 1, default: 0.25, step: 0.01, group: "Effects", help: "Engine send to the shared ambience." },
  { id: "width", label: "Width", type: "knob", min: 0, max: 1, default: 0.45, step: 0.01, group: "Output", help: "Perceived stereo width and source spread." },
  { id: "punch", label: "Punch", type: "knob", min: 0, max: 1, default: 0.38, step: 0.01, group: "Envelope", help: "Adds transient emphasis or pluck energy." }
];

const fmExtra: ParameterDefinition[] = [
  { id: "ratio", label: "Ratio", type: "knob", min: 0.25, max: 12, default: 2, step: 0.01, group: "Source", help: "Main modulator frequency ratio. Low ratios make basses and reeds; high ratios make metallic spectra." },
  { id: "index", label: "Index", type: "knob", min: 0, max: 1, default: 0.34, step: 0.01, group: "Source", help: "Overall FM modulation depth." },
  { id: "feedback", label: "Feedback", type: "knob", min: 0, max: 1, default: 0.16, step: 0.01, group: "Character", help: "Adds growl, body, or broken digital edge depending on algorithm." }
];

const dxExtra: ParameterDefinition[] = [
  ...fmExtra,
  { id: "op2", label: "Op 2", type: "knob", min: 0, max: 1, default: 0.42, step: 0.01, group: "Source", help: "Second operator contribution." },
  { id: "op3", label: "Op 3", type: "knob", min: 0, max: 1, default: 0.34, step: 0.01, group: "Source", help: "Third operator contribution." },
  { id: "op4", label: "Op 4", type: "knob", min: 0, max: 1, default: 0.28, step: 0.01, group: "Source", help: "Fourth operator contribution for split or stacked algorithms." },
  { id: "op5", label: "Op 5", type: "knob", min: 0, max: 1, default: 0.2, step: 0.01, group: "Source", help: "Fifth operator contribution for dense digital tones." },
  { id: "op6", label: "Op 6", type: "knob", min: 0, max: 1, default: 0.14, step: 0.01, group: "Source", help: "Sixth operator contribution for upper partials and noise-like edge." },
  { id: "algorithm", label: "Algorithm", type: "knob", min: 1, max: 32, default: 1, step: 1, group: "Source", help: "Selects one of the original Yamaha DX7's 32 six-operator FM algorithms." }
];

const macros = (count = 4): MacroDefinition[] =>
  [
    { id: "tone", label: "Tone", parameterIds: ["cutoff", "resonance"] },
    { id: "shape", label: "Shape", parameterIds: ["shape", "detune"] },
    { id: "motion", label: "Motion", parameterIds: ["motion", "width"] },
    { id: "bite", label: "Bite", parameterIds: ["bite", "punch"] },
    { id: "space", label: "Space", parameterIds: ["space", "release"] },
    { id: "width", label: "Width", parameterIds: ["width", "detune"] },
    { id: "punch", label: "Punch", parameterIds: ["punch", "decay"] },
    { id: "level", label: "Level", parameterIds: ["level"] }
  ].slice(0, count);

const specs: Array<Omit<EngineDefinition, "source" | "parameters" | "macros" | "qaNote"> & { sourceId: string; extras?: ParameterDefinition[]; macroCount?: number }> = [
  { id: "dx-stack", sourceId: "dx-stack", name: "DX Stack", description: "Deeper six-operator FM for complex metallic and percussive sounds.", family: "6-Op FM", tags: ["Keys", "Experimental"], cpu: "Medium", playMode: "poly", polyphony: 8, extras: dxExtra, macroCount: 6, model: { kind: "fm", oscillator: "sine", filter: "bandpass", fmRatio: 3.5 } },
  { id: "fm-bells", sourceId: "fm-bells", name: "FM Bells", description: "Bright bells, glassy plucks, electric keys, and shiny digital pokes.", family: "FM", tags: ["Keys", "Lead"], cpu: "Low", playMode: "poly", polyphony: 8, extras: fmExtra, model: { kind: "fm", oscillator: "sine", filter: "highpass", fmRatio: 2.01 } },
  { id: "tiny-gm", sourceId: "tiny-gm", name: "Tiny GM", description: "Lightweight General MIDI-ish sounds for quick sketches and charming realism.", family: "GM Style", tags: ["Keys", "Lead"], cpu: "Low", playMode: "poly", polyphony: 8, model: { kind: "sampled", oscillator: "square", secondOscillator: "triangle", filter: "lowpass" } },
  { id: "warm-analog", sourceId: "warm-analog", name: "Warm Analog", description: "Classic synth basses, leads, pads, and plucks. Friendly and useful.", family: "Subtractive", tags: ["Bass", "Lead", "Pad"], cpu: "Low", playMode: "poly", polyphony: 8, model: { kind: "analog", oscillator: "sawtooth", secondOscillator: "square", filter: "lowpass" } },
  { id: "soft-poly", sourceId: "soft-poly", name: "Soft Poly", description: "Smooth polyphonic tones with gentle movement for chords and filter sweeps.", family: "Poly Subtractive", tags: ["Pad", "Keys"], cpu: "Medium", playMode: "poly", polyphony: 8, model: { kind: "analog", oscillator: "triangle", secondOscillator: "sawtooth", filter: "lowpass" } },
  { id: "mono-furnace", sourceId: "mono-furnace", name: "Mono Furnace", description: "A chunky mono bass and lead machine with glide, bite, and drive.", family: "Mono Bass", tags: ["Bass", "Lead"], cpu: "Low", playMode: "mono", polyphony: 1, model: { kind: "analog", oscillator: "sawtooth", secondOscillator: "square", filter: "lowpass", drive: 0.45 } },
  { id: "classic-ob", sourceId: "classic-ob", name: "Classic OB", description: "Wide vintage-inspired brass, pads, and big open filter sounds.", family: "Vintage Poly", tags: ["Pad", "Keys"], cpu: "Medium", playMode: "poly", polyphony: 8, model: { kind: "analog", oscillator: "sawtooth", secondOscillator: "sawtooth", filter: "lowpass" } },
  { id: "sampled-keys", sourceId: "sampled-keys", name: "Sampled Keys", description: "smplr acoustic piano, electric piano, and mallet instruments with real sample playback.", family: "Sample Style", tags: ["Keys"], cpu: "Low", playMode: "poly", polyphony: 8, model: { kind: "sampled", oscillator: "triangle", secondOscillator: "sine", filter: "lowpass" } },
  { id: "soundfont-rack", sourceId: "soundfont-rack", name: "SoundFont Rack", description: "smplr Soundfont playback for bread-and-butter GM-style sketch sounds.", family: "GM Style", tags: ["Keys", "Pad"], cpu: "Low", playMode: "poly", polyphony: 8, model: { kind: "sampled", oscillator: "sine", secondOscillator: "square", filter: "lowpass" } },
  { id: "chip-arcade", sourceId: "chip-arcade", name: "Chip Arcade", description: "Square waves, triangle basses, noise hits, and small heroic bleeping.", family: "Chiptune", tags: ["Lead", "Bass", "Percussion"], cpu: "Low", playMode: "poly", polyphony: 8, model: { kind: "chip", oscillator: "square", secondOscillator: "triangle", filter: "lowpass" } },
  { id: "drum-synth-kit", sourceId: "drum-synth-kit", name: "Drum Synth Kit", description: "Playable synthetic drums mapped across the keyboard.", family: "Drums", tags: ["Percussion"], cpu: "Low", playMode: "drum-map", polyphony: 12, model: { kind: "drum", oscillator: "sine", filter: "lowpass", noiseLevel: 0.8 } },
  { id: "karplus-pluck", sourceId: "karplus-pluck", name: "Karplus Pluck", description: "Plucked strings, harps, kotos, rubber bands, and resonant twangs.", family: "Physical Modelling", tags: ["Keys", "Experimental"], cpu: "Medium", playMode: "poly", polyphony: 8, model: { kind: "pluck", oscillator: "triangle", filter: "lowpass" } },
  { id: "modal-mallets", sourceId: "modal-mallets", name: "Modal Mallets", description: "Tuned percussion, bowls, kalimbas, marimbas, and struck-object sounds.", family: "Modal", tags: ["Keys", "Percussion"], cpu: "Medium", playMode: "poly", polyphony: 8, model: { kind: "modal", oscillator: "sine", filter: "bandpass", harmonicCount: 5 } },
  { id: "open-piano", sourceId: "open-piano", name: "Open Piano", description: "Lightweight modelled piano-like tones with expressive decay and tone controls.", family: "Modelled Keys", tags: ["Keys"], cpu: "Medium", playMode: "poly", polyphony: 8, model: { kind: "modal", oscillator: "triangle", filter: "lowpass", harmonicCount: 4 } },
  { id: "granular-cloud", sourceId: "granular-cloud", name: "Granular Cloud", description: "Clouds, sprays, frozen textures, ambient smears, and microscopic chaos.", family: "Granular", tags: ["Texture", "Experimental"], cpu: "High", playMode: "texture", polyphony: 8, model: { kind: "granular", oscillator: "sine", secondOscillator: "sawtooth", filter: "bandpass", noiseLevel: 0.45 } },
  { id: "formant-vox", sourceId: "formant-vox", name: "Formant Vox", description: "Vowel pads, robot choirs, talking leads, and synthetic voice-like movement.", family: "Formant", tags: ["Pad", "Lead", "Texture"], cpu: "Medium", playMode: "poly", polyphony: 8, model: { kind: "formant", oscillator: "sawtooth", filter: "bandpass" } },
  { id: "byte-crusher", sourceId: "byte-crusher", name: "Byte Crusher", description: "Crunchy digital leads, broken toys, and intentional browser noises.", family: "Digital Degradation", tags: ["Lead", "Bass", "Experimental"], cpu: "Low", playMode: "poly", polyphony: 8, model: { kind: "crusher", oscillator: "square", secondOscillator: "sawtooth", filter: "lowpass", drive: 0.8 } }
];

export const engines: EngineDefinition[] = specs.map((spec) => {
  const source = sourceLinks[spec.sourceId];
  return {
    ...spec,
    source: {
      engineId: spec.id,
      sourceProjectName: source.project,
      sourceUrl: source.url,
      sourceLicence: source.licence,
      usageStrategy: source.usage,
      licenceStatus: source.status,
      attributionRequired: true,
      presetContentAllowed: false,
      sampleContentAllowed: false,
      notes: source.notes ?? "Rack-25 uses original app-owned presets and a clean browser-native Web Audio implementation for MVP."
    },
    parameters: [...baseParams, ...(spec.extras ?? [])],
    macros: macros(spec.macroCount ?? 4),
    qaNote: `${spec.name} should read as ${spec.family.toLowerCase()} with controlled level, clean note release, and a distinct preset range.`
  };
});

const presetNames = ["Init", "Pocket Bass", "Ribbon Lead", "Felt Pad", "Bright Keys", "Soft Corner", "Odd Visitor", "Showcase", "Late Glow"];
const tagFor = (i: number) => ["Init", "Bass", "Lead", "Pad", "Keys", "Soft", "Weird", "Showcase", "Texture"][i] ?? "Patch";

const rackGeneratedPresets: Preset[] = engines.flatMap((engine) =>
  presetNames.slice(0, 8).map((name, i) => {
    const params: Record<string, number> = {};
    engine.parameters.forEach((param, pIndex) => {
      const span = param.max - param.min;
      const wobble = (((i + 1) * (pIndex + 3)) % 9) / 10;
      let value = param.default + (wobble - 0.45) * span * 0.28;
      if (name === "Init") value = param.default;
      if (param.id === "attack" && engine.tags.includes("Pad")) value = i === 0 ? 0.05 : 0.2 + i * 0.12;
      if (param.id === "release" && (engine.tags.includes("Pad") || engine.tags.includes("Texture"))) value = i === 0 ? param.default : 1 + i * 0.35;
      if (param.id === "cutoff" && ["FM", "6-Op FM", "Digital Degradation"].includes(engine.family)) value = 700 + i * 920;
      if (param.id === "bite" && ["FM", "6-Op FM", "Digital Degradation", "Chiptune"].includes(engine.family)) value = Math.min(1, 0.08 + i * 0.1);
      if (["FM", "6-Op FM"].includes(engine.family)) {
        if (param.id === "ratio") value = [0.5, 0.75, 1, 1.5, 2.01, 3, 5.02, 8][i] ?? param.default;
        if (param.id === "index") value = [0.18, 0.32, 0.5, 0.22, 0.42, 0.12, 0.78, 0.62][i] ?? param.default;
        if (param.id === "algorithm") value = [1, 5, 8, 12, 16, 21, 27, 32][i] ?? param.default;
        if (param.id === "feedback") value = [0.08, 0.18, 0.28, 0.06, 0.16, 0.04, 0.72, 0.44][i] ?? param.default;
        if (param.id === "op2") value = [0.22, 0.36, 0.5, 0.24, 0.44, 0.16, 0.74, 0.58][i] ?? param.default;
        if (param.id === "op3") value = [0.1, 0.24, 0.42, 0.18, 0.38, 0.12, 0.7, 0.5][i] ?? param.default;
        if (param.id === "op4") value = [0.06, 0.18, 0.32, 0.2, 0.46, 0.08, 0.6, 0.44][i] ?? param.default;
        if (param.id === "op5") value = [0.02, 0.12, 0.24, 0.18, 0.34, 0.04, 0.46, 0.36][i] ?? param.default;
        if (param.id === "op6") value = [0, 0.08, 0.18, 0.1, 0.26, 0.02, 0.38, 0.28][i] ?? param.default;
        if (param.id === "attack") value = [0.005, 0.01, 0.025, 0.45, 0.012, 0.18, 0.004, 0.035][i] ?? param.default;
        if (param.id === "decay") value = [0.18, 0.7, 0.38, 1.7, 0.42, 1.2, 0.12, 0.58][i] ?? param.default;
        if (param.id === "sustain") value = [0.18, 0.44, 0.62, 0.68, 0.34, 0.55, 0.04, 0.48][i] ?? param.default;
        if (param.id === "release") value = [0.18, 0.5, 0.42, 2.6, 0.46, 1.8, 0.16, 0.82][i] ?? param.default;
      }
      params[param.id] = Number(Math.min(param.max, Math.max(param.min, value)).toFixed(3));
    });
    const macros = Object.fromEntries(engine.macros.map((macro, m) => [macro.id, Number(Math.min(1, 0.22 + ((i + m) % 6) * 0.12).toFixed(2))]));
    return {
      id: `${engine.id}-${name.toLowerCase().replace(/\s+/g, "-")}`,
      schemaVersion: 1,
      engineId: engine.id,
      name: name === "Init" ? `Init: ${engine.name}` : `${name} ${engine.name.split(" ")[0]}`,
      author: "Rack-25",
      source: "built-in" as const,
      tags: [tagFor(i), engine.family],
      parameters: params,
      macros
    };
  })
);

const dx7PatchesWithDxStackDefault = [
  ...dx7OnlinePatches.filter((preset) => preset.engineId === "dx-stack" && preset.name.startsWith("E.PIANO 1")),
  ...dx7OnlinePatches.filter((preset) => preset.engineId === "dx-stack" && !preset.name.startsWith("E.PIANO 1"))
];

export const builtInPresets: Preset[] = [
  ...rackGeneratedPresets.filter((preset) => !["tiny-gm", "dx-stack", "soundfont-rack", "sampled-keys"].includes(preset.engineId) && !toneThirdPartyEngineIds.has(preset.engineId)),
  ...tinyGmPresets,
  ...soundfontRackPresets,
  ...sampledKeysPresets,
  ...toneThirdPartyPresets,
  ...dx7PatchesWithDxStackDefault
];

export const getDefaultPreset = (engineId: string) => {
  if (engineId === "warm-analog") {
    return builtInPresets.find((preset) => preset.engineId === engineId && preset.name.startsWith("Cool Guy"))!;
  }
  return builtInPresets.find((preset) => preset.engineId === engineId)!;
};
