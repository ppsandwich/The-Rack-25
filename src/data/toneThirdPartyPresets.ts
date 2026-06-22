import type { Preset } from "../types";

type ToneSourcePreset = {
  family: "AMSynth" | "FMSynth" | "MonoSynth" | "NoiseSynth" | "Synth";
  name: string;
  oscillator?: string;
  filterType?: string;
  filterQ?: number;
  baseFrequency?: number;
  harmonicity?: number;
  modulationIndex?: number;
  noiseType?: string;
  envelope: { attack: number; decay: number; sustain: number; release: number };
};

const tonePresetSources: ToneSourcePreset[] = [
  { family: "AMSynth", name: "Harmonics", oscillator: "square", harmonicity: 3.999, envelope: { attack: 0.03, decay: 0.3, sustain: 0.7, release: 0.8 } },
  { family: "AMSynth", name: "Tiny", oscillator: "amsine2", harmonicity: 2, envelope: { attack: 0.006, decay: 4, sustain: 0.04, release: 1.2 } },
  { family: "FMSynth", name: "Electric Cello", oscillator: "triangle", harmonicity: 3.01, modulationIndex: 14, envelope: { attack: 0.2, decay: 0.3, sustain: 0.1, release: 1.2 } },
  { family: "FMSynth", name: "Kalimba", oscillator: "sine", harmonicity: 8, modulationIndex: 2, envelope: { attack: 0.001, decay: 2, sustain: 0.1, release: 2 } },
  { family: "FMSynth", name: "Thin Saws", oscillator: "fmsawtooth", harmonicity: 0.5, modulationIndex: 1.2, envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 1.2 } },
  { family: "MonoSynth", name: "Bah", oscillator: "sawtooth", filterType: "bandpass", filterQ: 2, baseFrequency: 20, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.6 } },
  { family: "MonoSynth", name: "Bass Guitar", oscillator: "fmsquare5", filterType: "lowpass", filterQ: 1, baseFrequency: 50, envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 2 } },
  { family: "MonoSynth", name: "Bassy", oscillator: "partials", filterType: "lowpass", filterQ: 4, baseFrequency: 50, envelope: { attack: 0.04, decay: 0.06, sustain: 0.4, release: 1 } },
  { family: "MonoSynth", name: "Brass Circuit", oscillator: "sawtooth", filterType: "lowpass", filterQ: 2, baseFrequency: 2000, envelope: { attack: 0.1, decay: 0.1, sustain: 0.6, release: 0.5 } },
  { family: "MonoSynth", name: "Cool Guy", oscillator: "pwm", filterType: "lowpass", filterQ: 6, baseFrequency: 20, envelope: { attack: 0.025, decay: 0.3, sustain: 0.9, release: 2 } },
  { family: "MonoSynth", name: "Pianoetta", oscillator: "square", filterType: "lowpass", filterQ: 2, baseFrequency: 700, envelope: { attack: 0.005, decay: 3, sustain: 0, release: 0.45 } },
  { family: "MonoSynth", name: "Pizz", oscillator: "sawtooth", filterType: "highpass", filterQ: 3, baseFrequency: 800, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.9 } },
  { family: "NoiseSynth", name: "Gravel", noiseType: "pink", envelope: { attack: 0.5, decay: 2, sustain: 0.5, release: 3 } },
  { family: "NoiseSynth", name: "Slap", noiseType: "white", envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 } },
  { family: "NoiseSynth", name: "Swoosh", noiseType: "white", envelope: { attack: 0.3, decay: 0.2, sustain: 0, release: 0.2 } },
  { family: "NoiseSynth", name: "Train", noiseType: "pink", envelope: { attack: 1, decay: 0.3, sustain: 1, release: 1 } },
  { family: "Synth", name: "Alien Chorus", oscillator: "fatsine4", envelope: { attack: 0.4, decay: 0.01, sustain: 1, release: 0.4 } },
  { family: "Synth", name: "Delicate Wind Part", oscillator: "square4", envelope: { attack: 2, decay: 1, sustain: 0.2, release: 2 } },
  { family: "Synth", name: "Drop Pulse", oscillator: "pulse", envelope: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.4 } },
  { family: "Synth", name: "Lectric", oscillator: "sawtooth", envelope: { attack: 0.03, decay: 0.1, sustain: 0.2, release: 0.02 } },
  { family: "Synth", name: "Marimba", oscillator: "partials", envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 1.2 } },
  { family: "Synth", name: "Steelpan", oscillator: "fatcustom", envelope: { attack: 0.001, decay: 1.6, sustain: 0, release: 1.6 } },
  { family: "Synth", name: "Super Saw", oscillator: "fatsawtooth", envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 } },
  { family: "Synth", name: "Tree Trunk", oscillator: "sine", envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 1.2 } }
];

const toneEngineIds = [
  "warm-analog",
  "soft-poly",
  "mono-furnace",
  "classic-ob",
  "fm-bells",
  "chip-arcade",
  "drum-synth-kit",
  "karplus-pluck",
  "modal-mallets",
  "open-piano",
  "granular-cloud",
  "formant-vox",
  "byte-crusher"
] as const;

const toneEngineNames: Record<(typeof toneEngineIds)[number], string> = {
  "warm-analog": "Warm Analog",
  "soft-poly": "Soft Poly",
  "mono-furnace": "Mono Furnace",
  "classic-ob": "Classic OB",
  "fm-bells": "FM Bells",
  "chip-arcade": "Chip Arcade",
  "drum-synth-kit": "Drum Synth Kit",
  "karplus-pluck": "Karplus Pluck",
  "modal-mallets": "Modal Mallets",
  "open-piano": "Open Piano",
  "granular-cloud": "Granular Cloud",
  "formant-vox": "Formant Vox",
  "byte-crusher": "Byte Crusher"
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 3) => Number(value.toFixed(digits));

