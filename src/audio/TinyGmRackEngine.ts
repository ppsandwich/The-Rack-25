import WebAudioTinySynth from "webaudio-tinysynth";

const PROGRAMS = {
  piano: 0,
  brightPiano: 1,
  electricPiano: 4,
  organ: 16,
  guitar: 24,
  bass: 33,
  strings: 48,
  brass: 61,
  reed: 66,
  flute: 73,
  squareLead: 80,
  sawLead: 81,
  pad: 88,
  sweep: 95,
  mallet: 11,
  bell: 14
};

export class TinyGmRackEngine {
  readonly output: GainNode;
  private readonly synth: WebAudioTinySynth;
  private program = PROGRAMS.piano;
  private channel = 0;

  constructor(context: AudioContext, parameters: Record<string, number>) {
    this.output = context.createGain();
    this.output.gain.value = 0.72;
    this.synth = new WebAudioTinySynth({ quality: 1, useReverb: 0, voices: 32 });
    this.synth.setAudioContext(context, this.output);
    this.synth.setMasterVol(0.75);
    this.update(parameters);
  }

  update(parameters: Record<string, number>) {
    this.program = this.programFromParams(parameters);
    this.synth.setProgram(this.channel, this.program);
    this.output.gain.setTargetAtTime(0.45 + (parameters.level ?? 0.62) * 0.55, this.output.context.currentTime, 0.02);
  }

  noteOn(note: number, velocity: number) {
    this.synth.setProgram(this.channel, this.program);
    this.synth.send([0x90 + this.channel, note, Math.max(1, Math.min(127, Math.round(velocity * 127)))]);
    window.dispatchEvent(new CustomEvent("rack25-audio-start", { detail: { engine: "tiny-gm", note } }));
  }

  noteOff(note: number) {
    this.synth.send([0x80 + this.channel, note, 0]);
  }

  allNotesOff() {
    this.synth.send([0xb0 + this.channel, 123, 0]);
    this.synth.allSoundOff(this.channel);
  }

  dispose() {
    this.allNotesOff();
    this.output.disconnect();
  }

  private programFromParams(parameters: Record<string, number>) {
    if (Number.isFinite(parameters.gmProgram)) return Math.max(0, Math.min(127, Math.round(parameters.gmProgram)));
    const shape = parameters.shape ?? 0.45;
    const bite = parameters.bite ?? 0.2;
    const motion = parameters.motion ?? 0.25;
    const cutoff = parameters.cutoff ?? 2600;
    if (bite > 0.75) return PROGRAMS.sawLead;
    if (bite > 0.55) return PROGRAMS.squareLead;
    if (motion > 0.72) return PROGRAMS.sweep;
    if (shape < 0.12) return PROGRAMS.piano;
    if (shape < 0.22) return PROGRAMS.electricPiano;
    if (shape < 0.32) return PROGRAMS.mallet;
    if (shape < 0.42) return PROGRAMS.organ;
    if (shape < 0.52) return PROGRAMS.guitar;
    if (shape < 0.62) return PROGRAMS.bass;
    if (shape < 0.74) return cutoff < 1800 ? PROGRAMS.strings : PROGRAMS.brass;
    if (shape < 0.86) return PROGRAMS.flute;
    return PROGRAMS.pad;
  }
}
