import type { Preset } from "../types";

const gmPrograms = [
  "Acoustic Grand", "Bright Grand", "Electric Grand", "Honky Tonk", "Electric Piano 1", "Electric Piano 2", "Harpsichord", "Clavinet",
  "Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular Bells", "Dulcimer",
  "Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ", "Reed Organ", "Accordion", "Harmonica", "Tango Accordion",
  "Nylon Guitar", "Steel Guitar", "Jazz Guitar", "Clean Guitar", "Muted Guitar", "Overdrive Guitar", "Distortion Guitar", "Guitar Harmonics",
  "Acoustic Bass", "Finger Bass", "Pick Bass", "Fretless Bass", "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2",
  "Violin", "Viola", "Cello", "Contrabass", "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani",
  "String Ensemble 1", "String Ensemble 2", "Synth Strings 1", "Synth Strings 2", "Choir Aahs", "Voice Oohs", "Synth Voice", "Orchestra Hit",
  "Trumpet", "Trombone", "Tuba", "Muted Trumpet", "French Horn", "Brass Section", "Synth Brass 1", "Synth Brass 2",
  "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon", "Clarinet",
  "Piccolo", "Flute", "Recorder", "Pan Flute", "Blown Bottle", "Shakuhachi", "Whistle", "Ocarina",
  "Square Lead", "Saw Lead", "Calliope Lead", "Chiff Lead", "Charang Lead", "Voice Lead", "Fifths Lead", "Bass + Lead",
  "New Age Pad", "Warm Pad", "Polysynth Pad", "Choir Pad", "Bowed Pad", "Metallic Pad", "Halo Pad", "Sweep Pad",
  "Rain FX", "Soundtrack FX", "Crystal FX", "Atmosphere FX", "Brightness FX", "Goblins FX", "Echoes FX", "Sci-Fi FX",
  "Sitar", "Banjo", "Shamisen", "Koto", "Kalimba", "Bagpipe", "Fiddle", "Shanai",
  "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal",
  "Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet", "Telephone Ring", "Helicopter", "Applause", "Gunshot"
];

const tagForProgram = (program: number) => {
  if (program < 8) return ["Keys", "Piano"];
  if (program < 16) return ["Keys", "Mallet"];
  if (program < 24) return ["Keys", "Organ"];
  if (program < 32) return ["Guitar", "Plucked"];
  if (program < 40) return ["Bass", "Low"];
  if (program < 56) return ["Pad", "Orchestral"];
  if (program < 64) return ["Lead", "Brass"];
  if (program < 72) return ["Lead", "Reed"];
  if (program < 80) return ["Lead", "Pipe"];
  if (program < 88) return ["Lead", "Synth"];
  if (program < 96) return ["Pad", "Synth"];
  if (program < 104) return ["Texture", "FX"];
  if (program < 112) return ["Plucked", "World"];
  if (program < 120) return ["Percussion", "GM"];
  return ["Texture", "FX"];
};

const paramsForProgram = (program: number): Record<string, number> => {
  const section = Math.floor(program / 8);
  const slot = program % 8;
  const bright = slot / 7;
  const sustained = [5, 6, 7, 8, 9, 11].includes(section);
  const bass = section === 4;
  const percussive = section === 1 || section === 14;
  const fx = section === 12 || section === 15;
  return {
    gmProgram: program,
    level: bass ? 0.72 : fx ? 0.58 : 0.62,
    shape: Number(Math.min(0.98, 0.06 + section * 0.12 + bright * 0.08).toFixed(3)),
    detune: sustained ? 8 + slot : fx ? 10 + slot * 2 : slot,
    cutoff: Math.round((bass ? 900 : fx ? 1400 : 1700) + bright * 4200 + Math.min(section, 9) * 290),
    resonance: Number((0.8 + bright * (fx ? 3.4 : 2.4)).toFixed(2)),
    attack: sustained ? Number((0.035 + bright * 0.18).toFixed(3)) : 0.006,
    decay: bass ? 0.42 : fx ? Number((0.55 + slot * 0.08).toFixed(3)) : Number((0.18 + slot * 0.045).toFixed(3)),
    sustain: sustained ? 0.72 : bass ? 0.42 : percussive ? 0.24 : 0.56,
    release: sustained || fx ? Number((0.7 + bright * 1.2).toFixed(3)) : Number((0.18 + bright * 0.38).toFixed(3)),
    motion: Number((fx ? 0.46 + bright * 0.32 : sustained ? 0.22 + bright * 0.22 : bright * 0.12).toFixed(3)),
    bite: Number((section === 3 ? 0.28 + bright * 0.26 : section === 7 || section === 10 ? 0.24 + bright * 0.32 : fx ? 0.34 + bright * 0.44 : bright * 0.18).toFixed(3)),
    space: Number((fx ? 0.42 + bright * 0.22 : sustained ? 0.28 + bright * 0.18 : 0.12 + bright * 0.1).toFixed(3)),
    width: Number((fx ? 0.6 + bright * 0.28 : sustained ? 0.52 + bright * 0.24 : 0.34 + bright * 0.18).toFixed(3)),
    punch: Number((bass ? 0.66 : percussive ? 0.62 + bright * 0.18 : section < 4 ? 0.42 + bright * 0.22 : 0.32 + bright * 0.12).toFixed(3))
  };
};

export const tinyGmPresets: Preset[] = gmPrograms.map((name, program) => {
  const parameters = paramsForProgram(program);
  return {
    id: `tiny-gm-gm-${String(program + 1).padStart(3, "0")}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    schemaVersion: 1,
    engineId: "tiny-gm",
    name: `${name} (GM ${program + 1})`,
    author: "Rack-25 Tiny GM Bank",
    source: "built-in",
    tags: ["GM", ...tagForProgram(program)],
    parameters,
    macros: {
      tone: Number(Math.min(1, parameters.cutoff / 9000).toFixed(2)),
      shape: parameters.shape,
      motion: parameters.motion,
      bite: parameters.bite
    }
  };
});
