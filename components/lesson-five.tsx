"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { dimIndoorPerformanceScene, filmConstraintChallenges, lessonFive, lessonFiveChallenge } from "@/lib/curriculum";
import { evaluatePerformanceAttempt, isoStops, noiseOutcome, performanceExposureStops, performanceMotion, type MotionIntention } from "@/lib/iso-model";
import type { ExposureSettings } from "@/lib/exposure-model";
import { evaluateFilmConstraint, filmExposureStops, type FilmIntention } from "@/lib/film-model";
import { portraitDepth } from "@/lib/aperture-model";
import { cyclistMotion } from "@/lib/shutter-model";

const isos = [100, 200, 400, 800, 1600, 3200, 6400, 12800];
const shutters = [30, 60, 125, 250, 500];
const apertures = [1.8, 2.8, 4];

export function LessonFive({ explanation }: { explanation: React.ReactNode }) {
  const [guidedIso, setGuidedIso] = useState(800);
  const [settings, setSettings] = useState<ExposureSettings>({ aperture: 1.8, shutter: 250, iso: 800 });
  const [intention, setIntention] = useState<MotionIntention>("freeze");
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluatePerformanceAttempt> | null>(null);
  const [visualEffectsAvailable, setVisualEffectsAvailable] = useState(true);
  const guidedNoise = noiseOutcome(guidedIso);
  const challengeNoise = noiseOutcome(settings.iso);
  const complete = feedback && Object.values(feedback).every(({ status }) => status === "Achieved");

  useEffect(() => {
    setVisualEffectsAvailable(typeof CSS !== "undefined" && CSS.supports("filter", "brightness(1)") && CSS.supports("mask-image", "url(\"/images/dim-indoor-performance-motion.svg\")") && CSS.supports("mix-blend-mode", "screen"));
  }, []);

  function update(name: keyof ExposureSettings, value: string) { setSettings((current) => ({ ...current, [name]: Number(value) })); setFeedback(null); }

  return <div className={visualEffectsAvailable ? undefined : "no-performance-effects"}>
    <section className="lesson-explanation" aria-label="Explanation">{explanation}</section>
    <section className="experiment" aria-labelledby="iso-experiment-title">
      <div className="experiment-heading"><div><p className="eyebrow">Guided experiment</p><h2 id="iso-experiment-title">Lift the response, reveal the noise</h2></div><p>Captured Light stays fixed. Only ISO changes Rendered Brightness and the calibrated noise outcome.</p></div>
      <div className="simulator">
        <PerformancePreview iso={guidedIso} shutter={dimIndoorPerformanceScene.meterReference.shutter} noise={guidedNoise} label={`ISO ${guidedIso}`} eager />
        <div className="camera-controls"><label>Guided ISO<select aria-label="Guided ISO" value={guidedIso} onChange={(event) => setGuidedIso(Number(event.target.value))}>{isos.map((iso) => <option key={iso} value={iso}>ISO {iso}</option>)}</select></label><p className="control-outcome" aria-live="polite">ISO {guidedIso} is {isoStops(guidedIso)} Stops above ISO 100. {guidedNoise.description} Captured Light is unchanged.</p></div>
      </div>
    </section>
    <FilmConstraints />
    <section className="experiment" aria-labelledby="performance-challenge-title">
      <div className="experiment-heading"><div><p className="eyebrow">Challenge</p><h2 id="performance-challenge-title">Balance a dim performance</h2></div><p>Keep exposure usable, render the intended motion, and keep noise moderate at ISO 3200 or below. More than one combination can work.</p></div>
      <div className="simulator">
        <PerformancePreview iso={settings.iso} shutter={settings.shutter} noise={challengeNoise} exposure={performanceExposureStops(settings)} label={`f/${settings.aperture} · 1/${settings.shutter}s · ISO ${settings.iso}`} />
        <div className="camera-controls">
          <label>Motion intention<select aria-label="Motion intention" value={intention} onChange={(event) => { setIntention(event.target.value as MotionIntention); setFeedback(null); }}><option value="freeze">Freeze the performer</option><option value="show-motion">Show expressive motion</option></select></label>
          <label>Challenge aperture<select aria-label="Challenge aperture" value={settings.aperture} onChange={(event) => update("aperture", event.target.value)}>{apertures.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
          <label>Challenge shutter speed<select aria-label="Challenge shutter speed" value={settings.shutter} onChange={(event) => update("shutter", event.target.value)}>{shutters.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
          <label>Challenge ISO<select aria-label="Challenge ISO" value={settings.iso} onChange={(event) => update("iso", event.target.value)}>{isos.map((value) => <option key={value} value={value}>ISO {value}</option>)}</select></label>
          <button className="button primary-button capture-button" onClick={() => setFeedback(evaluatePerformanceAttempt(settings, intention))}>Take photo</button>
        </div>
      </div>
      {feedback && <div className="feedback" aria-live="polite"><p className="eyebrow">Criterion Status</p><h3>{complete ? "Challenge complete" : "Keep experimenting"}</h3><div className="criteria iso-criteria">{([ ["Usable exposure", feedback.exposure], ["Intended motion", feedback.motion], ["ISO-compatible image quality", feedback.quality] ] as const).map(([label, criterion]) => <article key={label}><h4>{label}</h4><strong className={`status status-${criterion.status.toLowerCase()}`}>{criterion.status}</strong><p>{criterion.explanation}</p></article>)}</div><p><strong>Tradeoff Feedback:</strong> A slower shutter gathers more light but shows more motion. A wider aperture gathers more light but changes depth. Higher ISO lifts Rendered Brightness without adding Captured Light, with a stronger noise tradeoff.</p></div>}
    </section>
    <details className="scene-assumptions"><summary>Scene Assumptions and graceful fallback</summary><p>This Curated Scene assumes a handheld full-frame Camera, 85 mm focal length, and an energetic performer. The Meter Reference begins at f/1.8, but aperture remains an Exposure Control. If blend or filter effects are unavailable, the Source Photograph and synchronized text outcome remain usable; Challenge evaluation does not depend on the visual effect.</p></details>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonFive.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
    <p className="photo-credit">Source Photograph: <a href="https://commons.wikimedia.org/wiki/File:Emanuel_Mendez_Mexican_violinist_performing.png">Gio Antonio</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · resized and layered for calibrated low-light demonstration · Challenge {lessonFiveChallenge.id}</p>
  </div>;
}

type FilmSettings = Record<FilmIntention, ExposureSettings>;
const initialFilmSettings: FilmSettings = {
  depth: { aperture: 4, shutter: 60, iso: filmConstraintChallenges.depth.rollIso },
  motion: { aperture: 2, shutter: 250, iso: filmConstraintChallenges.motion.rollIso },
};

function FilmConstraints() {
  const [settings, setSettings] = useState<FilmSettings>(initialFilmSettings);
  const [feedback, setFeedback] = useState<Partial<Record<FilmIntention, ReturnType<typeof evaluateFilmConstraint>>>>({});
  const [previousFeedback, setPreviousFeedback] = useState<Partial<Record<FilmIntention, ReturnType<typeof evaluateFilmConstraint>>>>({});
  const [currentAttempts, setCurrentAttempts] = useState<Partial<FilmSettings>>({});
  const [previousAttempts, setPreviousAttempts] = useState<Partial<FilmSettings>>({});
  const restored = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("learn-photo-progress") ?? "{}");
      const candidate = saved?.filmConstraintSettings;
      if (candidate?.depth && candidate?.motion) {
        setSettings({
          depth: sanitizeFilmSettings("depth", candidate.depth, initialFilmSettings.depth),
          motion: sanitizeFilmSettings("motion", candidate.motion, initialFilmSettings.motion),
        });
      }
      if (saved?.filmConstraintFeedback) setFeedback(saved.filmConstraintFeedback);
      if (saved?.filmConstraintPreviousFeedback) setPreviousFeedback(saved.filmConstraintPreviousFeedback);
      if (saved?.filmConstraintCurrentAttempts) setCurrentAttempts(saved.filmConstraintCurrentAttempts);
      if (saved?.filmConstraintPreviousAttempts) setPreviousAttempts(saved.filmConstraintPreviousAttempts);
    } catch { /* Browser-local Progress can recover from malformed data. */ }
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      const saved = JSON.parse(localStorage.getItem("learn-photo-progress") ?? "{}");
      localStorage.setItem("learn-photo-progress", JSON.stringify({ ...saved, lesson: lessonFive.slug, filmConstraintSettings: settings, filmConstraintFeedback: feedback, filmConstraintPreviousFeedback: previousFeedback, filmConstraintCurrentAttempts: currentAttempts, filmConstraintPreviousAttempts: previousAttempts }));
    } catch {
      localStorage.setItem("learn-photo-progress", JSON.stringify({ lesson: lessonFive.slug, filmConstraintSettings: settings }));
    }
  }, [settings, feedback, previousFeedback, currentAttempts, previousAttempts]);

  function update(intention: FilmIntention, control: "aperture" | "shutter", value: string) {
    setSettings((current) => ({ ...current, [intention]: { ...current[intention], [control]: Number(value), iso: filmConstraintChallenges[intention].rollIso } }));
  }

  function submit(intention: FilmIntention) {
    const result = evaluateFilmConstraint(settings[intention], intention);
    setPreviousFeedback((previous) => ({ ...previous, [intention]: feedback[intention] }));
    setPreviousAttempts((previous) => ({ ...previous, [intention]: currentAttempts[intention] }));
    setCurrentAttempts((current) => ({ ...current, [intention]: { ...settings[intention] } }));
    setFeedback((current) => ({ ...current, [intention]: result }));
    if (Object.values(result).every(({ status }) => status === "Achieved")) {
      try {
        const saved = JSON.parse(localStorage.getItem("learn-photo-progress") ?? "{}");
        const completed = Array.isArray(saved.completedChallenges) ? saved.completedChallenges : [];
        localStorage.setItem("learn-photo-progress", JSON.stringify({ ...saved, completedChallenges: [...new Set([...completed, filmConstraintChallenges[intention].id])] }));
      } catch { /* Completion remains visible even if Progress cannot be written. */ }
    }
  }

  return <section className="experiment" aria-labelledby="film-constraints-title">
    <div className="experiment-heading"><div><p className="eyebrow">Film Constraint Challenges</p><h2 id="film-constraints-title">Solve without changing the roll</h2></div><p>Both Challenges load ISO 400 film. ISO stays fixed while you balance aperture and shutter speed; several combinations can satisfy each Photographic Intention.</p></div>
    <div className="metering-challenges">
      <FilmChallenge intention="depth" settings={settings.depth} result={feedback.depth} previousResult={previousFeedback.depth} currentAttempt={currentAttempts.depth} previousAttempt={previousAttempts.depth} onUpdate={update} onTake={() => submit("depth")} />
      <FilmChallenge intention="motion" settings={settings.motion} result={feedback.motion} previousResult={previousFeedback.motion} currentAttempt={currentAttempts.motion} previousAttempt={previousAttempts.motion} onUpdate={update} onTake={() => submit("motion")} />
    </div>
  </section>;
}

