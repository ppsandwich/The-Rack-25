import * as Tone from "tone";

type ToneVariant =
  | "warm-analog"
  | "soft-poly"
  | "mono-furnace"
  | "classic-ob"
  | "fm-bells"
  | "chip-arcade"
  | "drum-synth-kit"
  | "karplus-pluck"
  | "modal-mallets"
  | "open-piano"
  | "granular-cloud"
  | "formant-vox"
  | "byte-crusher";

const midiToFrequency = (note: number) => 440 * Math.pow(2, (note - 69) / 12);

export class ToneRackEngine {
  readonly output: GainNode;
  private readonly destination: Tone.Gain;
  private instrument?: Tone.PolySynth | Tone.FMSynth | Tone.MonoSynth | Tone.Synth | Tone.PluckSynth | Tone.MetalSynth;
  private grain?: Tone.GrainPlayer;
  private grainBuffer?: Tone.ToneAudioBuffer;
  private kick?: Tone.MembraneSynth;
  private snare?: Tone.NoiseSynth;
  private hat?: Tone.MetalSynth;
  private tom?: Tone.MembraneSynth;
  private bitCrusher?: Tone.BitCrusher;
  private distortion?: Tone.Distortion;
  private formantA?: Tone.Filter;
  private formantB?: Tone.Filter;
  private formantC?: Tone.Filter;
  private readonly variant: ToneVariant;
  private params: Record<string, number>;

  constructor(context: AudioContext, parameters: Record<string, number>, variant: ToneVariant) {
    Tone.setContext(new Tone.Context(context));
    this.variant = variant;
    this.params = parameters;
    this.output = context.createGain();
    this.output.gain.value = 0.82;
    this.destination = new Tone.Gain(0.85);
    this.destination.connect(this.output);
    this.createInstrument();
    this.update(parameters);
  }

