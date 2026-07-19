"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ChoosingSettingsContent from "@/content/lessons/choosing-settings.mdx";
import { capstoneDefinitions, evaluateCapstone, type CapstonePath, type CapstoneResult } from "@/lib/capstone-model";
import type { ExposureSettings } from "@/lib/exposure-model";
import { lessonEight } from "@/lib/curriculum";

const storageKey = "learn-photo-progress";
const paths: CapstonePath[] = ["motion", "depth", "lowLight"];
const images = { motion: "moving-cyclist-960.jpg", depth: "window-light-portrait-960.jpg", lowLight: "dim-indoor-performance-960.jpg" } as const;

type SavedCapstone = { settings?: Partial<Record<CapstonePath, ExposureSettings>>; results?: Partial<Record<CapstonePath, CapstoneResult>>; completed?: CapstonePath[] };

function readSaved(): SavedCapstone {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return value?.capstone && typeof value.capstone === "object" ? value.capstone : {};
  } catch { return {}; }
}

export function LessonEight() {
  const [settings, setSettings] = useState<Record<CapstonePath, ExposureSettings>>(() => Object.fromEntries(paths.map((path) => [path, { ...capstoneDefinitions[path].defaults }])) as Record<CapstonePath, ExposureSettings>);
  const [results, setResults] = useState<Partial<Record<CapstonePath, CapstoneResult>>>({});
  const [completed, setCompleted] = useState<CapstonePath[]>([]);
  const [hints, setHints] = useState<CapstonePath[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    setSettings((current) => ({ ...current, ...saved.settings }));
    setResults(saved.results ?? {});
    setCompleted(saved.completed?.filter((path): path is CapstonePath => paths.includes(path)) ?? []);
    setHydrated(true);
  }, []);

  function persist(nextSettings: typeof settings, nextResults: typeof results, nextCompleted: CapstonePath[]) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      const capstoneComplete = nextCompleted.length === paths.length;
      const completedLessons = Array.isArray(saved.completedLessons) ? saved.completedLessons.filter((item: unknown) => typeof item === "string") : [];
      localStorage.setItem(storageKey, JSON.stringify({ ...saved, lesson: lessonEight.slug, capstone: { settings: nextSettings, results: nextResults, completed: nextCompleted }, capstoneComplete, completedChallenges: [...new Set([...(Array.isArray(saved.completedChallenges) ? saved.completedChallenges : []), ...nextCompleted.map((path) => `capstone-${path}`)])], completedLessons: capstoneComplete ? [...new Set([...completedLessons, lessonEight.slug])] : completedLessons }));
    } catch { /* Progress is optional; the Capstone remains usable. */ }
  }

  function update(path: CapstonePath, control: keyof ExposureSettings, value: number) {
    const next = { ...settings, [path]: { ...settings[path], [control]: value } };
    setSettings(next);
    persist(next, results, completed);
  }

  function attempt(path: CapstonePath) {
    const evaluated = evaluateCapstone(path, settings[path]);
    const nextResults = { ...results, [path]: evaluated };
    const nextCompleted = evaluated.complete ? [...new Set([...completed, path])] : completed.filter((item) => item !== path);
    setResults(nextResults);
    setCompleted(nextCompleted);
    persist(settings, nextResults, nextCompleted);
  }

  const capstoneComplete = completed.length === paths.length;

  return <>
    <section className="lesson-explanation"><ChoosingSettingsContent /></section>
    <section className="experiment capstone" aria-labelledby="capstone-title">
      <div className="experiment-heading"><div><p className="eyebrow">Three-part Capstone</p><h2 id="capstone-title">Put the whole model to work</h2></div><p>Motion, depth of field, and low light each allow multiple valid solutions. Only essential criteria govern completion.</p></div>
      <div className="capstone-challenges">
        {paths.map((path) => {
          const definition = capstoneDefinitions[path];
          const result = results[path];
          const prefix = path === "lowLight" ? "Low-light" : path === "depth" ? "Depth" : "Motion";
          return <article className="capstone-challenge" key={path} role="region" aria-label={definition.regionLabel}>
            <header><p className="eyebrow">{path === "depth" ? "Film Constraint · " : ""}{prefix}</p><h3>{definition.title}</h3><p><strong>Photographic Intention:</strong> {definition.intention}</p></header>
            <div className="simulator">
              <figure className="lesson-preview"><div className="lesson-preview-frame"><Image src={`/images/${images[path]}`} alt="Curated Scene for this Capstone Challenge" fill priority={path === "motion"} sizes="(max-width: 900px) 100vw, 55vw" /></div></figure>
              <div className="camera-controls">
                <label>{prefix} aperture<select aria-label={`${prefix} aperture`} disabled={!hydrated} value={settings[path].aperture} onChange={(event) => update(path, "aperture", Number(event.target.value))}>{definition.controls.aperture.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
                <label>{prefix} shutter<select aria-label={`${prefix} shutter`} disabled={!hydrated} value={settings[path].shutter} onChange={(event) => update(path, "shutter", Number(event.target.value))}>{definition.controls.shutter.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
                <label>{prefix} ISO<select aria-label={`${prefix} ISO`} disabled={!hydrated || path === "depth"} value={settings[path].iso} onChange={(event) => update(path, "iso", Number(event.target.value))}>{definition.controls.iso.map((value) => <option key={value} value={value}>ISO {value}</option>)}</select>{path === "depth" && <span>Fixed across the roll</span>}</label>
                <button className="button primary-button capture-button" onClick={() => attempt(path)}>{result ? "Retry" : "Take photo"}</button>
                <button className="text-button" onClick={() => setHints((current) => [...new Set([...current, path])])}>Show hint</button>
                {hints.includes(path) && <p className="capstone-hint"><strong>Hint:</strong> {definition.hint}</p>}
              </div>
            </div>
            {result && <div className="feedback capstone-feedback" aria-live="polite"><h3>{result.complete ? "Challenge complete" : "Review the result"}</h3><div className="criteria">{result.criteria.map((criterion) => <article key={criterion.id} aria-label={`${criterion.label}${criterion.essential ? " essential" : " optional"}`}><h4>{criterion.label} {!criterion.essential && <small>Optional</small>}</h4><strong className={`status status-${criterion.result.status.toLowerCase()}`}>{criterion.result.status}</strong><p>{criterion.result.explanation}</p></article>)}</div><p><strong>Tradeoff Feedback:</strong> Try another combination if you want; there is no grade or single hidden answer.</p></div>}
          </article>;
        })}
      </div>
      {capstoneComplete && <div className="feedback capstone-complete" aria-live="polite"><p className="eyebrow">Progress updated</p><h2>Capstone complete</h2><p>Your Learning Path is complete. Every Lesson and the Sandbox remain open for review and experimentation.</p></div>}
    </section>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonEight.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
  </>;
}
