import config from "../vendor/dx7-synth-js/config";
import Synth from "../vendor/dx7-synth-js/synth";
import FMVoice from "../vendor/dx7-synth-js/voice-dx7";

type Dx7Synth = {
  noteOn: (note: number, velocity: number) => void;
  noteOff: (note: number) => void;
  panic: () => void;
  render: () => [number, number];
};

const SynthCtor = Synth as unknown as new (voiceClass: unknown, polyphony: number) => Dx7Synth;

const dxVoice = FMVoice as unknown as {
  setParams: (params: Dx7Params) => void;
  mapOutputLevel: (level: number) => number;
};

type Dx7Operator = {
  idx: number;
  enabled: boolean;
  rates: number[];
  levels: number[];
  detune: number;
  velocitySens: number;
  lfoAmpModSens: number;
  volume: number;
  oscMode: 0 | 1;
  freqCoarse: number;
  freqFine: number;
  pan: number;
  outputLevel: number;
  ampL: number;
  ampR: number;
  freqRatio?: number;
  freqFixed?: number;
};

type Dx7Params = {
  algorithm: number;
  feedback: number;
  fbRatio: number;
  lfoSpeed: number;
  lfoDelay: number;
  lfoPitchModDepth: number;
  lfoAmpModDepth: number;
  lfoPitchModSens: number;
  lfoWaveform: number;
  lfoSync: number;
  pitchEnvelope: { rates: number[]; levels: number[] };
  controllerModVal: number;
  aftertouchEnabled: number;
  operators: Dx7Operator[];
};

export class Dx7RackEngine {
  readonly output: GainNode;
  private readonly processor: ScriptProcessorNode;
  private readonly synth: Dx7Synth;
  private readonly variant: "dx-stack" | "cartridge-fm";
  private params: Dx7Params;

  constructor(context: AudioContext, parameters: Record<string, number>, variant: "dx-stack" | "cartridge-fm") {
    config.sampleRate = context.sampleRate;
    this.variant = variant;
    this.output = context.createGain();
    this.output.gain.value = 0.85;
    this.synth = new SynthCtor(FMVoice, variant === "dx-stack" ? 12 : 10);
    this.processor = context.createScriptProcessor(config.bufferSize, 0, 2);
    this.processor.onaudioprocess = (event) => {
      const left = event.outputBuffer.getChannelData(0);
      const right = event.outputBuffer.getChannelData(1);
      for (let i = 0; i < left.length; i++) {
        const sample = this.synth.render();
        left[i] = Math.max(-0.95, Math.min(0.95, sample[0] * 1.8));
        right[i] = Math.max(-0.95, Math.min(0.95, sample[1] * 1.8));
      }
    };
    this.processor.connect(this.output);
    this.params = this.createParams(parameters);
    dxVoice.setParams(this.params);
  }

  update(parameters: Record<string, number>) {
    this.params = this.createParams(parameters);
    dxVoice.setParams(this.params);
  }

  noteOn(note: number, velocity: number) {
    this.synth.noteOn(note, Math.max(0.05, Math.min(1.25, velocity)));
    window.dispatchEvent(new CustomEvent("rack25-audio-start", { detail: { engine: this.variant, note } }));
  }

  noteOff(note: number) {
    this.synth.noteOff(note);
  }

  allNotesOff() {
    this.synth.panic();
  }

  dispose() {
    this.allNotesOff();
    this.processor.disconnect();
    this.output.disconnect();
  }

