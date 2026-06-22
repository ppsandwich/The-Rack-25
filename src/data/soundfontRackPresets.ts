import type { Preset } from "../types";

const soundfontPrograms = [
  "accordion",
  "acoustic_bass",
  "acoustic_grand_piano",
  "acoustic_guitar_nylon",
  "acoustic_guitar_steel",
  "agogo",
  "alto_sax",
  "applause",
  "bagpipe",
  "banjo",
  "baritone_sax",
  "bassoon",
  "bird_tweet",
  "blown_bottle",
  "brass_section",
  "breath_noise",
  "bright_acoustic_piano",
  "celesta",
  "cello",
  "choir_aahs",
  "church_organ",
  "clarinet",
  "clavinet",
  "contrabass",
  "distortion_guitar",
  "drawbar_organ",
  "dulcimer",
  "electric_bass_finger",
  "electric_bass_pick",
  "electric_grand_piano",
  "electric_guitar_clean",
  "electric_guitar_jazz",
  "electric_guitar_muted",
  "electric_piano_1",
  "electric_piano_2",
  "english_horn",
  "fiddle",
  "flute",
  "french_horn",
  "fretless_bass",
  "fx_1_rain",
  "fx_2_soundtrack",
  "fx_3_crystal",
  "fx_4_atmosphere",
  "fx_5_brightness",
  "fx_6_goblins",
  "fx_7_echoes",
  "fx_8_scifi",
  "glockenspiel",
  "guitar_fret_noise",
  "guitar_harmonics",
  "gunshot",
  "harmonica",
  "harpsichord",
  "helicopter",
  "honkytonk_piano",
  "kalimba",
  "koto",
  "lead_1_square",
  "lead_2_sawtooth",
  "lead_3_calliope",
  "lead_4_chiff",
  "lead_5_charang",
  "lead_6_voice",
  "lead_7_fifths",
  "lead_8_bass__lead",
  "marimba",
  "melodic_tom",
  "music_box",
  "muted_trumpet",
  "oboe",
  "ocarina",
  "orchestra_hit",
  "orchestral_harp",
  "overdriven_guitar",
  "pad_1_new_age",
  "pad_2_warm",
  "pad_3_polysynth",
  "pad_4_choir",
  "pad_5_bowed",
  "pad_6_metallic",
  "pad_7_halo",
  "pad_8_sweep",
  "pan_flute",
  "percussive_organ",
  "piccolo",
  "pizzicato_strings",
  "recorder",
  "reed_organ",
  "reverse_cymbal",
  "rock_organ",
  "seashore",
  "shakuhachi",
  "shamisen",
  "shanai",
  "sitar",
  "slap_bass_1",
  "slap_bass_2",
  "soprano_sax",
  "steel_drums",
  "string_ensemble_1",
  "string_ensemble_2",
  "synth_bass_1",
  "synth_bass_2",
  "synth_brass_1",
  "synth_brass_2",
  "synth_choir",
  "synth_drum",
  "synth_strings_1",
  "synth_strings_2",
  "taiko_drum",
  "tango_accordion",
  "telephone_ring",
  "tenor_sax",
  "timpani",
  "tinkle_bell",
  "tremolo_strings",
  "trombone",
  "trumpet",
  "tuba",
  "tubular_bells",
  "vibraphone",
  "viola",
  "violin",
  "voice_oohs",
  "whistle",
  "woodblock",
  "xylophone"
] as const;

const titleCase = (name: string) =>
  name
    .replace(/__/g, " / ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bFx\b/g, "FX");

const tagsForProgram = (name: string) => {
  if (name.includes("piano") || name.includes("harpsichord") || name.includes("clavinet")) return ["Keys"];
  if (name.includes("bass")) return ["Bass"];
  if (name.includes("guitar") || name.includes("banjo") || name.includes("sitar") || name.includes("koto")) return ["Plucked"];
  if (name.includes("string") || ["violin", "viola", "cello", "contrabass"].includes(name)) return ["Orchestral", "Pad"];
  if (name.includes("brass") || ["trumpet", "trombone", "tuba", "french_horn"].includes(name)) return ["Brass"];
  if (name.includes("sax") || ["flute", "clarinet", "oboe", "bassoon", "recorder"].includes(name)) return ["Woodwind"];
  if (name.includes("pad") || name.includes("choir") || name.includes("voice")) return ["Pad"];
  if (name.includes("lead")) return ["Lead"];
  if (name.includes("drum") || name.includes("bell") || name.includes("tom") || name.includes("agogo") || name.includes("woodblock")) return ["Percussion"];
  if (name.startsWith("fx_")) return ["Texture"];
  return ["GM"];
};

const paramsForProgram = (name: string, program: number): Record<string, number> => {
  const bright = (program % 8) / 7;
  const sustained = /string|choir|pad|voice|organ|accordion|harmonica|brass|sax|flute|clarinet|oboe|bassoon|horn|violin|viola|cello/.test(name);
  const percussive = /bell|marimba|xylophone|vibraphone|agogo|woodblock|drum|tom|timpani|harp|pizzicato/.test(name);
  const bass = name.includes("bass") || name === "contrabass" || name === "tuba";
  return {
    soundfontProgram: program,
    level: bass ? 0.72 : 0.64,
    shape: Number((program / Math.max(1, soundfontPrograms.length - 1)).toFixed(3)),
    detune: sustained ? 5 + bright * 8 : 0,
    cutoff: Math.round((bass ? 900 : 1600) + bright * 3900 + (sustained ? 900 : 0)),
    resonance: Number((0.75 + bright * 1.8).toFixed(2)),
    attack: sustained ? Number((0.025 + bright * 0.12).toFixed(3)) : 0.004,
    decay: percussive ? Number((0.22 + bright * 0.4).toFixed(3)) : 0.32,
    sustain: sustained ? 0.76 : percussive ? 0.18 : 0.48,
    release: sustained ? Number((0.64 + bright * 1.05).toFixed(3)) : Number((0.16 + bright * 0.28).toFixed(3)),
    motion: Number((sustained ? 0.22 + bright * 0.18 : bright * 0.1).toFixed(3)),
    bite: Number((name.includes("distortion") || name.includes("overdriven") ? 0.72 : name.includes("lead") ? 0.46 + bright * 0.22 : bright * 0.18).toFixed(3)),
    space: Number((sustained ? 0.3 + bright * 0.18 : 0.14 + bright * 0.1).toFixed(3)),
    width: Number((sustained ? 0.56 + bright * 0.22 : 0.36 + bright * 0.16).toFixed(3)),
    punch: Number((bass ? 0.68 : percussive ? 0.62 : 0.34 + bright * 0.18).toFixed(3))
  };
};

export const soundfontRackPresets: Preset[] = soundfontPrograms.map((name, program) => {
  const parameters = paramsForProgram(name, program);
  return {
    id: `soundfont-rack-fluid-${String(program + 1).padStart(3, "0")}-${name.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    schemaVersion: 1,
    engineId: "soundfont-rack",
    name: `${titleCase(name)} (Fluid ${program + 1})`,
    author: "Rack-25 SoundFont Bank",
    source: "built-in",
    tags: ["SoundFont", ...tagsForProgram(name)],
    parameters,
    macros: {
      tone: Number(Math.min(1, parameters.cutoff / 9000).toFixed(2)),
      shape: parameters.shape,
      motion: parameters.motion,
      bite: parameters.bite
    },
    sourceUrl: "https://github.com/gleitz/midi-js-soundfonts",
    sourceBank: "FluidR3_GM",
    sourceSlot: program + 1
  };
});
