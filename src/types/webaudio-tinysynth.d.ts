declare module "webaudio-tinysynth" {
  export default class WebAudioTinySynth {
    constructor(options?: { quality?: number; useReverb?: number; voices?: number });
    setAudioContext(context: AudioContext, destination?: AudioNode): void;
    setQuality(quality: number): void;
    setMasterVol(level?: number): void;
    setProgram(channel: number, program: number): void;
    send(message: number[], timestamp?: number): void;
    reset(): void;
    allSoundOff(channel: number): void;
  }
}