function FilmChallenge({ intention, settings, result, previousResult, currentAttempt, previousAttempt, onUpdate, onTake }: { intention: FilmIntention; settings: ExposureSettings; result?: ReturnType<typeof evaluateFilmConstraint>; previousResult?: ReturnType<typeof evaluateFilmConstraint>; currentAttempt?: ExposureSettings; previousAttempt?: ExposureSettings; onUpdate: (intention: FilmIntention, control: "aperture" | "shutter", value: string) => void; onTake: () => void }) {
  const label = intention === "depth" ? "Depth" : "Motion";
  const challenge = filmConstraintChallenges[intention];
  const complete = result && Object.values(result).every(({ status }) => status === "Achieved");
  return <article className="metering-challenge">
    <p className="eyebrow">{label} Film Constraint</p><h3>{challenge.label}</h3><p>{challenge.photographicIntention}</p>
    <FilmConstraintPreview intention={intention} settings={settings} />
    <div className="camera-controls">
      <label>{label} Film Constraint aperture<select aria-label={`${label} Film Constraint aperture`} value={settings.aperture} onChange={(event) => onUpdate(intention, "aperture", event.target.value)}>{challenge.controls.aperture.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
      <label>{label} Film Constraint shutter speed<select aria-label={`${label} Film Constraint shutter speed`} value={settings.shutter} onChange={(event) => onUpdate(intention, "shutter", event.target.value)}>{challenge.controls.shutter.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
      <label>{label} Film Constraint ISO<select aria-label={`${label} Film Constraint ISO`} value={challenge.rollIso} disabled><option value={challenge.rollIso}>ISO {challenge.rollIso} · fixed roll</option></select></label>
      <button className="button primary-button capture-button" onClick={onTake}>Take {intention} Film Constraint photo</button>
    </div>
    {result && <div className="feedback" role="region" aria-label={`${label} Film Constraint feedback`} aria-live="polite"><p className="eyebrow">Criterion Status</p><h4>{complete ? "Challenge complete" : "Keep experimenting"}</h4><div className="criteria">{([ ["Usable exposure", result.exposure], ["Photographic Intention", result.intention], ["Fixed film speed", result.filmSpeed] ] as const).map(([criterionLabel, criterion]) => <article key={criterionLabel}><h4>{criterionLabel}</h4><strong className={`status status-${criterion.status.toLowerCase()}`}>{criterion.status}</strong><p>{criterion.explanation}</p></article>)}</div><p><strong>Tradeoff Feedback:</strong> Digital ISO can change between photographs; this Film Constraint is fixed at ISO 400 across this roll. {challenge.tradeoffFeedback}</p></div>}
    {previousResult && previousAttempt && currentAttempt && <details><summary>Compare with previous Attempt</summary><p>Previous Attempt: f/{previousAttempt.aperture} · 1/{previousAttempt.shutter}s · ISO {previousAttempt.iso}. Current Attempt: f/{currentAttempt.aperture} · 1/{currentAttempt.shutter}s · ISO {currentAttempt.iso}.</p></details>}
  </article>;
}

function FilmConstraintPreview({ intention, settings }: { intention: FilmIntention; settings: ExposureSettings }) {
  const stops = filmExposureStops(settings, intention);
  const brightness = Math.max(.4, Math.min(1.6, 2 ** stops));
  const exposureText = Math.abs(stops) <= .12 ? "The selected aperture and shutter keep the Rendered Result near the scene reference." : `The Rendered Result is ${Math.abs(stops).toFixed(1)} Stops ${stops < 0 ? "darker" : "brighter"} than the scene reference.`;
  if (intention === "depth") {
    const depth = portraitDepth(settings.aperture);
    return <figure className="lesson-preview"><div className="lesson-preview-frame portrait-preview" data-testid="depth-film-rendered-result" data-depth-band={depth.band}><Image src="/images/window-light-portrait-960.jpg" alt="A seated portrait in window light" fill sizes="(max-width: 800px) 100vw, 40vw" className="portrait-background" style={{ filter: `brightness(${brightness}) blur(${depth.blurRadius}px)`, transform: `scale(${1 + depth.blurRadius / 500})` }} /><Image src="/images/window-light-portrait-960.jpg" alt="" aria-hidden fill sizes="(max-width: 800px) 100vw, 40vw" className="portrait-subject" style={{ filter: `brightness(${brightness})` }} /><div className="preview-readout"><span>Window-Light Portrait · ISO 400 film</span><strong>f/{settings.aperture} · 1/{settings.shutter}s</strong></div></div><figcaption>{depth.description} {exposureText}</figcaption></figure>;
  }
  const motion = cyclistMotion(settings.shutter);
  const copies = motion.band === "flowing" ? 3 : motion.band === "trace" ? 1 : 0;
  return <figure className="lesson-preview cyclist-preview"><div className="lesson-preview-frame" data-testid="motion-film-rendered-result" data-motion-band={motion.band}><Image src="/images/moving-cyclist-960.jpg" alt="A cyclist moving along a road" fill sizes="(max-width: 800px) 100vw, 40vw" style={{ filter: `brightness(${brightness})` }} />{Array.from({ length: copies }, (_, index) => <Image key={index} src="/images/moving-cyclist-960.jpg" alt="" aria-hidden fill sizes="(max-width: 800px) 100vw, 40vw" className="cyclist-motion-echo" style={{ opacity: .28 - index * .05, transform: `translateX(${-motion.offset * (index + 1)}px)`, filter: `brightness(${brightness}) blur(${2.5 + index * 2}px)` }} />)}<div className="preview-readout"><span>Moving Cyclist · ISO 400 film</span><strong>f/{settings.aperture} · 1/{settings.shutter}s</strong></div></div><figcaption>{motion.description} {exposureText}</figcaption></figure>;
}

function sanitizeFilmSettings(intention: FilmIntention, candidate: Partial<ExposureSettings>, fallback: ExposureSettings): ExposureSettings {
  const challenge = filmConstraintChallenges[intention];
  return {
    aperture: challenge.controls.aperture.includes(candidate.aperture as never) ? Number(candidate.aperture) : fallback.aperture,
    shutter: challenge.controls.shutter.includes(candidate.shutter as never) ? Number(candidate.shutter) : fallback.shutter,
    iso: challenge.rollIso,
  };
}

function PerformancePreview({ iso, shutter, noise, label, exposure = Math.log2(iso / dimIndoorPerformanceScene.meterReference.iso), eager = false }: { iso: number; shutter: number; noise: ReturnType<typeof noiseOutcome>; label: string; exposure?: number; eager?: boolean }) {
  const brightness = Math.max(.35, Math.min(1.65, 2 ** exposure));
  const motion = performanceMotion(shutter);
  return <figure className="lesson-preview"><div className="lesson-preview-frame performance-preview" data-testid="performance-rendered-result" data-noise-band={noise.band} data-motion={motion.band}>
    <Image src="/images/dim-indoor-performance-960.jpg" alt="A violinist performing indoors beside a music stand" fill priority={eager} sizes="(max-width: 800px) 100vw, 58vw" style={{ filter: `brightness(${brightness})` }} />
    {motion.offset > 0 && <Image src="/images/dim-indoor-performance-960.jpg" alt="" aria-hidden fill sizes="(max-width: 800px) 100vw, 58vw" className="performance-motion-layer" style={{ filter: `brightness(${brightness})`, transform: `translateX(${motion.offset}px)`, opacity: motion.offset / 14 }} />}
    <div className="noise-layer" aria-hidden style={{ opacity: noise.opacity }} />
    <div className="preview-readout"><span>Dim Indoor Performance</span><strong>{label}</strong></div>
  </div><figcaption aria-live="polite">{noise.description} {motion.band === "frozen" ? "The faster shutter freezes the performer." : "The slower shutter shows a calibrated directional trace around the moving performer."} <span className="performance-fallback">Visual effects are unavailable; this Source Photograph is representative, while the synchronized text and Challenge evaluation remain active.</span></figcaption></figure>;
}
