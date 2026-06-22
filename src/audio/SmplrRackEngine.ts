import { ElectricPiano, Mallet, Mellotron, Soundfont, SplendidGrandPiano, type Smplr, type StopFn } from "smplr";

type SmplrVariant = "sampled-keys" | "soundfont-rack";

const SAMPLE_KEYS = [
  "piano:Splendid Grand Piano",
  "electric:CP80",
  "electric:PianetT",
  "electric:WurlitzerEP200",
  "electric:TX81Z",
  "mallet:Balafon - Hard Mallet",
  "mallet:Balafon - Keyswitch",
  "mallet:Balafon - Soft Mallet",
  "mallet:Balafon - Traditional Mallet",
  "mallet:Tubular Bells 1",
  "mallet:Tubular Bells 2",
  "mallet:Vibraphone - Bowed",
  "mallet:Vibraphone - Hard Mallets",
  "mallet:Vibraphone - Keyswitch",
  "mallet:Vibraphone - Soft Mallets",
  "mallet:Xylophone - Hard Mallets",
  "mallet:Xylophone - Keyswitch",
  "mallet:Xylophone - Medium Mallets",
  "mallet:Xylophone - Soft Mallets",
  "mellotron:300 STRINGS CELLO",
  "mellotron:300 STRINGS VIOLA",
  "mellotron:8VOICE CHOIR",
  "mellotron:BASSA+STRNGS",
  "mellotron:BOYS CHOIR",
  "mellotron:CHA CHA FLT",
  "mellotron:CHM CLARINET",
  "mellotron:CHMB 3 VLNS",
  "mellotron:CHMB ALTOSAX",
  "mellotron:CHMB FEMALE",
  "mellotron:CHMB MALE VC",
  "mellotron:CHMB TNR SAX",
  "mellotron:CHMB TRMBONE",
  "mellotron:CHMB TRUMPET",
  "mellotron:CHMBLN CELLO",
  "mellotron:CHMBLN FLUTE",
  "mellotron:CHMBLN OBOE",
  "mellotron:DIXIE+TRMBN",
  "mellotron:FOXTROT+SAX",
  "mellotron:HALFSP.BRASS",
  "mellotron:MIXED STRGS",
  "mellotron:MKII BRASS",
  "mellotron:MKII GUITAR",
  "mellotron:MKII ORGAN",
  "mellotron:MKII SAX",
  "mellotron:MKII VIBES",
  "mellotron:MKII VIOLINS",
  "mellotron:MOVE BS+STGS",
  "mellotron:STRGS+BRASS",
  "mellotron:TROMB+TRMPT",
  "mellotron:TRON 16VLNS",
  "mellotron:TRON CELLO",
  "mellotron:TRON FLUTE",
  "mellotron:TRON VIOLA"
] as const;
type SampleKey = (typeof SAMPLE_KEYS)[number];

