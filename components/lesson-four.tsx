"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cyclistExposureStops, cyclistMotion, evaluateCyclistAttempt, shutterCapturedLightStops, type CyclistIntention } from "@/lib/shutter-model";
import { lessonFour, lessonFourChallenges, movingCyclistScene } from "@/lib/curriculum";
import type { ExposureSettings } from "@/lib/exposure-model";

const shutters = [30, 60, 125, 250, 500, 1000];
const apertures = [4, 5.6, 8, 11];
const isos = [100, 200, 400, 800, 1600];
const storageKey = "learn-photo-progress";
type CyclistAttempt = ExposureSettings & { intention: CyclistIntention; capturedAt: number };

function readSaved() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch { return {}; }
}

export function LessonFour({ explanation }: { explanation: React.ReactNode }) {
  const [guidedShutter, setGuidedShutter] = useState(125);
  const [intention, setIntention] = useState<CyclistIntention>("freeze");
  const [settings, setSettings] = useState<ExposureSettings>({ ...movingCyclistScene.meterReference });
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateCyclistAttempt> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [visualEffectsAvailable, setVisualEffectsAvailable] = useState(true);
  const [currentAttempt, setCurrentAttempt] = useState<CyclistAttempt | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<CyclistAttempt | null>(null);
  const [comparing, setComparing] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const guidedMotion = cyclistMotion(guidedShutter);
  const challengeMotion = cyclistMotion(settings.shutter);
  const exposure = cyclistExposureStops(settings);
  const complete = feedback && Object.values(feedback).every(({ status }) => status === "Achieved");

  useEffect(() => {
    setVisualEffectsAvailable(typeof CSS !== "undefined" && CSS.supports("filter", "blur(1px)") && (CSS.supports("mask-image", "url(\"/images/moving-cyclist-subject.svg\")") || CSS.supports("-webkit-mask-image", "url(\"/images/moving-cyclist-subject.svg\")")));
    const saved = readSaved();
    if (saved.lessonFourSettings && typeof saved.lessonFourSettings === "object") setSettings((current) => ({ ...current, ...saved.lessonFourSettings as Partial<ExposureSettings> }));
    if (saved.lessonFourIntention === "express-motion") setIntention("express-motion");
    setCurrentAttempt((saved.lessonFourCurrentAttempt ?? null) as CyclistAttempt | null);
    setPreviousAttempt((saved.lessonFourPreviousAttempt ?? null) as CyclistAttempt | null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved = readSaved();
    const completedChallenges = new Set(Array.isArray(saved.completedChallenges) ? saved.completedChallenges.filter((item): item is string => typeof item === "string") : []);
    if (complete) completedChallenges.add(lessonFourChallenges[intention].id);
    localStorage.setItem(storageKey, JSON.stringify({ ...saved, lesson: lessonFour.slug, lessonFourSettings: settings, lessonFourIntention: intention, lessonFourCurrentAttempt: currentAttempt, lessonFourPreviousAttempt: previousAttempt, completedChallenges: [...completedChallenges] }));
  }, [complete, currentAttempt, hydrated, intention, previousAttempt, settings]);

  function update(name: keyof ExposureSettings, value: string) {
    setSettings((current) => ({ ...current, [name]: Number(value) }));
    setFeedback(null);
  }

  function capture() {
    const nextFeedback = evaluateCyclistAttempt(settings, intention);
    setPreviousAttempt(currentAttempt);
    setCurrentAttempt({ ...settings, intention, capturedAt: Date.now() });
    setComparing(false);
    setFeedback(nextFeedback);
    setCapturing(true);
    window.setTimeout(() => setCapturing(false), 210);
  }

  return <div className={visualEffectsAvailable ? undefined : "no-visual-effects"}>
    <section className="lesson-explanation" aria-label="Explanation">{explanation}</section>
    <section className="experiment" aria-labelledby="shutter-experiment-title">
      <div className="experiment-heading"><div><p className="eyebrow">Guided experiment</p><h2 id="shutter-experiment-title">Hold a moment or let it travel</h2></div><p>Only shutter speed changes, linking recorded time, Captured Light, and directional motion.</p></div>
      <div className="simulator cyclist-simulator">
        <CyclistPreview shutter={guidedShutter} motion={guidedMotion} label={`1/${guidedShutter}s`} />
        <div className="camera-controls">
          <label>Guided shutter speed<select aria-label="Guided shutter speed" value={guidedShutter} onChange={(event) => setGuidedShutter(Number(event.target.value))}>{shutters.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
          <button className="button secondary-button" aria-label="Choose a faster guided shutter speed" disabled={guidedShutter === shutters.at(-1)} onClick={() => setGuidedShutter(shutters[Math.min(shutters.length - 1, shutters.indexOf(guidedShutter) + 1)])}>Faster shutter</button>
          <p className="control-outcome" aria-live="polite">{guidedMotion.description} Relative to 1/125s, this records {capturedLightText(shutterCapturedLightStops(guidedShutter))}.</p>
        </div>
      </div>
      <details className="scene-assumptions"><summary>Why this varies in real life</summary><p>This calibration assumes an 85 mm focal length, a fixed Camera on stable support, and a cyclist crossing left to right at a steady pace. Subject speed, distance, panning direction, focal length, and display size all change how motion appears. These bands are not universal shutter-speed thresholds.</p></details>
    </section>
    <section className="experiment" aria-labelledby="cyclist-challenge-title">
      <div className="experiment-heading"><div><p className="eyebrow">Challenge</p><h2 id="cyclist-challenge-title">Choose how movement reads</h2></div><p>{lessonFourChallenges[intention].photographicIntention}</p></div>
      <div className="simulator cyclist-simulator">
        <CyclistPreview shutter={settings.shutter} motion={challengeMotion} label={`f/${settings.aperture} · 1/${settings.shutter}s · ISO ${settings.iso}`} exposure={exposure} capturing={capturing} />
        <div className="camera-controls">
          <label>Cyclist Challenge<select aria-label="Cyclist Challenge" value={intention} onChange={(event) => { setIntention(event.target.value as CyclistIntention); setFeedback(null); }}><option value="freeze">Freeze the cyclist</option><option value="express-motion">Express motion</option></select></label>
          <label>Challenge shutter speed<select aria-label="Challenge shutter speed" value={settings.shutter} onChange={(event) => update("shutter", event.target.value)}>{shutters.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
          <label>Challenge aperture<select aria-label="Challenge aperture" value={settings.aperture} onChange={(event) => update("aperture", event.target.value)}>{apertures.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
          <label>Challenge ISO<select aria-label="Challenge ISO" value={settings.iso} onChange={(event) => update("iso", event.target.value)}>{isos.map((value) => <option key={value} value={value}>ISO {value}</option>)}</select></label>
          <button className="button primary-button capture-button" disabled={!hydrated} onClick={capture}>Take photo</button>
          <p className="control-outcome" aria-live="polite">{challengeMotion.description} The result is {exposure === 0 ? "at" : `${Math.abs(exposure)} Stops ${exposure > 0 ? "above" : "below"}`} the scene’s Meter Reference. {!visualEffectsAvailable && "The visual motion effect is unavailable, so use this textual outcome."}</p>
        </div>
      </div>
      {feedback && <div className="portrait-feedback" aria-live="polite"><p className="eyebrow">Criterion Status</p><h2>{complete ? "Challenge complete" : "Review the tradeoffs"}</h2><div className="criteria"><Criterion label="Usable exposure" value={feedback.exposure} /><Criterion label="Intended motion rendering" value={feedback.motion} /></div><p><strong>Tradeoff Feedback:</strong> Shutter speed changes both Captured Light and recorded travel. Aperture or ISO can rebalance Rendered Brightness without recreating the same motion effect.</p>{previousAttempt && <button className="button secondary-button" onClick={() => setComparing((value) => !value)}>Compare with previous Attempt</button>}{comparing && previousAttempt && currentAttempt && <p className="comparison">Previous Attempt: f/{previousAttempt.aperture} · 1/{previousAttempt.shutter}s · ISO {previousAttempt.iso} · Current Attempt: f/{currentAttempt.aperture} · 1/{currentAttempt.shutter}s · ISO {currentAttempt.iso}</p>}</div>}
    </section>
    <aside className="photo-credit"><p><strong>Source Photograph:</strong> “cyclist riding bicycle on road” by <a href="https://unsplash.com/@miqul">Michal Mrozek</a>, used under the <a href="https://unsplash.com/license">Unsplash License</a>. Local derivatives and the source-derived cyclist mask are documented in the image manifest.</p></aside>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonFour.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
  </div>;
}

function capturedLightText(stops: number) {
  if (stops === 0) return "the same Captured Light";
  return `${Math.abs(stops)} Stop${Math.abs(stops) === 1 ? "" : "s"} ${stops > 0 ? "more" : "less"} Captured Light`;
}

function CyclistPreview({ shutter, motion, label, exposure = 0, capturing = false }: { shutter: number; motion: ReturnType<typeof cyclistMotion>; label: string; exposure?: number; capturing?: boolean }) {
  const copies = motion.band === "flowing" ? 3 : motion.band === "trace" ? 1 : 0;
  return <figure className="lesson-preview cyclist-preview" data-testid="cyclist-rendered-result" data-motion-band={motion.band} aria-label={`Rendered Result: ${label}. ${motion.description}`}>
    <div className="lesson-preview-frame"><Image src="/images/moving-cyclist-960.jpg" alt="Cyclist riding along a road" fill loading="eager" sizes="(max-width: 760px) 100vw, 65vw" style={{ filter: `brightness(${Math.max(.35, Math.min(1.8, 2 ** exposure))})` }} />
      {Array.from({ length: copies }, (_, index) => <Image className="cyclist-motion-echo" data-testid="cyclist-motion-echo" key={index} src="/images/moving-cyclist-960.jpg" alt="" aria-hidden fill loading="eager" sizes="(max-width: 760px) 100vw, 65vw" style={{ opacity: motion.band === "flowing" ? .3 - index * .06 : .26, transform: `translateX(${-motion.offset * (index + 1)}px)`, filter: `brightness(${Math.max(.35, Math.min(1.8, 2 ** exposure))}) saturate(1.15) contrast(1.04) blur(${motion.band === "flowing" ? 3.5 + index * 2 : 2.5}px)` }} />)}
      {capturing && <span className="shutter-curtain" data-testid="shutter-curtain" aria-hidden />}
    </div><figcaption><span>{label}</span><span>{motion.description}</span><span className="visual-fallback"> Visual motion effect is unavailable; the textual result remains authoritative.</span></figcaption>
  </figure>;
}

function Criterion({ label, value }: { label: string; value: { status: string; explanation: string } }) {
  return <article><h3>{label}</h3><p><strong>{value.status}</strong> · {value.explanation}</p></article>;
}
