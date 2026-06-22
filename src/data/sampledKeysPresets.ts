import type { Preset } from "../types";

const sampledKeysPrograms = [
  { kind: "piano", instrument: "Splendid Grand Piano", name: "Splendid Grand Piano" },
  { kind: "electric", instrument: "CP80", name: "CP80 Electric Grand" },
  { kind: "electric", instrument: "PianetT", name: "Pianet T" },
  { kind: "electric", instrument: "WurlitzerEP200", name: "Wurlitzer EP200" },
  { kind: "electric", instrument: "TX81Z", name: "TX81Z FM Piano" },
  { kind: "mallet", instrument: "Balafon - Hard Mallet", name: "Balafon Hard Mallet" },
  { kind: "mallet", instrument: "Balafon - Keyswitch", name: "Balafon Keyswitch" },
  { kind: "mallet", instrument: "Balafon - Soft Mallet", name: "Balafon Soft Mallet" },
  { kind: "mallet", instrument: "Balafon - Traditional Mallet", name: "Balafon Traditional Mallet" },
  { kind: "mallet", instrument: "Tubular Bells 1", name: "Tubular Bells 1" },
  { kind: "mallet", instrument: "Tubular Bells 2", name: "Tubular Bells 2" },
  { kind: "mallet", instrument: "Vibraphone - Bowed", name: "Bowed Vibraphone" },
  { kind: "mallet", instrument: "Vibraphone - Hard Mallets", name: "Hard Vibraphone" },
  { kind: "mallet", instrument: "Vibraphone - Keyswitch", name: "Vibraphone Keyswitch" },
  { kind: "mallet", instrument: "Vibraphone - Soft Mallets", name: "Soft Vibraphone" },
  { kind: "mallet", instrument: "Xylophone - Hard Mallets", name: "Hard Xylophone" },
  { kind: "mallet", instrument: "Xylophone - Keyswitch", name: "Xylophone Keyswitch" },
  { kind: "mallet", instrument: "Xylophone - Medium Mallets", name: "Medium Xylophone" },
  { kind: "mallet", instrument: "Xylophone - Soft Mallets", name: "Soft Xylophone" },
  { kind: "mellotron", instrument: "300 STRINGS CELLO", name: "300 Strings Cello" },
  { kind: "mellotron", instrument: "300 STRINGS VIOLA", name: "300 Strings Viola" },
  { kind: "mellotron", instrument: "8VOICE CHOIR", name: "8 Voice Choir" },
  { kind: "mellotron", instrument: "BASSA+STRNGS", name: "Bassa + Strings" },
  { kind: "mellotron", instrument: "BOYS CHOIR", name: "Boys Choir" },
  { kind: "mellotron", instrument: "CHA CHA FLT", name: "Cha Cha Flute" },
  { kind: "mellotron", instrument: "CHM CLARINET", name: "Chamberlin Clarinet" },
  { kind: "mellotron", instrument: "CHMB 3 VLNS", name: "Chamberlin 3 Violins" },
  { kind: "mellotron", instrument: "CHMB ALTOSAX", name: "Chamberlin Alto Sax" },
  { kind: "mellotron", instrument: "CHMB FEMALE", name: "Chamberlin Female Voice" },
  { kind: "mellotron", instrument: "CHMB MALE VC", name: "Chamberlin Male Voice" },
  { kind: "mellotron", instrument: "CHMB TNR SAX", name: "Chamberlin Tenor Sax" },
  { kind: "mellotron", instrument: "CHMB TRMBONE", name: "Chamberlin Trombone" },
  { kind: "mellotron", instrument: "CHMB TRUMPET", name: "Chamberlin Trumpet" },
  { kind: "mellotron", instrument: "CHMBLN CELLO", name: "Chamberlin Cello" },
  { kind: "mellotron", instrument: "CHMBLN FLUTE", name: "Chamberlin Flute" },
  { kind: "mellotron", instrument: "CHMBLN OBOE", name: "Chamberlin Oboe" },
  { kind: "mellotron", instrument: "DIXIE+TRMBN", name: "Dixie + Trombone" },
  { kind: "mellotron", instrument: "FOXTROT+SAX", name: "Foxtrot + Sax" },
  { kind: "mellotron", instrument: "HALFSP.BRASS", name: "Half-Speed Brass" },
  { kind: "mellotron", instrument: "MIXED STRGS", name: "Mixed Strings" },
  { kind: "mellotron", instrument: "MKII BRASS", name: "MkII Brass" },
  { kind: "mellotron", instrument: "MKII GUITAR", name: "MkII Guitar" },
  { kind: "mellotron", instrument: "MKII ORGAN", name: "MkII Organ" },
  { kind: "mellotron", instrument: "MKII SAX", name: "MkII Sax" },
  { kind: "mellotron", instrument: "MKII VIBES", name: "MkII Vibes" },
  { kind: "mellotron", instrument: "MKII VIOLINS", name: "MkII Violins" },
  { kind: "mellotron", instrument: "MOVE BS+STGS", name: "Moving Bass + Strings" },
  { kind: "mellotron", instrument: "STRGS+BRASS", name: "Strings + Brass" },
  { kind: "mellotron", instrument: "TROMB+TRMPT", name: "Trombone + Trumpet" },
  { kind: "mellotron", instrument: "TRON 16VLNS", name: "Tron 16 Violins" },
  { kind: "mellotron", instrument: "TRON CELLO", name: "Tron Cello" },
  { kind: "mellotron", instrument: "TRON FLUTE", name: "Tron Flute" },
  { kind: "mellotron", instrument: "TRON VIOLA", name: "Tron Viola" }
] as const;