  update(parameters: Record<string, number>) {
    this.params = parameters;
    const p = parameters;
    this.output.gain.setTargetAtTime(0.36 + (p.level ?? 0.62) * 0.55, this.output.context.currentTime, 0.02);

    if (["warm-analog", "soft-poly", "classic-ob", "chip-arcade", "open-piano", "byte-crusher"].includes(this.variant) && this.instrument instanceof Tone.PolySynth) {
      this.instrument.set({
        oscillator: { type: this.waveform(p.shape ?? 0.45) },
        envelope: this.envelope(p),
        filter: { Q: p.resonance ?? 1.2 },
        filterEnvelope: {
          attack: Math.max(0.001, (p.attack ?? 0.02) * 0.7),
          decay: Math.max(0.02, p.decay ?? 0.24),
          sustain: Math.max(0, Math.min(1, p.sustain ?? 0.58)),
          release: Math.max(0.03, p.release ?? 0.65),
          baseFrequency: Math.max(60, p.cutoff ?? 2600),
          octaves: 1.2 + (p.bite ?? 0.2) * 4
        }
      } as unknown as Parameters<Tone.PolySynth["set"]>[0]);
    }

    if (this.variant === "mono-furnace" && this.instrument instanceof Tone.MonoSynth) {
      this.instrument.set({
        oscillator: { type: (p.shape ?? 0.45) > 0.72 ? "square" : "sawtooth" },
        filter: { type: "lowpass", rolloff: -24, Q: Math.max(0.1, p.resonance ?? 1.2) },
        envelope: this.envelope(p),
        filterEnvelope: {
          attack: Math.max(0.001, (p.attack ?? 0.02) * 0.6),
          decay: Math.max(0.02, p.decay ?? 0.24),
          sustain: Math.max(0, Math.min(1, p.sustain ?? 0.58)),
          release: Math.max(0.03, p.release ?? 0.65),
          baseFrequency: Math.max(50, (p.cutoff ?? 2600) * 0.12),
          octaves: 1.8 + (p.bite ?? 0.2) * 4.2
        }
      } as unknown as Parameters<Tone.MonoSynth["set"]>[0]);
    }

    if (this.variant === "fm-bells" && this.instrument instanceof Tone.FMSynth) {
      this.instrument.set({
        harmonicity: Math.max(0.25, p.ratio ?? 2),
        modulationIndex: 1 + (p.index ?? p.bite ?? 0.3) * 22,
        oscillator: { type: "sine" },
        modulation: { type: (p.shape ?? 0.45) > 0.7 ? "triangle" : "sine" },
        envelope: this.envelope(p),
        modulationEnvelope: {
          attack: Math.max(0.001, (p.attack ?? 0.02) * 0.6),
          decay: Math.max(0.02, (p.decay ?? 0.24) * (1.1 + (p.op2 ?? 0.3))),
          sustain: Math.max(0, Math.min(0.95, (p.op3 ?? p.sustain ?? 0.4))),
          release: Math.max(0.04, (p.release ?? 0.65) * (0.8 + (p.feedback ?? 0.15)))
        }
      } as unknown as Parameters<Tone.FMSynth["set"]>[0]);
    }

    if (this.variant === "karplus-pluck" && this.instrument instanceof Tone.PluckSynth) {
      this.instrument.set({
        attackNoise: 0.25 + (p.punch ?? 0.38) * 1.8,
        dampening: Math.max(600, Math.min(9000, p.cutoff ?? 2600)),
        resonance: Math.max(0.1, Math.min(0.99, 0.65 + (p.sustain ?? 0.58) * 0.32))
      });
    }

    if (this.variant === "modal-mallets" && this.instrument instanceof Tone.MetalSynth) {
      this.instrument.set({
        harmonicity: 2.2 + (p.shape ?? 0.45) * 6,
        modulationIndex: 8 + (p.bite ?? 0.2) * 30,
        resonance: Math.max(400, Math.min(9000, p.cutoff ?? 2600)),
        octaves: 0.8 + (p.width ?? 0.45) * 2,
        envelope: { attack: Math.max(0.001, p.attack ?? 0.02), decay: Math.max(0.06, p.decay ?? 0.24), release: Math.max(0.02, p.release ?? 0.65) }
      });
    }

    if (this.variant === "formant-vox") {
      const shape = p.shape ?? 0.45;
      const bite = p.bite ?? 0.2;
      this.formantA?.frequency.rampTo(450 + shape * 420, 0.04);
      this.formantB?.frequency.rampTo(950 + shape * 840, 0.04);
      this.formantC?.frequency.rampTo(2100 + bite * 1400, 0.04);
      this.formantA?.Q.rampTo(7 + bite * 6, 0.04);
      this.formantB?.Q.rampTo(6 + bite * 5, 0.04);
      this.formantC?.Q.rampTo(5 + bite * 4, 0.04);
    }

    if (this.variant === "byte-crusher") {
      this.bitCrusher?.set({ bits: Math.max(2, Math.round(14 - (p.bite ?? 0.2) * 10)) });
      this.distortion?.set({ distortion: Math.min(0.9, (p.bite ?? 0.2) * 0.9) });
    }

    if (this.variant === "granular-cloud" && this.grain) {
      this.grain.grainSize = 0.04 + (p.shape ?? 0.45) * 0.22;
      this.grain.overlap = 0.02 + (p.motion ?? 0.25) * 0.16;
      this.grain.detune = ((p.detune ?? 0) - 12) * 8;
      this.grain.playbackRate = 0.65 + (p.bite ?? 0.2) * 0.8;
    }
  }

