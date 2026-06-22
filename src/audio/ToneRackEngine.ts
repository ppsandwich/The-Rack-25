import * as Tone from "tone";

type ToneVariant = "warm-analog" | "fm-bells" | "drum-synth-kit";

const midiToFrequency = (note: number) => 440 * Math.pow(2, (note - 69) / 12);

export class ToneRackEngine {
  readonly output: GainNode;
  private readonly destination: Tone.Gain;
  private instrument?: Tone.PolySynth | Tone.FMSynth | Tone.MonoSynth;
  private kick?: Tone.MembraneSynth;
  private snare?: Tone.NoiseSynth;
  private hat?: Tone.MetalSynth;
  private tom?: Tone.MembraneSynth;
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

    if (this.variant === "warm-analog" && this.instrument instanceof Tone.PolySynth) {
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
  }

  noteOn(note: number, velocity: number) {
    const time = Tone.now();
    if (this.variant === "drum-synth-kit") {
      this.triggerDrum(note, velocity, time);
    } else if (this.instrument) {
      this.instrument.triggerAttack(midiToFrequency(note), time, Math.max(0.05, Math.min(1, velocity)));
    }
    window.dispatchEvent(new CustomEvent("rack25-audio-start", { detail: { engine: this.variant, note } }));
  }

  noteOff(note: number) {
    if (this.variant === "drum-synth-kit") return;
    this.instrument?.triggerRelease(midiToFrequency(note), Tone.now());
  }

  allNotesOff() {
    if (this.instrument instanceof Tone.PolySynth) {
      this.instrument.releaseAll();
    } else {
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
    this.destination.dispose();
    this.output.disconnect();
  }

  private createInstrument() {
    if (this.variant === "warm-analog") {
      this.instrument = new Tone.PolySynth(Tone.MonoSynth, {
        maxPolyphony: 8,
        oscillator: { type: "sawtooth" },
        filter: { type: "lowpass", rolloff: -24, Q: 1.2 },
        envelope: this.envelope(this.params),
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.45, release: 0.6, baseFrequency: 180, octaves: 3 }
      } as unknown as Tone.MonoSynthOptions).connect(this.destination);
    } else if (this.variant === "fm-bells") {
      this.instrument = new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 8,
        envelope: this.envelope(this.params),
        modulationEnvelope: { attack: 0.001, decay: 0.4, sustain: 0.2, release: 0.6 }
      }).connect(this.destination);
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
}