const SOUNDFONT_KEYS = [
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
type SoundfontKey = (typeof SOUNDFONT_KEYS)[number];

export class SmplrRackEngine {
  readonly output: GainNode;
  private instrument?: Smplr;
  private readonly variant: SmplrVariant;
  private activeKey = "";
  private readonly activeStops = new Map<number, StopFn[]>();
  private parameters: Record<string, number> = {};

  constructor(context: AudioContext, parameters: Record<string, number>, variant: SmplrVariant) {
    this.variant = variant;
    this.output = context.createGain();
    this.output.gain.value = 0.78;
    this.update(parameters);
  }

  update(parameters: Record<string, number>) {
    this.parameters = parameters;
    const nextKey = this.instrumentKey(parameters);
    if (nextKey !== this.activeKey) {
      this.instrument?.stop();
      this.instrument?.dispose();
      this.activeStops.clear();
      this.activeKey = nextKey;
      this.instrument = this.createInstrument(nextKey, parameters);
      this.instrument.ready.catch((error) => console.warn(`Rack-25 could not finish loading smplr instrument ${nextKey}.`, error));
    }

    this.output.gain.setTargetAtTime(0.34 + (parameters.level ?? 0.62) * 0.58, this.output.context.currentTime, 0.02);
    this.instrument?.setDetune((parameters.detune ?? 0) * ((parameters.width ?? 0.45) - 0.5) * 0.7);
    this.instrument?.setCC(74, Math.round(Math.min(127, Math.max(0, ((parameters.cutoff ?? 2600) / 9000) * 127))));
  }

  noteOn(note: number, velocity: number) {
    if (!this.instrument) return;
    const stop = this.instrument.start({
      note,
      velocity: Math.max(1, Math.min(127, Math.round(velocity * 127))),
      stopId: `${this.variant}-${note}`,
      ampRelease: Math.max(0.04, this.instrumentRelease()),
      lpfCutoffHz: this.instrumentCutoff()
    });
    const list = this.activeStops.get(note) ?? [];
    list.push(stop);
    this.activeStops.set(note, list);
    window.dispatchEvent(new CustomEvent("rack25-audio-start", { detail: { engine: this.variant, note } }));
  }

  noteOff(note: number) {
    this.instrument?.stop(`${this.variant}-${note}`);
    const stops = this.activeStops.get(note);
    stops?.forEach((stop) => stop(this.output.context.currentTime + 0.01));
    this.activeStops.delete(note);
  }

  allNotesOff() {
    this.instrument?.stop();
    this.activeStops.forEach((stops) => stops.forEach((stop) => stop(this.output.context.currentTime + 0.01)));
    this.activeStops.clear();
  }

  dispose() {
    this.allNotesOff();
    this.instrument?.dispose();
    this.output.disconnect();
  }

  private createInstrument(key: string, parameters: Record<string, number>) {
    const options = {
      destination: this.output,
      volume: 96,
      velocity: 104,
      detune: (parameters.detune ?? 0) * 0.2
    };

    if (this.variant === "soundfont-rack") {
      return Soundfont(this.output.context, {
        ...options,
        kit: "FluidR3_GM",
        instrument: key,
        loadLoopData: true
      });
    }

    const [kind, instrument] = key.split(":");
    if (kind === "electric") return ElectricPiano(this.output.context, { ...options, instrument });
    if (kind === "mallet") return Mallet(this.output.context, { ...options, instrument });
    if (kind === "mellotron") return Mellotron(this.output.context, { ...options, instrument });
    return SplendidGrandPiano(this.output.context, {
      ...options,
      decayTime: Math.max(0.16, this.instrumentRelease())
    });
  }

  private instrumentKey(parameters: Record<string, number>): SampleKey | SoundfontKey {
    const shape = parameters.shape ?? 0.45;
    const bite = parameters.bite ?? 0.2;
    const motion = parameters.motion ?? 0.25;

    if (this.variant === "sampled-keys") {
      if (Number.isFinite(parameters.sampledKeysProgram)) {
        const program = Math.max(0, Math.min(SAMPLE_KEYS.length - 1, Math.round(parameters.sampledKeysProgram)));
        return SAMPLE_KEYS[program];
      }
      if (bite > 0.72) return "electric:TX81Z";
      if (motion > 0.68) return "mallet:Vibraphone - Soft Mallets";
      if (shape < 0.24) return "piano:Splendid Grand Piano";
      if (shape < 0.5) return "electric:CP80";
      if (shape < 0.76) return "electric:WurlitzerEP200";
      return "mellotron:TRON FLUTE";
    }

    if (Number.isFinite(parameters.soundfontProgram)) {
      const program = Math.max(0, Math.min(SOUNDFONT_KEYS.length - 1, Math.round(parameters.soundfontProgram)));
      return SOUNDFONT_KEYS[program];
    }
    const index = Math.max(0, Math.min(SOUNDFONT_KEYS.length - 1, Math.floor(shape * SOUNDFONT_KEYS.length)));
    if (bite > 0.76) return "clavinet";
    if (motion > 0.76) return "pad_2_warm";
    return SOUNDFONT_KEYS[index];
  }

  private instrumentCutoff() {
    return Math.max(200, Math.min(9000, this.parameters.cutoff ?? 2600));
  }

  private instrumentRelease() {
    return Math.max(0.04, Math.min(5, this.parameters.release ?? 0.55));
  }
}
