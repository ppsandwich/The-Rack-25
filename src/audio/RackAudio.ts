import type { EngineDefinition, GlobalEffects } from "../types";
import type { Dx7RackEngine } from "./Dx7RackEngine";
import type { TinyGmRackEngine } from "./TinyGmRackEngine";
import type { ToneRackEngine } from "./ToneRackEngine";

type Voice = {
  stop: (when?: number) => void;
};

const midiToFrequency = (note: number) => 440 * Math.pow(2, (note - 69) / 12);

const makeNoiseBuffer = (context: AudioContext, seconds = 1) => {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

export class RackAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private tone?: BiquadFilterNode;
  private compressor?: DynamicsCompressorNode;
  private delay?: DelayNode;
  private delayFeedback?: GainNode;
  private delayWet?: GainNode;
  private convolver?: ConvolverNode;
  private reverbWet?: GainNode;
  private dry?: GainNode;
  private voices = new Map<number, Voice[]>();
  private engine?: EngineDefinition;
  private dx7?: Dx7RackEngine;
  private tinyGm?: TinyGmRackEngine;
  private toneEngine?: ToneRackEngine;
  private engineLoad?: Promise<void>;
  private engineLoadId = 0;
  private heldNotes = new Set<number>();
  private params: Record<string, number> = {};
  private effects: GlobalEffects = { tone: 0, chorus: 0.1, delay: 0.08, delayTime: 0.24, delayFeedback: 0.22, reverb: 0.18, reverbSize: 0.4, master: 0.72 };

  get isReady() {
    return Boolean(this.context);
  }

  async start() {
    if (this.context) return;
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.context = new AudioCtor();
    this.master = this.context.createGain();
    this.tone = this.context.createBiquadFilter();
    this.tone.type = "lowshelf";
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -14;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 8;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.12;
    this.dry = this.context.createGain();
    this.delay = this.context.createDelay(1.5);
    this.delayFeedback = this.context.createGain();
    this.delayWet = this.context.createGain();
    this.convolver = this.context.createConvolver();
    this.reverbWet = this.context.createGain();
    this.convolver.buffer = this.makeImpulse(1.4);
    this.master.connect(this.tone).connect(this.compressor).connect(this.context.destination);
    this.dry.connect(this.master);
    this.delay.connect(this.delayFeedback).connect(this.delay);
    this.delay.connect(this.delayWet).connect(this.master);
    this.convolver.connect(this.reverbWet).connect(this.master);
    this.applyEffects(this.effects);
    await this.context.resume();
  }

  async setEngine(engine: EngineDefinition, params: Record<string, number>) {
    const loadId = ++this.engineLoadId;
    this.allNotesOff();
    this.dx7?.dispose();
    this.tinyGm?.dispose();
    this.toneEngine?.dispose();
    this.dx7 = undefined;
    this.tinyGm = undefined;
    this.toneEngine = undefined;
    this.engine = engine;
    this.params = params;
    this.engineLoad = this.loadExternalEngine(loadId, engine).catch((error) => {
      console.error(`Rack-25 could not load the ${engine.name} engine chunk. Falling back to browser-native synthesis.`, error);
    });
    await this.engineLoad;
  }

  setParams(params: Record<string, number>) {
    this.params = params;
    this.dx7?.update(params);
    this.tinyGm?.update(params);
    this.toneEngine?.update(params);
  }

  applyEffects(effects: GlobalEffects) {
    this.effects = effects;
    if (!this.context || !this.master || !this.tone || !this.delay || !this.delayFeedback || !this.delayWet || !this.reverbWet) return;
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(effects.master, now, 0.02);
    this.tone.frequency.value = 650;
    this.tone.gain.setTargetAtTime(effects.tone * 12, now, 0.03);
    this.delay.delayTime.setTargetAtTime(effects.delayTime, now, 0.03);
    this.delayFeedback.gain.setTargetAtTime(effects.delayFeedback * 0.62, now, 0.03);
    this.delayWet.gain.setTargetAtTime(effects.delay * 0.42, now, 0.03);
    this.reverbWet.gain.setTargetAtTime(effects.reverb * 0.35, now, 0.03);
    if (this.convolver) this.convolver.buffer = this.makeImpulse(0.5 + effects.reverbSize * 2.5);
  }

  async noteOn(note: number, velocity = 0.85) {
    if (!this.context || !this.engine || !this.dry || !this.delay || !this.convolver) return;
    this.heldNotes.add(note);
    if (this.engineLoad) {
      await this.engineLoad;
      if (!this.heldNotes.has(note)) return;
    }
    if (this.dx7) {
      this.dx7.noteOn(note, velocity);
      return;
    }
    if (this.tinyGm) {
      this.tinyGm.noteOn(note, velocity);
      return;
    }
    if (this.toneEngine) {
      this.toneEngine.noteOn(note, velocity);
      return;
    }
    if (this.engine.playMode === "mono") this.allNotesOff();
    const voice = this.engine.playMode === "drum-map" ? this.makeDrum(note, velocity) : this.makeVoice(note, velocity);
    const list = this.voices.get(note) ?? [];
    list.push(voice);
    this.voices.set(note, list);
  }

  noteOff(note: number) {
    this.heldNotes.delete(note);
    if (this.dx7) {
      this.dx7.noteOff(note);
      return;
    }
    if (this.tinyGm) {
      this.tinyGm.noteOff(note);
      return;
    }
    if (this.toneEngine) {
      this.toneEngine.noteOff(note);
      return;
    }
    const voices = this.voices.get(note);
    if (!voices) return;
    voices.forEach((voice) => voice.stop());
    this.voices.delete(note);
  }

  allNotesOff() {
    this.heldNotes.clear();
    this.dx7?.allNotesOff();
    this.tinyGm?.allNotesOff();
    this.toneEngine?.allNotesOff();
    this.voices.forEach((voices) => voices.forEach((voice) => voice.stop(0.01)));
    this.voices.clear();
  }

  private async loadExternalEngine(loadId: number, engine: EngineDefinition) {
    if (!this.context) return;
    if (engine.id === "dx-stack" || engine.id === "cartridge-fm") {
      const { Dx7RackEngine } = await import("./Dx7RackEngine");
      if (loadId !== this.engineLoadId || !this.context) return;
      this.dx7 = new Dx7RackEngine(this.context, this.params, engine.id);
      this.route(this.dx7.output);
    } else if (engine.id === "tiny-gm") {
      const { TinyGmRackEngine } = await import("./TinyGmRackEngine");
      if (loadId !== this.engineLoadId || !this.context) return;
      this.tinyGm = new TinyGmRackEngine(this.context, this.params);
      this.route(this.tinyGm.output);
    } else if (engine.id === "warm-analog" || engine.id === "fm-bells" || engine.id === "drum-synth-kit") {
      const { ToneRackEngine } = await import("./ToneRackEngine");
      if (loadId !== this.engineLoadId || !this.context) return;
      this.toneEngine = new ToneRackEngine(this.context, this.params, engine.id);
      this.route(this.toneEngine.output);
    }
  }

  private route(node: AudioNode) {
    if (!this.dry || !this.delay || !this.convolver) return;
    node.connect(this.dry);
    node.connect(this.delay);
    node.connect(this.convolver);
  }

  private makeVoice(note: number, velocity: number): Voice {
    const context = this.context!;
    const engine = this.engine!;
    const p = this.params;
    const now = context.currentTime;
    const freq = midiToFrequency(note);
    const output = context.createGain();
    const filter = context.createBiquadFilter();
    const amp = context.createGain();
    const attack = Math.max(0.001, p.attack ?? 0.02);
    const decay = p.decay ?? 0.2;
    const sustain = p.sustain ?? 0.55;
    const release = p.release ?? 0.6;
    const level = (p.level ?? 0.6) * velocity * 0.18;
    const algorithm = Math.round(p.algorithm ?? 0);
    filter.type = engine.model.kind === "fm" && ((p.cutoff ?? 2200) < 1800 || algorithm === 2) ? "lowpass" : engine.model.filter;
    filter.frequency.setValueAtTime(Math.max(60, p.cutoff ?? 2200), now);
    filter.Q.setValueAtTime(p.resonance ?? 1, now);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.002, level * (1 + (p.punch ?? 0) * 0.5)), now + attack);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.001, level * sustain), now + attack + decay);
    filter.connect(amp).connect(output);
    this.route(output);

    const nodes: AudioScheduledSourceNode[] = [];
    const addOsc = (type: OscillatorType, frequency: number, gainValue: number, detune = 0) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      osc.detune.setValueAtTime(detune, now);
      gain.gain.value = gainValue;
      osc.connect(gain).connect(filter);
      osc.start(now);
      nodes.push(osc);
      return { osc, gain };
    };

    const shape = p.shape ?? 0.45;
    const bite = p.bite ?? 0.2;
    if (["fm", "hybrid"].includes(engine.model.kind)) {
      const fmBus = context.createGain();
      const ratio = p.ratio ?? engine.model.fmRatio ?? 2;
      const index = p.index ?? bite;
      const feedback = p.feedback ?? bite * 0.4;
      const op2 = p.op2 ?? 0.32;
      const op3 = p.op3 ?? 0.22;
      const op4 = p.op4 ?? 0.14;
      const op5 = p.op5 ?? 0.08;
      const op6 = p.op6 ?? 0.04;
      const algo = Math.max(0, Math.min(3, Math.round(p.algorithm ?? (shape * 3))));

      const connectFmOutput = () => {
        if (feedback + bite > 0.5) {
          const shaper = context.createWaveShaper();
          shaper.curve = this.makeSaturationCurve(1 + (feedback + bite) * 7);
          shaper.oversample = "2x";
          fmBus.connect(shaper).connect(filter);
        } else {
          fmBus.connect(filter);
        }
      };

      const makeFmOsc = (frequency: number, type: OscillatorType = "sine") => {
        const osc = context.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(10, frequency), now);
        osc.start(now);
        nodes.push(osc);
        return osc;
      };

      const makeMod = (frequency: number, depth: number) => {
        const osc = makeFmOsc(frequency, shape > 0.72 ? "triangle" : "sine");
        const gain = context.createGain();
        gain.gain.setValueAtTime(Math.max(0, depth), now);
        osc.connect(gain);
        return { osc, gain };
      };

      const makeCarrier = (frequency: number, gainValue: number, detune = 0) => {
        const osc = makeFmOsc(frequency, shape > 0.82 ? "triangle" : "sine");
        const gain = context.createGain();
        osc.detune.setValueAtTime(detune, now);
        gain.gain.value = gainValue;
        osc.connect(gain).connect(fmBus);
        return osc;
      };

      const depthBase = freq * (0.08 + index * 5.2 + bite * 1.4);
      const carrierA = makeCarrier(freq, 0.14 + (1 - shape) * 0.08);
      const carrierB = algo === 2 || op4 > 0.25 || op5 > 0.2 ? makeCarrier(freq * (1 + op5 * 0.5), 0.04 + op4 * 0.1, (p.detune ?? 0) * 0.7) : undefined;
      const modA = makeMod(freq * ratio, depthBase * (0.35 + op2));
      const modB = makeMod(freq * (ratio * 0.5 + 0.5 + op4 * 4), depthBase * (0.1 + op3 * 0.75));
      const modC = makeMod(freq * (ratio * 1.5 + 0.25 + op6 * 8), depthBase * (0.04 + op5 * 0.65 + feedback * 0.35));

      if (algo === 0) {
        modA.gain.connect(carrierA.frequency);
        modB.gain.connect(carrierA.frequency);
        if (carrierB) modC.gain.connect(carrierB.frequency);
      } else if (algo === 1) {
        modC.gain.connect(modB.osc.frequency);
        modB.gain.connect(modA.osc.frequency);
        modA.gain.connect(carrierA.frequency);
        if (carrierB) modC.gain.connect(carrierB.frequency);
      } else if (algo === 2) {
        modA.gain.connect(carrierA.frequency);
        modB.gain.connect((carrierB ?? carrierA).frequency);
        modC.gain.connect((carrierB ?? carrierA).frequency);
      } else {
        modA.gain.connect(carrierA.frequency);
        modB.gain.connect(modA.osc.frequency);
        modC.gain.connect(carrierA.detune);
        if (carrierB) modC.gain.connect(carrierB.frequency);
      }

      if (feedback > 0.04) {
        const growl = makeFmOsc(freq * (0.5 + ratio * 0.25), feedback > 0.55 ? "square" : "sine");
        const growlGain = context.createGain();
        growlGain.gain.value = 0.008 + feedback * 0.055;
        growl.connect(growlGain).connect(fmBus);
      }

      connectFmOutput();
    } else if (engine.model.kind === "additive" || engine.model.kind === "modal") {
      const count = engine.model.harmonicCount ?? 5;
      for (let i = 1; i <= count; i++) addOsc("sine", freq * i * (engine.model.kind === "modal" ? 1 + i * 0.006 : 1), (0.14 / i) * (1 + shape), p.detune ? (i % 2 ? p.detune : -p.detune) : 0);
    } else if (engine.model.kind === "formant") {
      addOsc(engine.model.oscillator, freq, 0.18);
      [650, 1200 + shape * 600, 2400 + bite * 1200].forEach((formantFreq) => {
        const formant = context.createBiquadFilter();
        formant.type = "bandpass";
        formant.frequency.value = formantFreq;
        formant.Q.value = 8;
        filter.connect(formant).connect(amp);
      });
    } else if (engine.model.kind === "noise" || engine.model.kind === "granular") {
      addOsc(engine.model.oscillator, freq, 0.08);
      const src = context.createBufferSource();
      const ng = context.createGain();
      src.buffer = makeNoiseBuffer(context, 1.4);
      src.loop = true;
      ng.gain.value = (engine.model.noiseLevel ?? 0.4) * (0.05 + shape * 0.18);
      src.connect(ng).connect(filter);
      src.start(now);
      nodes.push(src);
    } else {
      addOsc(engine.model.oscillator, freq, 0.13 + shape * 0.08);
      addOsc(engine.model.secondOscillator ?? engine.model.oscillator, freq, 0.09, (p.detune ?? 0) * (engine.model.kind === "chip" ? 0 : 1));
      if (engine.model.kind === "crusher") {
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        lfo.frequency.value = 24 + bite * 90;
        lfoGain.gain.value = freq * bite * 0.015;
        lfo.connect(lfoGain).connect(filter.frequency);
        lfo.start(now);
        nodes.push(lfo);
      }
    }

    if (p.motion) {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = 0.15 + p.motion * 5;
      lfoGain.gain.value = Math.min(2200, (p.cutoff ?? 2000) * 0.18 * p.motion);
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start(now);
      nodes.push(lfo);
    }

    return {
      stop: (extra = release) => {
        const t = context.currentTime;
        amp.gain.cancelScheduledValues(t);
        amp.gain.setTargetAtTime(0.0001, t, Math.max(0.01, extra / 3));
        nodes.forEach((node) => {
          try {
            node.stop(t + Math.max(0.04, extra + 0.08));
          } catch {
            // Already stopped.
          }
        });
        window.setTimeout(() => output.disconnect(), Math.max(80, (extra + 0.2) * 1000));
      }
    };
  }

  private makeDrum(note: number, velocity: number): Voice {
    const context = this.context!;
    const now = context.currentTime;
    const output = context.createGain();
    const amp = context.createGain();
    output.connect(amp);
    this.route(amp);
    const pitch = [46, 52, 60, 72, 84][note % 5];
    const osc = context.createOscillator();
    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    osc.type = note % 3 === 0 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(midiToFrequency(pitch), now);
    osc.frequency.exponentialRampToValueAtTime(45 + (note % 8) * 20, now + 0.12);
    noise.buffer = makeNoiseBuffer(context, 0.25);
    noiseGain.gain.setValueAtTime(0.15 * velocity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    output.gain.setValueAtTime(0.18 * velocity, now);
    output.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(output);
    noise.connect(noiseGain).connect(output);
    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.45);
    noise.stop(now + 0.28);
    return { stop: () => output.gain.setTargetAtTime(0.0001, context.currentTime, 0.01) };
  }

  private makeImpulse(seconds: number) {
    const context = this.context!;
    const length = Math.max(1, Math.floor(context.sampleRate * seconds));
    const buffer = context.createBuffer(2, length, context.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.2);
    }
    return buffer;
  }

  private makeSaturationCurve(amount: number) {
    const samples = 512;
    const curve = new Float32Array(samples);
    const drive = Math.max(1, amount);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * drive);
    }
    return curve;
  }
}