  noteOn(note: number, velocity: number) {
    const time = Tone.now();
    if (this.variant === "drum-synth-kit") {
      this.triggerDrum(note, velocity, time);
    } else if (this.variant === "granular-cloud" && this.grain) {
      this.grain.detune = (note - 60) * 35 + ((this.params.detune ?? 0) - 12) * 8;
      this.grain.start(time, 0, Math.max(0.08, (this.params.decay ?? 0.24) + (this.params.release ?? 0.65) * 0.4));
    } else if (this.instrument) {
      (this.instrument as { triggerAttack: (note: number, time?: number, velocity?: number) => void }).triggerAttack(midiToFrequency(note), time, Math.max(0.05, Math.min(1, velocity)));
    }
    window.dispatchEvent(new CustomEvent("rack25-audio-start", { detail: { engine: this.variant, note } }));
  }

  noteOff(note: number) {
    if (this.variant === "drum-synth-kit" || this.variant === "granular-cloud") return;
    if (this.instrument instanceof Tone.PluckSynth || this.instrument instanceof Tone.MetalSynth) return;
    this.instrument?.triggerRelease(midiToFrequency(note), Tone.now());
  }

  allNotesOff() {
    if (this.instrument instanceof Tone.PolySynth) {
      this.instrument.releaseAll();
    } else if (!(this.instrument instanceof Tone.PluckSynth) && !(this.instrument instanceof Tone.MetalSynth)) {
      this.instrument?.triggerRelease(Tone.now());
    }
  }

  dispose() {
    this.allNotesOff();
    this.instrument?.dispose();
    this.kick?.dispose();
    this.snare?.dispose();
    this.hat?.dispose();
    this.tom?.dispose();
    this.grain?.dispose();
    this.grainBuffer?.dispose();
    this.bitCrusher?.dispose();
    this.distortion?.dispose();
    this.formantA?.dispose();
    this.formantB?.dispose();
    this.formantC?.dispose();
    this.destination.dispose();
    this.output.disconnect();
  }