const shapeForOsc = (oscillator = "", family: ToneSourcePreset["family"]) => {
  if (oscillator.includes("sine")) return 0.12;
  if (oscillator.includes("triangle")) return 0.28;
  if (oscillator.includes("saw")) return 0.72;
  if (oscillator.includes("square") || oscillator.includes("pulse") || oscillator.includes("pwm")) return 0.88;
  if (oscillator.includes("custom") || oscillator === "partials") return 0.55;
  return family === "NoiseSynth" ? 0.95 : 0.45;
};

const paramsForSource = (source: ToneSourcePreset, engineId: (typeof toneEngineIds)[number], index: number): Record<string, number> => {
  const env = source.envelope;
  const familyOffset = ["AMSynth", "FMSynth", "MonoSynth", "NoiseSynth", "Synth"].indexOf(source.family) / 5;
  const isPercussiveEngine = ["drum-synth-kit", "modal-mallets", "karplus-pluck", "open-piano"].includes(engineId);
  const isTextureEngine = ["granular-cloud", "formant-vox", "byte-crusher"].includes(engineId);
  const bright = clamp((source.baseFrequency ?? 900 + index * 260) / 9000, 0, 1);
  const toneShape = shapeForOsc(source.oscillator, source.family);
  const bite = clamp((source.modulationIndex ?? source.filterQ ?? (source.family === "NoiseSynth" ? 8 : index % 8)) / 16, 0, 1);

  const params: Record<string, number> = {
    tonePresetProgram: index,
    level: engineId === "mono-furnace" ? 0.7 : engineId === "drum-synth-kit" ? 0.66 : 0.62,
    shape: round(clamp(toneShape * 0.76 + familyOffset * 0.24, 0, 1)),
    detune: round(clamp((source.oscillator?.startsWith("fat") ? 18 : source.family === "AMSynth" ? 10 : index % 9), 0, 35), 2),
    cutoff: Math.round(clamp((source.baseFrequency ?? 850 + index * 310) * (isTextureEngine ? 1.5 : 1), 80, 9000)),
    resonance: round(clamp(source.filterQ ?? 0.8 + bite * 8, 0.1, 16), 2),
    attack: round(clamp(env.attack * (isPercussiveEngine ? 0.35 : 1), 0.001, 2.5)),
    decay: round(clamp(env.decay * (isPercussiveEngine ? 0.7 : 1), 0.01, 3)),
    sustain: round(clamp(isPercussiveEngine ? env.sustain * 0.55 : env.sustain, 0, 1)),
    release: round(clamp(env.release * (isTextureEngine ? 1.2 : 1), 0.02, 5)),
    motion: round(clamp(source.family === "NoiseSynth" ? 0.58 + index * 0.015 : env.attack / 2.5 + familyOffset * 0.2, 0, 1)),
    bite: round(clamp(engineId === "byte-crusher" ? 0.35 + bite * 0.65 : bite, 0, 1)),
    space: round(clamp(env.release / 4 + (isTextureEngine ? 0.22 : 0.08), 0, 1)),
    width: round(clamp(source.oscillator?.startsWith("fat") ? 0.78 : 0.36 + familyOffset * 0.3, 0, 1)),
    punch: round(clamp(isPercussiveEngine ? 0.54 + (1 - env.attack) * 0.28 : 0.28 + (1 - env.sustain) * 0.26, 0, 1))
  };

  if (engineId === "fm-bells") {
    params.ratio = round(clamp(source.harmonicity ?? 1 + toneShape * 6, 0.25, 12), 2);
    params.index = round(clamp((source.modulationIndex ?? bite * 12) / 18, 0, 1));
    params.feedback = round(clamp((source.filterQ ?? index % 7) / 10, 0, 1));
  }

  if (engineId === "karplus-pluck") {
    params.sustain = round(clamp(0.22 + env.sustain * 0.45, 0, 1));
    params.release = round(clamp(0.12 + env.release * 0.45, 0.02, 5));
  }

  if (engineId === "granular-cloud") {
    params.motion = round(clamp(0.48 + env.attack / 4, 0, 1));
    params.release = round(clamp(1.2 + env.release * 0.7, 0.02, 5));
  }

  return params;
};

export const toneThirdPartyPresets: Preset[] = toneEngineIds.flatMap((engineId) =>
  tonePresetSources.map((source, index) => {
    const parameters = paramsForSource(source, engineId, index);
    const slug = `${source.family}-${source.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {
      id: `${engineId}-tonejs-presets-${String(index + 1).padStart(3, "0")}-${slug}`,
      schemaVersion: 1,
      engineId,
      name: `${source.name} ${toneEngineNames[engineId]}`,
      author: "Tonejs/Presets",
      source: "built-in" as const,
      tags: ["Tonejs/Presets", source.family],
      parameters,
      macros: {
        tone: round(clamp(parameters.cutoff / 9000, 0, 1), 2),
        shape: round(parameters.shape, 2),
        motion: round(parameters.motion, 2),
        bite: round(parameters.bite, 2)
      },
      sourceUrl: `https://github.com/Tonejs/Presets/tree/gh-pages/instrument/${source.family}`,
      sourceBank: "Tonejs/Presets gh-pages",
      sourceSlot: index + 1
    };
  })
);

export const toneThirdPartyEngineIds = new Set<string>(toneEngineIds);
