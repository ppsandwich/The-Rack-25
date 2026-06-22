import type { Preset } from "../types";

const KEY = "rack25:userPresets:v1";

export const loadUserPresets = (): Preset[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((preset) => preset && preset.schemaVersion === 1 && preset.source === "user") : [];
  } catch (error) {
    console.warn("Unable to load Rack-25 user presets", error);
    return [];
  }
};

export const saveUserPresets = (presets: Preset[]) => {
  localStorage.setItem(KEY, JSON.stringify(presets));
};

export const makeUserPreset = (preset: Omit<Preset, "id" | "schemaVersion" | "source" | "author" | "createdAt" | "updatedAt">): Preset => {
  const now = new Date().toISOString();
  return {
    ...preset,
    id: `user-${crypto.randomUUID()}`,
    schemaVersion: 1,
    source: "user",
    author: "You",
    createdAt: now,
    updatedAt: now
  };
};

export const validateImportedPreset = (value: unknown, engineIds: string[]): Preset => {
  if (!value || typeof value !== "object") throw new Error("Preset JSON must be an object.");
  const preset = value as Partial<Preset>;
  if (!preset.engineId || typeof preset.engineId !== "string") throw new Error("This preset is missing an engine ID.");
  if (!engineIds.includes(preset.engineId)) throw new Error("This preset belongs to an engine that is not installed.");
  if (!preset.name || typeof preset.name !== "string") throw new Error("This preset is missing a name.");
  if (!preset.parameters || typeof preset.parameters !== "object") throw new Error("This preset is missing parameters.");
  return makeUserPreset({
    engineId: preset.engineId,
    name: preset.name,
    tags: Array.isArray(preset.tags) ? preset.tags.filter((tag): tag is string => typeof tag === "string") : ["Imported"],
    parameters: preset.parameters as Record<string, number>,
    macros: (preset.macros as Record<string, number>) ?? {}
  });
};