  private createInstrument() {
    if (this.variant === "warm-analog" || this.variant === "classic-ob") {
      this.instrument = new Tone.PolySynth(Tone.MonoSynth, {
        maxPolyphony: 8,
        oscillator: { type: "sawtooth" },
        filter: { type: "lowpass", rolloff: -24, Q: 1.2 },
        envelope: this.envelope(this.params),
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.45, release: 0.6, baseFrequency: 180, octaves: 3 }
      } as unknown as Tone.MonoSynthOptions).connect(this.destination);
    } else if (this.variant === "soft-poly" || this.variant === "open-piano") {
      this.instrument = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: this.variant === "open-piano" ? "triangle" : "sine" },
        envelope: this.variant === "open-piano" ? { attack: 0.004, decay: 0.38, sustain: 0.28, release: 0.55 } : this.envelope(this.params)
      } as unknown as Tone.SynthOptions).connect(this.destination);
    } else if (this.variant === "mono-furnace") {
      this.instrument = new Tone.MonoSynth({
        oscillator: { type: "sawtooth" },
        filter: { type: "lowpass", rolloff: -24, Q: 1.4 },
        envelope: this.envelope(this.params),
        filterEnvelope: { attack: 0.004, decay: 0.18, sustain: 0.35, release: 0.28, baseFrequency: 80, octaves: 4.2 }
      }).connect(this.destination);
    } else if (this.variant === "fm-bells") {
      this.instrument = new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 8,
        envelope: this.envelope(this.params),
        modulationEnvelope: { attack: 0.001, decay: 0.4, sustain: 0.2, release: 0.6 }
      }).connect(this.destination);
    } else if (this.variant === "chip-arcade") {
      this.instrument = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0.42, release: 0.08 }
      } as unknown as Tone.SynthOptions).connect(this.destination);
    } else if (this.variant === "karplus-pluck") {
      this.instrument = new Tone.PluckSynth({ attackNoise: 1, dampening: 3200, resonance: 0.86 }).connect(this.destination);
    } else if (this.variant === "modal-mallets") {
      this.instrument = new Tone.MetalSynth({ harmonicity: 4.2, modulationIndex: 18, resonance: 2600, octaves: 1.5, envelope: { attack: 0.001, decay: 0.7, release: 0.18 } }).connect(this.destination);
    } else if (this.variant === "formant-vox") {
      this.formantA = new Tone.Filter(650, "bandpass");
      this.formantB = new Tone.Filter(1200, "bandpass");
      this.formantC = new Tone.Filter(2600, "bandpass");
      this.formantA.connect(this.formantB);
      this.formantB.connect(this.formantC);
      this.formantC.connect(this.destination);
      this.instrument = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.025, decay: 0.24, sustain: 0.62, release: 0.7 }
      } as unknown as Tone.SynthOptions).connect(this.formantA);
    } else if (this.variant === "byte-crusher") {
      this.bitCrusher = new Tone.BitCrusher(6);
      this.distortion = new Tone.Distortion(0.25);
      this.bitCrusher.connect(this.distortion);
      this.distortion.connect(this.destination);
      this.instrument = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.002, decay: 0.18, sustain: 0.4, release: 0.22 }
      } as unknown as Tone.SynthOptions).connect(this.bitCrusher);
    } else if (this.variant === "granular-cloud") {
      this.grainBuffer = new Tone.ToneAudioBuffer(this.makeGranularBuffer());
      this.grain = new Tone.GrainPlayer(this.grainBuffer).connect(this.destination);
      this.grain.loop = true;
      this.grain.grainSize = 0.12;
      this.grain.overlap = 0.08;
    } else {
      this.kick = new Tone.MembraneSynth({ pitchDecay: 0.04, octaves: 8, envelope: { attack: 0.001, decay: 0.42, sustain: 0.02, release: 0.18 } }).connect(this.destination);
      this.snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 } }).connect(this.destination);
      this.hat = new Tone.MetalSynth({ harmonicity: 5.1, modulationIndex: 24, resonance: 3600, octaves: 1.4, envelope: { attack: 0.001, decay: 0.08, release: 0.02 } }).connect(this.destination);
      this.tom = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 3.5, envelope: { attack: 0.001, decay: 0.28, sustain: 0.04, release: 0.16 } }).connect(this.destination);
    }
  }

  private triggerDrum(note: number, velocity: number, time: number) {
    const p = this.params;
    const vel = Math.max(0.05, Math.min(1, velocity * (0.7 + (p.punch ?? 0.38) * 0.5)));
    const slot = note % 12;
    if ([0, 5].includes(slot)) this.kick?.triggerAttackRelease(42 + (p.shape ?? 0.45) * 28, "8n", time, vel);
    else if ([2, 7].includes(slot)) this.snare?.triggerAttackRelease("16n", time, vel * (0.7 + (p.bite ?? 0.2) * 0.6));
    else if ([1, 3, 6, 8, 10].includes(slot)) this.hat?.triggerAttackRelease("32n", time, vel * 0.7);
    else this.tom?.triggerAttackRelease(80 + (note % 7) * 22, "16n", time, vel);
  }

  private envelope(p: Record<string, number>) {
    return {
      attack: Math.max(0.001, p.attack ?? 0.02),
      decay: Math.max(0.01, p.decay ?? 0.24),
      sustain: Math.max(0, Math.min(1, p.sustain ?? 0.58)),
      release: Math.max(0.02, p.release ?? 0.65)
    };
  }

  private waveform(shape: number): "sawtooth" | "square" | "triangle" | "sine" {
    if (shape < 0.2) return "sine";
    if (shape < 0.42) return "triangle";
    if (shape < 0.72) return "sawtooth";
    return "square";
  }

  private makeGranularBuffer() {
    const context = this.output.context;
    const seconds = 1.6;
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const partials = Math.sin(t * 2 * Math.PI * 110) * 0.32 + Math.sin(t * 2 * Math.PI * 164.8) * 0.22 + Math.sin(t * 2 * Math.PI * 246.9) * 0.16;
      data[i] = partials * Math.sin(Math.PI * (i / data.length)) + (Math.random() * 2 - 1) * 0.025;
    }
    return buffer;
  }
}