  private createParams(p: Record<string, number>): Dx7Params {
    const algorithm = Math.max(1, Math.min(32, Math.round((p.algorithm ?? 1) * 8 + 1)));
    const feedback = Math.max(0, Math.min(7, Math.round((p.feedback ?? 0.2) * 7)));
    const tone = Math.max(0, Math.min(1, ((p.cutoff ?? 2400) - 80) / (9000 - 80)));
    const index = p.index ?? p.bite ?? 0.35;
    const ratio = p.ratio ?? 2;
    const release = p.release ?? 0.65;
    const attack = p.attack ?? 0.02;
    const sustain = p.sustain ?? 0.5;
    const decay = p.decay ?? 0.3;
    const width = p.width ?? 0.45;
    const opLevels = [
      92,
      this.levelToDx(45 + index * 45 + (p.op2 ?? 0.35) * 20),
      this.levelToDx(30 + index * 40 + (p.op3 ?? 0.3) * 25),
      this.levelToDx(25 + (p.op4 ?? 0.25) * 58),
      this.levelToDx(12 + (p.op5 ?? 0.2) * 58),
      this.levelToDx(8 + (p.op6 ?? 0.15) * 58)
    ];
    const ratios = this.operatorRatios(ratio, p.shape ?? 0.45);
    const envelope = this.envelopeLevels(attack, decay, sustain, release);
    const operators = opLevels.map((volume, idx) => this.makeOperator(idx, volume, ratios[idx], envelope, width, p.detune ?? 0, tone));

    return {
      algorithm,
      feedback,
      fbRatio: Math.pow(2, feedback - 7),
      lfoSpeed: Math.round(12 + (p.motion ?? 0.25) * 55),
      lfoDelay: 18,
      lfoPitchModDepth: Math.round((p.motion ?? 0.25) * 28),
      lfoAmpModDepth: Math.round((p.motion ?? 0.25) * 18),
      lfoPitchModSens: 3,
      lfoWaveform: this.variant === "cartridge-fm" ? 4 : 0,
      lfoSync: 0,
      pitchEnvelope: { rates: [0, 0, 0, 0], levels: [50, 50, 50, 50] },
      controllerModVal: 0,
      aftertouchEnabled: 0,
      operators
    };
  }

  private makeOperator(idx: number, volume: number, ratio: number, envelope: { rates: number[]; levels: number[] }, width: number, detune: number, tone: number): Dx7Operator {
    const pan = (idx % 2 === 0 ? -1 : 1) * width * 32;
    const coarse = Math.max(0, Math.min(31, Math.floor(ratio)));
    const fine = Math.max(0, Math.min(99, Math.round((ratio - Math.floor(ratio)) * 100)));
    const op: Dx7Operator = {
      idx,
      enabled: volume > 0,
      rates: envelope.rates,
      levels: idx === 0 ? [99, Math.max(55, Math.round(70 + tone * 25)), Math.round(35 + tone * 45), 0] : envelope.levels,
      detune: Math.round((idx - 2.5) * detune * 0.35),
      velocitySens: idx === 0 ? 2 : 4,
      lfoAmpModSens: idx < 2 ? 0 : 1,
      volume,
      oscMode: 0,
      freqCoarse: coarse,
      freqFine: fine,
      pan,
      outputLevel: dxVoice.mapOutputLevel(volume),
      ampL: Math.cos(Math.PI / 2 * (pan + 50) / 100),
      ampR: Math.sin(Math.PI / 2 * (pan + 50) / 100)
    };
    op.freqRatio = (op.freqCoarse || 0.5) * (1 + op.freqFine / 100);
    return op;
  }

  private operatorRatios(ratio: number, shape: number) {
    if (this.variant === "cartridge-fm") {
      return [1, ratio, ratio * 1.5 + shape, 0.5 + shape, ratio * 2, ratio * 4 + 0.01];
    }
    return [1, ratio, 1 + shape * 3, ratio * 0.5 + 0.5, ratio * 2 + shape, ratio * 3 + 0.01];
  }

  private envelopeLevels(attack: number, decay: number, sustain: number, release: number) {
    const attackRate = Math.max(15, Math.min(99, Math.round(99 - attack * 34)));
    const decayRate = Math.max(8, Math.min(92, Math.round(92 - decay * 20)));
    const releaseRate = Math.max(4, Math.min(80, Math.round(78 - release * 12)));
    return {
      rates: [attackRate, decayRate, 35, releaseRate],
      levels: [99, Math.round(35 + sustain * 60), Math.round(sustain * 82), 0]
    };
  }

  private levelToDx(value: number) {
    return Math.max(0, Math.min(99, Math.round(value)));
  }
}
