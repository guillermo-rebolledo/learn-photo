"use client";

import { useEffect, useState } from "react";
import { lessonTwo, lessonTwoChallenge } from "@/lib/curriculum";
import { beginnerScale, cameraScale, equivalentExposureStops, formatShutter, nearestScaleSettings, type ExposureSettings } from "@/lib/exposure-scales";

type Scale = "beginner" | "camera";
type Attempt = ExposureSettings & { capturedAt: number };
type Feedback = { status: "Achieved" | "Close" | "Missed"; message: string; tradeoff: string };

const storageKey = "learn-photo-progress";
const defaultSettings: ExposureSettings = { ...lessonTwoChallenge.referenceSettings };

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return {
      scale: (saved.scale === "camera" ? "camera" : "beginner") as Scale,
      settings: { ...defaultSettings, ...saved.lessonTwoSettings } as ExposureSettings,
      currentAttempt: (saved.lessonTwoCurrentAttempt ?? null) as Attempt | null,
      previousAttempt: (saved.lessonTwoPreviousAttempt ?? null) as Attempt | null,
      completed: Boolean(saved.completedChallenges?.includes(lessonTwoChallenge.id)),
    };
  } catch {
    return { scale: "beginner" as Scale, settings: defaultSettings, currentAttempt: null, previousAttempt: null, completed: false };
  }
}

function tradeoffFor(settings: ExposureSettings) {
  const reference = lessonTwoChallenge.referenceSettings;
  const parts: string[] = [];
  if (settings.aperture > reference.aperture) parts.push("The narrower aperture can give a wider depth of field.");
  if (settings.aperture < reference.aperture) parts.push("The wider aperture can give a shallower depth of field.");
  if (settings.shutter > reference.shutter) parts.push("The faster shutter can freeze motion more clearly.");
  if (settings.shutter < reference.shutter) parts.push("The slower shutter can show more camera or subject motion.");
  if (settings.iso > reference.iso) parts.push("The higher ISO preserves brightness here, but can make noise more visible.");
  if (settings.iso < reference.iso) parts.push("The lower ISO can reduce visible noise.");
  return parts.join(" ") || "Choose a different combination to reveal its tradeoffs.";
}

