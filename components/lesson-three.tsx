"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { evaluatePortraitAttempt, portraitDepth, portraitExposureStops, type PortraitIntention } from "@/lib/aperture-model";
import { lessonThree, lessonThreeChallenge, windowLightPortraitScene } from "@/lib/curriculum";
import type { ExposureSettings } from "@/lib/exposure-model";

const apertures = [2, 2.8, 4, 5.6, 8, 11];
const shutters = [30, 60, 125, 250, 500];
const isos = [100, 200, 400, 800, 1600];
const storageKey = "learn-photo-progress";
type PortraitAttempt = ExposureSettings & { intention: PortraitIntention; capturedAt: number };

function readSaved() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch { return {}; }
}

export function LessonThree({ explanation }: { explanation: React.ReactNode }) {
  const [guidedAperture, setGuidedAperture] = useState(5.6);
  const [intention, setIntention] = useState<PortraitIntention>("soft-background");
  const [settings, setSettings] = useState<ExposureSettings>({ ...windowLightPortraitScene.meterReference });
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluatePortraitAttempt> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<PortraitAttempt | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<PortraitAttempt | null>(null);
  const [comparing, setComparing] = useState(false);
  const guidedDepth = portraitDepth(guidedAperture);
  const challengeDepth = portraitDepth(settings.aperture);
  const exposure = portraitExposureStops(settings);
  const complete = feedback && Object.values(feedback).every(({ status }) => status === "Achieved");
  const guidedStops = useMemo(() => Math.round((2 * Math.log2(5.6 / guidedAperture)) * 10) / 10, [guidedAperture]);

  useEffect(() => {
    const saved = readSaved();
    if (saved.lessonThreeSettings && typeof saved.lessonThreeSettings === "object") {
      const savedSettings = saved.lessonThreeSettings as Partial<ExposureSettings>;
      setSettings((current) => ({ ...current, ...savedSettings }));
    }
    if (saved.lessonThreeIntention === "defined-background") setIntention("defined-background");
    setCurrentAttempt((saved.lessonThreeCurrentAttempt ?? null) as PortraitAttempt | null);
    setPreviousAttempt((saved.lessonThreePreviousAttempt ?? null) as PortraitAttempt | null);
    setCompleted(Array.isArray(saved.completedChallenges) && saved.completedChallenges.includes(lessonThreeChallenge.id));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved = readSaved();
    const completedChallenges = new Set(Array.isArray(saved.completedChallenges) ? saved.completedChallenges.filter((item): item is string => typeof item === "string") : []);
    if (completed) completedChallenges.add(lessonThreeChallenge.id);
    localStorage.setItem(storageKey, JSON.stringify({ ...saved, lesson: lessonThree.slug, lessonThreeSettings: settings, lessonThreeIntention: intention, lessonThreeCurrentAttempt: currentAttempt, lessonThreePreviousAttempt: previousAttempt, completedChallenges: [...completedChallenges] }));
  }, [completed, currentAttempt, hydrated, intention, previousAttempt, settings]);

  function update(name: keyof ExposureSettings, value: string) {
    setSettings((current) => ({ ...current, [name]: Number(value) }));
    setFeedback(null);
  }

  return <>
    <section className="lesson-explanation" aria-label="Explanation">{explanation}</section>
    <section className="experiment" aria-labelledby="aperture-experiment-title">
      <div className="experiment-heading"><div><p className="eyebrow">Guided experiment</p><h2 id="aperture-experiment-title">Open the lens, soften the room</h2></div><p>Only aperture changes here, so both Captured Light and relative depth change together.</p></div>
      <div className="simulator portrait-simulator">
        <PortraitPreview aperture={guidedAperture} depth={guidedDepth} label={`f/${guidedAperture}`} />
        <div className="camera-controls">
          <label>Guided aperture<select aria-label="Guided aperture" value={guidedAperture} onChange={(event) => setGuidedAperture(Number(event.target.value))}>{apertures.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
          <p className="control-outcome" aria-live="polite">{guidedDepth.description} Relative to f/5.6, this aperture records {guidedStops === 0 ? "the same Captured Light" : `${Math.abs(guidedStops)} Stop${Math.abs(guidedStops) === 1 ? "" : "s"} ${guidedStops > 0 ? "more" : "less"} Captured Light`}.</p>
        </div>
      </div>
      <details className="scene-assumptions"><summary>Why this varies in real life</summary><p>This Curated Scene assumes an APS-C format Camera, 50 mm focal length, 2.2 m focus distance, a still subject, and a handheld Camera. Change any of those, or change subject-to-background distance, and the real depth of field changes. These are fixed Scene Assumptions, not additional controls.</p></details>
    </section>
    <section className="experiment" aria-labelledby="portrait-challenge-title">
      <div className="experiment-heading"><div><p className="eyebrow">Challenge</p><h2 id="portrait-challenge-title">Choose the portrait’s depth</h2></div><p>{lessonThreeChallenge.photographicIntentions[intention].label}</p></div>
      <div className="simulator portrait-simulator">
        <PortraitPreview aperture={settings.aperture} depth={challengeDepth} label={`f/${settings.aperture} · 1/${settings.shutter}s · ISO ${settings.iso}`} exposure={exposure} />
        <div className="camera-controls">
          <label>Portrait intention<select aria-label="Portrait intention" value={intention} onChange={(event) => { setIntention(event.target.value as PortraitIntention); setFeedback(null); }}><option value="soft-background">Soft background</option><option value="defined-background">Defined background</option></select></label>
          <label>Challenge aperture<select aria-label="Challenge aperture" value={settings.aperture} onChange={(event) => update("aperture", event.target.value)}>{apertures.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
          <label>Challenge shutter speed<select aria-label="Challenge shutter speed" value={settings.shutter} onChange={(event) => update("shutter", event.target.value)}>{shutters.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
          <label>Challenge ISO<select aria-label="Challenge ISO" value={settings.iso} onChange={(event) => update("iso", event.target.value)}>{isos.map((value) => <option key={value} value={value}>ISO {value}</option>)}</select></label>
          <button className="button primary-button capture-button" disabled={!hydrated} onClick={() => { const nextFeedback = evaluatePortraitAttempt(settings, intention); const attempt = { ...settings, intention, capturedAt: Date.now() }; setPreviousAttempt(currentAttempt); setCurrentAttempt(attempt); setComparing(false); setFeedback(nextFeedback); setCompleted((value) => value || Object.values(nextFeedback).every(({ status }) => status === "Achieved")); }}>Take photo</button>
        </div>
      </div>
      {completed && !feedback && <p className="completion"><strong>Challenge complete</strong> — your successful Attempt is saved in browser-local Progress.</p>}
      {feedback && <div className="feedback portrait-feedback" aria-live="polite"><p className="eyebrow">Criterion Status</p><h3>{complete ? "Challenge complete" : "Keep experimenting"}</h3><div className="criteria">{([["Usable exposure", feedback.exposure], ["Intended depth of field", feedback.depth]] as const).map(([label, criterion]) => <article key={label}><h4>{label}</h4><strong className={`status status-${criterion.status.toLowerCase()}`}>{criterion.status}</strong><p>{criterion.explanation}</p></article>)}</div><p><strong>Tradeoff Feedback:</strong> Aperture changed both Captured Light and relative depth; shutter speed or ISO can rebalance brightness without recreating the same depth effect.</p>{previousAttempt && <button className="button secondary-button" onClick={() => setComparing((value) => !value)}>Compare with previous Attempt</button>}{comparing && previousAttempt && currentAttempt && <p className="comparison">Previous Attempt: f/{previousAttempt.aperture} · 1/{previousAttempt.shutter}s · ISO {previousAttempt.iso} · Current Attempt: f/{currentAttempt.aperture} · 1/{currentAttempt.shutter}s · ISO {currentAttempt.iso}</p>}</div>}
    </section>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonThree.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
    <p className="photo-credit">Source Photograph: Andrey Maximov · <a href="https://commons.wikimedia.org/wiki/File:Portrait_at_the_window.jpg">CC BY 2.0</a> · resized and layered for relative depth demonstration</p>
  </>;
}

function PortraitPreview({ aperture, depth, label, exposure = 0 }: { aperture: number; depth: ReturnType<typeof portraitDepth>; label: string; exposure?: number }) {
  const brightness = Math.max(.45, Math.min(1.7, 2 ** exposure));
  return <figure className="lesson-preview"><div className="lesson-preview-frame portrait-preview" data-testid="portrait-rendered-result" data-depth-band={depth.band}>
    <Image src="/images/window-light-portrait-960.jpg" alt="A woman beside a bright window with green foliage behind her" fill priority sizes="(max-width: 800px) 100vw, 58vw" className="portrait-background" style={{ filter: `brightness(${brightness}) blur(${depth.blurRadius}px)`, transform: `scale(${1 + depth.blurRadius / 500})` }} />
    <Image src="/images/window-light-portrait-960.jpg" alt="" aria-hidden fill priority sizes="(max-width: 800px) 100vw, 58vw" className="portrait-subject" style={{ filter: `brightness(${brightness})` }} />
    <div className="preview-readout"><span>Window-Light Portrait</span><strong>{label}</strong></div>
  </div><figcaption aria-live="polite">{depth.description} The subject remains focused. <span className="visual-fallback">The visual depth effect is unavailable, but this text outcome and evaluation remain available.</span></figcaption></figure>;
}
