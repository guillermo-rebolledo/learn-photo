"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { evaluateAttempt, renderExposure, type ExposureSettings } from "@/lib/exposure-model";
import { lessonOne, lessonOneChallenge } from "@/lib/curriculum";

type Attempt = ExposureSettings & { capturedAt: number };
type Scale = "beginner" | "camera";
type Progress = {
  lesson: string;
  lessonPosition: "explanation" | "experiment" | "feedback";
  settings: ExposureSettings;
  previousAttempt: Attempt | null;
  currentAttempt: Attempt | null;
  completed: boolean;
  scale: Scale;
};

const storageKey = "learn-photo-progress";
const defaults: Progress = {
  lesson: "light-and-exposure",
  lessonPosition: "explanation",
  settings: { aperture: 5.6, shutter: 60, iso: 400 },
  previousAttempt: null,
  currentAttempt: null,
  completed: false,
  scale: "beginner",
};

function readProgress(): Progress {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

function settingLabel(settings: ExposureSettings) {
  return `f/${settings.aperture} · 1/${settings.shutter}s · ISO ${settings.iso}`;
}

const beginnerValues = {
  aperture: [2.8, 4, 5.6, 8, 11],
  shutter: [30, 60, 125, 250, 500],
  iso: [100, 200, 400, 800, 1600],
} as const;

const cameraValues = {
  aperture: [2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11],
  shutter: [30, 40, 50, 60, 80, 100, 125, 160, 200, 250, 320, 400, 500],
  iso: [100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600],
} as const;

export function LessonOne({ explanation }: { explanation: React.ReactNode }) {
  const [progress, setProgress] = useState(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const skipNextSave = useRef(false);

  useEffect(() => {
    setProgress(readProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || progress.lessonPosition === "explanation") return;
    document.getElementById(progress.lessonPosition)?.scrollIntoView({ block: "start" });
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [hydrated, progress]);

  const rendered = useMemo(() => renderExposure(progress.settings), [progress.settings]);
  const feedback = progress.currentAttempt ? evaluateAttempt(progress.currentAttempt) : null;
  const currentAttemptComplete = feedback && Object.values(feedback).every(({ status }) => status === "Achieved");

  function updateSetting(name: keyof ExposureSettings, value: string) {
    setProgress((current) => ({ ...current, lessonPosition: "experiment", settings: { ...current.settings, [name]: Number(value) } }));
  }

  function takePhoto() {
    const attempt = { ...progress.settings, capturedAt: Date.now() };
    const evaluation = evaluateAttempt(attempt);
    const completed = Object.values(evaluation).every(({ status }) => status === "Achieved");
    setComparing(false);
    setProgress((current) => ({
      ...current,
      previousAttempt: current.currentAttempt,
      currentAttempt: attempt,
      completed: current.completed || completed,
      lessonPosition: "feedback",
    }));
  }

  function resetProgress() {
    localStorage.removeItem(storageKey);
    localStorage.removeItem("learn-photo-theme");
    const defaultTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = defaultTheme;
    document.documentElement.style.colorScheme = defaultTheme;
    window.dispatchEvent(new CustomEvent("learn-photo-theme-reset", { detail: defaultTheme }));
    skipNextSave.current = true;
    setComparing(false);
    setProgress(defaults);
    setResetCount((count) => count + 1);
  }

  return (
    <>
      <section id="explanation" className="lesson-explanation" aria-label="Explanation">
        <p className="eyebrow">Explain</p>
        {explanation}
      </section>

      <section id="experiment" className="experiment" aria-labelledby="experiment-title">
        <div className="experiment-heading">
          <div><p className="eyebrow">Guided experiment</p><h2 id="experiment-title">Make a balanced still life</h2></div>
          <p>Photographic Intention: {lessonOneChallenge.photographicIntention}</p>
        </div>

        <div className="simulator">
          <figure className="lesson-preview">
            <div className="lesson-preview-frame" data-testid="rendered-result">
              <Image src="/images/neutral-still-life-960.jpg" alt="A tabletop still life with fruit, cups, and books in window light" fill priority sizes="(max-width: 800px) 100vw, 58vw" style={{ filter: `brightness(${rendered.baseBrightness})` }} />
              <span className="scene-highlight-layer" style={{ opacity: rendered.highlightOpacity }} />
              <div className="preview-readout"><span>Neutral Still Life</span><strong>{settingLabel(progress.settings)}</strong></div>
            </div>
            <figcaption aria-live="polite">{rendered.description}</figcaption>
          </figure>

          <div className="camera-controls">
            <label>Aperture
              <select aria-label="Aperture" disabled={!hydrated} value={progress.settings.aperture} onChange={(event) => updateSetting("aperture", event.target.value)}>
                {(progress.scale === "camera" ? cameraValues.aperture : beginnerValues.aperture).map((value) => <option key={value} value={value}>f/{value}</option>)}
              </select>
            </label>
            <label>Shutter speed
              <select aria-label="Shutter speed" disabled={!hydrated} value={progress.settings.shutter} onChange={(event) => updateSetting("shutter", event.target.value)}>
                {(progress.scale === "camera" ? cameraValues.shutter : beginnerValues.shutter).map((value) => <option key={value} value={value}>1/{value}s</option>)}
              </select>
            </label>
            <label>ISO
              <select aria-label="ISO" disabled={!hydrated} value={progress.settings.iso} onChange={(event) => updateSetting("iso", event.target.value)}>
                {(progress.scale === "camera" ? cameraValues.iso : beginnerValues.iso).map((value) => <option key={value} value={value}>ISO {value}</option>)}
              </select>
            </label>
            <label>Control scale
              <select aria-label="Control scale" disabled={!hydrated} value={progress.scale} onChange={(event) => setProgress((current) => ({ ...current, scale: event.target.value as Scale }))}>
                <option value="beginner">Beginner Scale</option><option value="camera">Camera Scale</option>
              </select>
            </label>
            <button className="button primary-button capture-button" disabled={!hydrated} onClick={takePhoto}>Take photo</button>
          </div>
        </div>
      </section>

      {feedback && (
        <section id="feedback" className="feedback" aria-labelledby="feedback-title" aria-live="polite">
          <p className="eyebrow">Criterion Status</p>
          <h2 id="feedback-title">Tradeoff Feedback</h2>
          <div className="criteria">
            {([["Usable exposure", feedback.exposure], ["Highlight detail", feedback.highlights]] as const).map(([name, criterion]) => (
              <article key={name}><h3>{name}</h3><strong className={`status status-${criterion.status.toLowerCase()}`}>{criterion.status}</strong><p>{criterion.explanation}</p></article>
            ))}
          </div>
          {currentAttemptComplete && <p className="completion"><strong>Lesson complete</strong> — you achieved every essential Success Criterion.</p>}
          {progress.previousAttempt && <button className="button secondary-button" onClick={() => setComparing((value) => !value)}>Compare with previous Attempt</button>}
          {comparing && progress.previousAttempt && <p className="comparison">Previous Attempt: {settingLabel(progress.previousAttempt)} · Current Attempt: {settingLabel(progress.currentAttempt!)}</p>}
        </section>
      )}

      <details className="sources"><summary>Sources and further reading</summary><ul>{lessonOne.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
      <div className="lesson-actions"><button className="text-button" onClick={resetProgress}>Reset progress</button>{resetCount > 0 && <p key={resetCount} role="status">Progress and theme preference reset.</p>}</div>
      <p className="photo-credit">Source Photograph: Ruth Hartnup · <a href="https://commons.wikimedia.org/wiki/File:Still_life_-_various_objects_on_table.jpg">CC BY 2.0</a></p>
    </>
  );
}