export function LessonTwo({ explanation }: { explanation: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [scale, setScale] = useState<Scale>("beginner");
  const [settings, setSettings] = useState<ExposureSettings>(defaultSettings);
  const [isoDemonstration, setIsoDemonstration] = useState(400);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<Attempt | null>(null);
  const [completed, setCompleted] = useState(false);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    setScale(saved.scale);
    setSettings(saved.settings);
    setCurrentAttempt(saved.currentAttempt);
    setPreviousAttempt(saved.previousAttempt);
    setCompleted(saved.completed);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    const completedChallenges = new Set<string>(saved.completedChallenges ?? []);
    if (completed) completedChallenges.add(lessonTwoChallenge.id);
    localStorage.setItem(storageKey, JSON.stringify({ ...saved, lesson: lessonTwo.slug, scale, lessonTwoSettings: settings, lessonTwoCurrentAttempt: currentAttempt, lessonTwoPreviousAttempt: previousAttempt, completedChallenges: [...completedChallenges] }));
  }, [completed, currentAttempt, hydrated, previousAttempt, scale, settings]);

  const values = scale === "camera" ? cameraScale : beginnerScale;

  function update(name: keyof ExposureSettings, value: string) {
    setFeedback(null);
    setSettings((current) => ({ ...current, [name]: Number(value) }));
  }

  function checkAttempt() {
    const difference = equivalentExposureStops(lessonTwoChallenge.referenceSettings, settings);
    const achieved = Math.abs(difference) <= lessonTwoChallenge.equivalentWithinStops
      && Object.keys(settings).some((key) => settings[key as keyof ExposureSettings] !== lessonTwoChallenge.referenceSettings[key as keyof ExposureSettings]);
    const status = achieved ? "Achieved" : Math.abs(difference) <= 1 ? "Close" : "Missed";
    const attempt = { ...settings, capturedAt: Date.now() };
    setPreviousAttempt(currentAttempt);
    setCurrentAttempt(attempt);
    setCompleted((value) => value || achieved);
    setComparing(false);
    setFeedback({
      status,
      message: lessonTwoChallenge.successCriteria[0].feedback[status.toLowerCase() as "achieved" | "close" | "missed"],
      tradeoff: tradeoffFor(settings),
    });
  }

  function changeScale(next: Scale) {
    setScale(next);
    setSettings((current) => nearestScaleSettings(current, next === "camera" ? cameraScale : beginnerScale));
    setFeedback(null);
  }

  return <>
    <section className="lesson-explanation" aria-label="Explanation">{explanation}</section>
    <section className="stop-demo" aria-labelledby="stop-demo-title">
      <p className="eyebrow">Guided experiment</p>
      <h2 id="stop-demo-title">Make doubling visible</h2>
      <p>Start at ISO 400. Double or halve the rendered response one full Stop at a time.</p>
      <div className="stop-demo-controls">
        <button className="button secondary-button" disabled={isoDemonstration <= 100} onClick={() => setIsoDemonstration((value) => value / 2)}>Halve ISO</button>
        <strong aria-live="polite">ISO {isoDemonstration} is {isoDemonstration === 400 ? "the starting value" : `${Math.abs(Math.log2(isoDemonstration / 400)) === 1 ? "one" : Math.abs(Math.log2(isoDemonstration / 400))} Stop${Math.abs(Math.log2(isoDemonstration / 400)) === 1 ? "" : "s"} ${isoDemonstration > 400 ? "brighter" : "darker"} than ISO 400`}.</strong>
        <button className="button secondary-button" disabled={isoDemonstration >= 12800} onClick={() => setIsoDemonstration((value) => value * 2)}>Double ISO</button>
      </div>
    </section>
    <section className="experiment" aria-labelledby="equivalent-title">
      <div className="experiment-heading"><div><p className="eyebrow">Challenge</p><h2 id="equivalent-title">Find an equivalent exposure</h2></div><p>{lessonTwoChallenge.photographicIntention}</p></div>
      <div className="reference-settings"><strong>Reference</strong><span>f/4 · 1/125s · ISO 400</span></div>
      <div className="equivalent-controls">
        <label>Challenge aperture<select aria-label="Challenge aperture" disabled={!hydrated} value={settings.aperture} onChange={(event) => update("aperture", event.target.value)}>{values.aperture.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
        <label>Challenge shutter speed<select aria-label="Challenge shutter speed" disabled={!hydrated} value={settings.shutter} onChange={(event) => update("shutter", event.target.value)}>{values.shutter.map((value) => <option key={value} value={value}>{formatShutter(value)}</option>)}</select></label>
        <label>Challenge ISO<select aria-label="Challenge ISO" disabled={!hydrated} value={settings.iso} onChange={(event) => update("iso", event.target.value)}>{values.iso.map((value) => <option key={value} value={value}>ISO {value}</option>)}</select></label>
        <label>Control scale<select aria-label="Control scale" disabled={!hydrated} value={scale} onChange={(event) => changeScale(event.target.value as Scale)}><option value="beginner">Beginner Scale</option><option value="camera">Camera Scale</option></select></label>
      </div>
      <button className="button primary-button capture-button" disabled={!hydrated} onClick={checkAttempt}>Take photo</button>
      {completed && !feedback && <p className="completion"><strong>Challenge complete</strong> — your successful Attempt is saved in browser-local Progress.</p>}
      {feedback && <div className="feedback equivalent-feedback" aria-live="polite"><p className="eyebrow">Criterion Status</p><h3>{feedback.status === "Achieved" ? "Challenge complete" : "Keep experimenting"}</h3><article><h4>{lessonTwoChallenge.successCriteria[0].label}</h4><strong className={`status status-${feedback.status.toLowerCase()}`}>{feedback.status}</strong><p>{feedback.message}</p></article><p><strong>Tradeoff Feedback:</strong> {feedback.tradeoff}</p>{previousAttempt && <button className="button secondary-button" onClick={() => setComparing((value) => !value)}>Compare with previous Attempt</button>}{comparing && previousAttempt && currentAttempt && <p>Previous Attempt: f/{previousAttempt.aperture} · {formatShutter(previousAttempt.shutter)} · ISO {previousAttempt.iso} · Current Attempt: f/{currentAttempt.aperture} · {formatShutter(currentAttempt.shutter)} · ISO {currentAttempt.iso}</p>}</div>}
    </section>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonTwo.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
  </>;
}
