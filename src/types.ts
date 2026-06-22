export type EngineId = string;

export type ControlType = "knob" | "slider" | "toggle" | "select" | "xy";
export type PlayMode = "poly" | "mono" | "drum-map" | "texture";
export type CpuClass = "Low" | "Medium" | "High";
export type LicenceStatus = "approved-direct-use" | "approved-adapted-use" | "reference-only" | "blocked";
export type UsageStrategy = "direct-dependency" | "adapted-implementation" | "reference-only" | "wasm-candidate";

export type ParameterDefinition = {
  id: string;
  label: string;
  type: ControlType;
  min: number;
  max: number;
  default: number;
  step: number;
  unit?: string;
  group: string;
  help: string;
  options?: { label: string; value: number }[];
};

export type MacroDefinition = {
  id: string;
  label: string;
  parameterIds: string[];
};

export type SourceMetadata = {
  engineId: EngineId;
  sourceProjectName: string;
  sourceUrl: string;
  sourceLicence: string;
  usageStrategy: UsageStrategy;
  licenceStatus: LicenceStatus;
  attributionRequired: boolean;
  presetContentAllowed: boolean;
  sampleContentAllowed: boolean;
  notes: string;
};

export type EngineDefinition = {
  id: EngineId;
  name: string;
  description: string;
  family: string;
  tags: string[];
  cpu: CpuClass;
  playMode: PlayMode;
  polyphony: number;
  source: SourceMetadata;
  parameters: ParameterDefinition[];
  macros: MacroDefinition[];
  model: EngineModel;
  qaNote: string;
};

export type EngineModel = {
  kind:
    | "analog"
    | "fm"
    | "wavetable"
    | "additive"
    | "noise"
    | "sampled"
    | "chip"
    | "drum"
    | "pluck"
    | "modal"
    | "granular"
    | "formant"
    | "crusher"
    | "vector"
    | "hybrid";
  oscillator: OscillatorType;
  secondOscillator?: OscillatorType;
  filter: BiquadFilterType;
  fmRatio?: number;
  harmonicCount?: number;
  noiseLevel?: number;
  drive?: number;
};

export type Preset = {
  id: string;
  schemaVersion: 1;
  engineId: EngineId;
  name: string;
  author: string;
  source: "built-in" | "user";
  tags: string[];
  parameters: Record<string, number>;
  macros: Record<string, number>;
  favourite?: boolean;
  sourceUrl?: string;
  sourceBank?: string;
  sourceSlot?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type GlobalEffects = {
  tone: number;
  chorus: number;
  delay: number;
  delayTime: number;
  delayFeedback: number;
  reverb: number;
  reverbSize: number;
  master: number;
};
