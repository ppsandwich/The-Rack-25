import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Download, FileUp, Info, KeyboardMusic, Piano, Power, Save, Settings, SlidersHorizontal, VolumeX } from "lucide-react";
import { RackAudio } from "./audio/RackAudio";
import { builtInPresets, engines, getDefaultPreset } from "./data/engineCatalog";
import { loadUserPresets, makeUserPreset, saveUserPresets, validateImportedPreset } from "./storage/presets";
import type { EngineDefinition, GlobalEffects, ParameterDefinition, Preset } from "./types";
import "./styles.css";

type MidiInput = {
  onmidimessage: ((message: { data: Uint8Array }) => void) | null;
};

type MidiAccess = {
  inputs: Map<string, MidiInput>;
  onstatechange: (() => void) | null;
};

const KEYBOARD_MAP: Record<string, number> = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, o: 73, l: 74, p: 75, ";": 76
};

const defaultEffects: GlobalEffects = { tone: 0, chorus: 0.1, delay: 0.08, delayTime: 0.24, delayFeedback: 0.22, reverb: 0.18, reverbSize: 0.4, master: 0.72 };
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteLabel = (midi: number) => `${noteNames[midi % 12]}${Math.floor(midi / 12) - 1}`;

function App() {
  const audio = useRef(new RackAudio());
  const fileRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [engineId, setEngineId] = useState("warm-analog");
  const engine = useMemo(() => engines.find((item) => item.id === engineId) ?? engines[0], [engineId]);
  const [userPresets, setUserPresets] = useState<Preset[]>(() => loadUserPresets());
  const [preset, setPreset] = useState<Preset>(() => getDefaultPreset("warm-analog"));
  const [params, setParams] = useState<Record<string, number>>(preset.parameters);
  const [macros, setMacros] = useState<Record<string, number>>(preset.macros);
  const [effects, setEffects] = useState<GlobalEffects>(defaultEffects);
  const [engineQuery, setEngineQuery] = useState("");
  const [presetQuery, setPresetQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [dirty, setDirty] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [midiStatus, setMidiStatus] = useState("MIDI not connected");
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [toast, setToast] = useState("");

  const presetsForEngine = useMemo(() => [...builtInPresets, ...userPresets].filter((item) => item.engineId === engine.id && item.name.toLowerCase().includes(presetQuery.toLowerCase())), [engine.id, presetQuery, userPresets]);
  const visibleEngines = useMemo(() => engines.filter((item) => (tag === "All" || item.tags.includes(tag)) && item.name.toLowerCase().includes(engineQuery.toLowerCase())), [engineQuery, tag]);

  useEffect(() => {
    audio.current.setParams(params);
  }, [params]);

  useEffect(() => {
    audio.current.applyEffects(effects);
  }, [effects]);

  useEffect(() => saveUserPresets(userPresets), [userPresets]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const note = KEYBOARD_MAP[event.key.toLowerCase()];
      if (note === undefined) return;
      event.preventDefault();
      playNote(note);
    };
    const up = (event: KeyboardEvent) => {
      const note = KEYBOARD_MAP[event.key.toLowerCase()];
      if (note !== undefined) stopNote(note);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [ready]);

  useEffect(() => {
    const nav = navigator as Navigator & { requestMIDIAccess?: () => Promise<MidiAccess> };
    if (!nav.requestMIDIAccess) {
      setMidiStatus("MIDI unavailable in this browser");
      return;
    }
    nav.requestMIDIAccess().then((access) => {
      const update = () => setMidiStatus(access.inputs.size ? `${access.inputs.size} MIDI input${access.inputs.size === 1 ? "" : "s"}` : "No MIDI devices");
      access.inputs.forEach((input) => {
        input.onmidimessage = (message) => {
          const data = message.data;
          if (!data) return;
          const status = data[0] ?? 0;
          const note = data[1] ?? 0;
          const velocity = data[2] ?? 0;
          const command = status & 0xf0;
          if (command === 0x90 && velocity > 0) playNote(note, velocity / 127);
          if (command === 0x80 || (command === 0x90 && velocity === 0)) stopNote(note);
        };
      });
      access.onstatechange = update;
      update();
    }).catch(() => setMidiStatus("MIDI permission denied"));
  }, [ready]);

  const wake = async () => {
    await audio.current.start();
    await audio.current.setEngine(engine, params);
    setReady(true);
  };

  const selectEngine = async (next: EngineDefinition) => {
    if (dirty && !window.confirm("Switch engines and lose these tweaks?")) return;
    audio.current.allNotesOff();
    const nextPreset = getDefaultPreset(next.id);
    setEngineId(next.id);
    setPreset(nextPreset);
    setParams(nextPreset.parameters);
    setMacros(nextPreset.macros);
    setDirty(false);
    await audio.current.setEngine(next, nextPreset.parameters);
  };

  const loadPreset = (next: Preset) => {
    if (dirty && !window.confirm("Load this preset and lose these tweaks?")) return;
    audio.current.allNotesOff();
    setPreset(next);
    setParams(next.parameters);
    setMacros(next.macros);
    setDirty(false);
    audio.current.setParams(next.parameters);
  };

  const setParam = (param: ParameterDefinition, value: number) => {
    const next = Math.min(param.max, Math.max(param.min, value));
    setParams((current) => ({ ...current, [param.id]: Number(next.toFixed(4)) }));
    setDirty(true);
  };

  const setMacro = (id: string, value: number) => {
    const macro = engine.macros.find((item) => item.id === id);
    setMacros((current) => ({ ...current, [id]: value }));
    if (macro) {
      setParams((current) => {
        const next = { ...current };
        macro.parameterIds.forEach((paramId) => {
          const def = engine.parameters.find((param) => param.id === paramId);
          if (def) next[paramId] = Number((def.min + (def.max - def.min) * value).toFixed(4));
        });
        return next;
      });
    }
    setDirty(true);
  };

  const playNote = (note: number, velocity = 0.86) => {
    if (!ready) return;
    audio.current.noteOn(note, velocity);
    setActiveNotes((current) => new Set(current).add(note));
  };

  const stopNote = (note: number) => {
    audio.current.noteOff(note);
    setActiveNotes((current) => {
      const next = new Set(current);
      next.delete(note);
      return next;
    });
  };

  const panic = () => {
    audio.current.allNotesOff();
    setActiveNotes(new Set());
  };

  const savePreset = () => {
    const name = window.prompt("Preset name", preset.source === "built-in" ? `${preset.name} Copy` : preset.name);
    if (!name) return;
    const next = makeUserPreset({ engineId: engine.id, name, tags: ["User", engine.family], parameters: params, macros });
    setUserPresets((current) => [next, ...current]);
    setPreset(next);
    setDirty(false);
    setToast("Preset saved locally");
  };

  const deletePreset = (id: string) => {
    if (!window.confirm("Delete this user preset?")) return;
    setUserPresets((current) => current.filter((item) => item.id !== id));
    if (preset.id === id) loadPreset(getDefaultPreset(engine.id));
  };

  const exportPresets = (all = false) => {
    const payload = all ? userPresets : preset;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = all ? "rack25-user-presets.json" : `${preset.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPresets = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const imported = Array.isArray(parsed) ? parsed.map((item) => validateImportedPreset(item, engines.map((e) => e.id))) : [validateImportedPreset(parsed, engines.map((e) => e.id))];
      setUserPresets((current) => [...imported, ...current]);
      setToast(`Imported ${imported.length} preset${imported.length === 1 ? "" : "s"}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "This preset could not be imported.");
    }
  };

  return (
    <main className="app">
      {!ready && (
        <div className="wake">
          <div>
            <h1>Wake the rack</h1>
            <p>Browsers are shy about audio. Tap once and we'll plug the little beast in.</p>
            <button className="primary" onClick={wake}><Power size={18} /> Start playing</button>
          </div>
        </div>
      )}

      <header className="topbar">
        <div>
          <strong>The Rack-25</strong>
          <span>Twenty-five little sound machines. One warm wooden rack.</span>
        </div>
        <div className="now">
          <b>{engine.name}</b>
          <small>{preset.name}{dirty ? " *" : ""}</small>
        </div>
        <div className="status">
          <span><KeyboardMusic size={16} /> Computer keys on</span>
          <span><Piano size={16} /> {midiStatus}</span>
          <button onClick={panic}><VolumeX size={16} /> Panic</button>
          <button onClick={() => setShowSettings(true)}><Settings size={16} /> Settings</button>
          <button onClick={() => setShowCredits(true)}><Info size={16} /> Credits</button>
        </div>
      </header>

      <section className="rack">
        <aside className="browser">
          <div className="section-title">Engines</div>
          <input value={engineQuery} onChange={(e) => setEngineQuery(e.target.value)} placeholder="Search engines" />
          <div className="chips">
            {["All", "Bass", "Lead", "Pad", "Keys", "Percussion", "Texture", "Experimental"].map((item) => <button key={item} className={tag === item ? "active" : ""} onClick={() => setTag(item)}>{item}</button>)}
          </div>
          <div className="engine-list">
            {visibleEngines.map((item) => (
              <button key={item.id} className={item.id === engine.id ? "engine active" : "engine"} onClick={() => selectEngine(item)}>
                <b>{item.name}</b>
                <span>{item.description}</span>
                <small>{item.family} · {item.cpu} CPU · {item.playMode}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="center">
          <div className="macro-strip">
            {engine.macros.map((macro) => (
              <label key={macro.id} className="macro">
                <span>{macro.label}</span>
                <input type="range" min="0" max="1" step="0.01" value={macros[macro.id] ?? 0.5} onChange={(e) => setMacro(macro.id, Number(e.target.value))} />
                <small>{Math.round((macros[macro.id] ?? 0) * 100)}</small>
              </label>
            ))}
          </div>

          <div className="panel-head">
            <div>
              <h2>{engine.name}</h2>
              <p>{engine.description}</p>
            </div>
            <button className="primary" onClick={savePreset}><Save size={16} /> Save preset</button>
          </div>

          <div className="params">
            {groupParameters(engine.parameters).map(([group, groupParams]) => (
              <section key={group} className={`param-group group-${slugGroup(group)}`}>
                <h3>{group}</h3>
                <div className="control-grid">
                  {(groupParams ?? []).map((param) => (
                    <Control key={param.id} param={param} value={params[param.id] ?? param.default} onChange={(value) => setParam(param, value)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="presets">
          <div className="section-title">Presets</div>
          <input value={presetQuery} onChange={(e) => setPresetQuery(e.target.value)} placeholder="Search presets" />
          <div className="preset-list">
            {presetsForEngine.map((item) => (
              <div key={item.id} className={item.id === preset.id ? "preset active" : "preset"}>
                <button onClick={() => loadPreset(item)}>
                  <b>{item.name}</b>
                  <span>{item.author} · {item.tags.join(", ")}</span>
                </button>
                {item.source === "user" && <button className="icon" title="Delete preset" onClick={() => deletePreset(item.id)}>×</button>}
              </div>
            ))}
          </div>
          <div className="preset-actions">
            <button onClick={() => exportPresets(false)}><Download size={16} /> Export current</button>
            <button onClick={() => exportPresets(true)}><Download size={16} /> Export all</button>
            <button onClick={() => fileRef.current?.click()}><FileUp size={16} /> Import</button>
            <input ref={fileRef} hidden type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importPresets(e.target.files[0])} />
          </div>
        </aside>
      </section>

      <PianoRoll activeNotes={activeNotes} playNote={playNote} stopNote={stopNote} />

      <footer className="foot">
        <span>{engines.length} engines · {builtInPresets.length} built-in presets · zero API routes</span>
        <span>{toast || engine.qaNote}</span>
      </footer>

      {showSettings && <SettingsModal effects={effects} setEffects={setEffects} onClose={() => setShowSettings(false)} />}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </main>
  );
}

function Control({ param, value, onChange }: { param: ParameterDefinition; value: number; onChange: (value: number) => void }) {
  const pct = (value - param.min) / (param.max - param.min);
  const dragStart = useRef<{ y: number; value: number } | null>(null);
  const dragKnob = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { y: event.clientY, value };
  };
  const moveKnob = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const span = param.max - param.min;
    const pixelsForFullRange = event.shiftKey ? 900 : 360;
    const delta = (dragStart.current.y - event.clientY) / pixelsForFullRange;
    const stepped = Math.round((dragStart.current.value + delta * span) / param.step) * param.step;
    onChange(stepped);
  };
  const stopDrag = () => {
    dragStart.current = null;
  };
  return (
    <label className="control" title={param.help}>
      <span>{param.label}</span>
      <div
        className="knob"
        style={{ "--turn": `${pct * 270 - 135}deg` } as React.CSSProperties}
        onPointerDown={dragKnob}
        onPointerMove={moveKnob}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={() => onChange(param.default)}
      >
        <input aria-label={param.label} type="range" min={param.min} max={param.max} step={param.step} value={value} onDoubleClick={() => onChange(param.default)} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
      <small>{formatValue(value, param.unit)}</small>
    </label>
  );
}

function formatValue(value: number, unit?: string) {
  const shown = Math.abs(value) >= 100 ? Math.round(value) : Number(value.toFixed(2));
  return `${shown}${unit ? ` ${unit}` : ""}`;
}

function groupParameters(parameters: ParameterDefinition[]): Array<[string, ParameterDefinition[]]> {
  const groups = new Map<string, ParameterDefinition[]>();
  parameters.forEach((param) => {
    const list = groups.get(param.group) ?? [];
    list.push(param);
    groups.set(param.group, list);
  });
  return Array.from(groups.entries());
}

function slugGroup(group: string) {
  return group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function PianoRoll({ activeNotes, playNote, stopNote }: { activeNotes: Set<number>; playNote: (note: number) => void; stopNote: (note: number) => void }) {
  const notes = Array.from({ length: 25 }, (_, i) => 48 + i);
  const whiteNotes = notes.filter((note) => !noteNames[note % 12].includes("#"));
  let whiteIndex = -1;
  return (
    <div className="keybed">
      {notes.map((note) => {
        const black = noteNames[note % 12].includes("#");
        if (!black) whiteIndex += 1;
        const left = black ? `${(whiteIndex + 1) * (100 / whiteNotes.length)}%` : undefined;
        return (
          <button
            key={note}
            className={`${black ? "black" : "white"} ${activeNotes.has(note) ? "down" : ""}`}
            style={black ? ({ "--key-left": left } as React.CSSProperties) : undefined}
            onPointerDown={(e) => { (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId); playNote(note); }}
            onPointerUp={() => stopNote(note)}
            onPointerCancel={() => stopNote(note)}
          >
            <span>{noteLabel(note)}</span>
          </button>
        );
      })}
    </div>
  );
}

function SettingsModal({ effects, setEffects, onClose }: { effects: GlobalEffects; setEffects: React.Dispatch<React.SetStateAction<GlobalEffects>>; onClose: () => void }) {
  const rows: Array<[keyof GlobalEffects, string, number, number, number]> = [
    ["tone", "Tone", -1, 1, 0.01],
    ["chorus", "Chorus", 0, 1, 0.01],
    ["delay", "Delay", 0, 1, 0.01],
    ["delayTime", "Delay Time", 0.05, 1.2, 0.01],
    ["delayFeedback", "Delay Feedback", 0, 0.9, 0.01],
    ["reverb", "Reverb", 0, 1, 0.01],
    ["reverbSize", "Reverb Size", 0, 1, 0.01],
    ["master", "Master", 0, 1, 0.01]
  ];
  return (
    <div className="modal">
      <section>
        <button className="close" onClick={onClose}>×</button>
        <h2><SlidersHorizontal size={20} /> Settings</h2>
        {rows.map(([key, label, min, max, step]) => (
          <label key={key} className="settings-row">
            <span>{label}</span>
            <input type="range" min={min} max={max} step={step} value={effects[key]} onChange={(e) => setEffects((current) => ({ ...current, [key]: Number(e.target.value) }))} />
            <small>{Number(effects[key].toFixed(2))}</small>
          </label>
        ))}
      </section>
    </div>
  );
}

function CreditsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal credits">
      <section>
        <button className="close" onClick={onClose}>×</button>
        <h2>Open Source Credits</h2>
        <p>Every MVP engine uses original Rack-25 presets. GPL-family and unclear projects are reference-only.</p>
        <div className="credit-list">
          {engines.map((engine) => (
            <article key={engine.id}>
              <b>{engine.name}</b>
              <span>{engine.source.sourceProjectName} · {engine.source.sourceLicence}</span>
              <a href={engine.source.sourceUrl} target="_blank" rel="noreferrer">{engine.source.sourceUrl}</a>
              <small>{engine.source.usageStrategy} · {engine.source.licenceStatus} · presets not bundled · samples not bundled</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