const tagsForProgram = (kind: string, name: string) => {
  if (kind === "piano" || kind === "electric") return ["Keys"];
  if (kind === "mallet") return ["Mallet", "Percussion"];
  if (/choir|voice|strings|viola|violins|cello|brass/i.test(name)) return ["Mellotron", "Pad"];
  return ["Mellotron"];
};

const paramsForProgram = (kind: string, program: number): Record<string, number> => {
  const bright = (program % 9) / 8;
  const mallet = kind === "mallet";
  const tape = kind === "mellotron";
  return {
    sampledKeysProgram: program,
    level: tape ? 0.66 : 0.62,
    shape: Number((program / Math.max(1, sampledKeysPrograms.length - 1)).toFixed(3)),
    detune: tape ? Number((4 + bright * 8).toFixed(2)) : kind === "electric" ? Number((bright * 5).toFixed(2)) : 0,
    cutoff: Math.round(mallet ? 2600 + bright * 4200 : tape ? 1800 + bright * 3400 : 2200 + bright * 3600),
    resonance: Number((0.7 + bright * 1.6).toFixed(2)),
    attack: tape ? Number((0.025 + bright * 0.12).toFixed(3)) : 0.004,
    decay: mallet ? Number((0.28 + bright * 0.55).toFixed(3)) : 0.34,
    sustain: tape ? 0.78 : mallet ? 0.16 : 0.52,
    release: tape ? Number((0.82 + bright * 1.3).toFixed(3)) : mallet ? Number((0.18 + bright * 0.32).toFixed(3)) : Number((0.28 + bright * 0.45).toFixed(3)),
    motion: Number((tape ? 0.26 + bright * 0.22 : bright * 0.12).toFixed(3)),
    bite: Number((kind === "electric" ? 0.18 + bright * 0.34 : mallet ? 0.2 + bright * 0.28 : 0.08 + bright * 0.18).toFixed(3)),
    space: Number((tape ? 0.34 + bright * 0.18 : 0.16 + bright * 0.12).toFixed(3)),
    width: Number((tape ? 0.6 + bright * 0.2 : 0.38 + bright * 0.2).toFixed(3)),
    punch: Number((mallet ? 0.64 + bright * 0.2 : kind === "electric" ? 0.48 + bright * 0.18 : 0.36).toFixed(3))
  };
};

export const sampledKeysPresets: Preset[] = sampledKeysPrograms.map((program, index) => {
  const parameters = paramsForProgram(program.kind, index);
  return {
    id: `sampled-keys-smplr-${String(index + 1).padStart(3, "0")}-${program.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    schemaVersion: 1,
    engineId: "sampled-keys",
    name: `${program.name} (smplr ${index + 1})`,
    author: "Rack-25 smplr Bank",
    source: "built-in",
    tags: ["smplr", ...tagsForProgram(program.kind, program.name)],
    parameters,
    macros: {
      tone: Number(Math.min(1, parameters.cutoff / 9000).toFixed(2)),
      shape: parameters.shape,
      motion: parameters.motion,
      bite: parameters.bite
    },
    sourceUrl: "https://github.com/danigb/smplr",
    sourceBank: `${program.kind}:${program.instrument}`,
    sourceSlot: index + 1
  };
});
