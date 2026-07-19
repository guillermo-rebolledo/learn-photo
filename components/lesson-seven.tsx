"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { exposureModeScene, lessonSeven, lessonSevenChallenge } from "@/lib/curriculum";
import { resolveExposureMode, type ExposureMode } from "@/lib/exposure-mode-model";
import type { ExposureSettings } from "@/lib/exposure-model";
import { cyclistExposureStops, cyclistMotion, evaluateCyclistAttempt } from "@/lib/shutter-model";

const modeNames: Record<ExposureMode, string> = { Auto: "Auto", P: "Program (P)", A: "Aperture Priority (A / Av)", S: "Shutter Priority (S / Tv)", M: "Manual (M)" };

export function LessonSeven({ explanation }: { explanation: React.ReactNode }) {
  const [mode, setMode] = useState<ExposureMode>("A");
  const [selected, setSelected] = useState<ExposureSettings>({ aperture: 4, shutter: 125, iso: 800 });
  const [compensation, setCompensation] = useState(0);
  const [autoIso, setAutoIso] = useState(false);
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateCyclistAttempt> | null>(null);
  const [hasManualIsoAttempt, setHasManualIsoAttempt] = useState(false);
  const [visualEffectsAvailable, setVisualEffectsAvailable] = useState(true);
  const resolved = resolveExposureMode({ mode, selected, scene: exposureModeScene, compensation, autoIso });
  const motion = cyclistMotion(resolved.settings.shutter);
  const exposure = cyclistExposureStops(resolved.settings);
  const complete = feedback && Object.values(feedback).every(({ status }) => status === "Achieved");

  useEffect(() => {
    setVisualEffectsAvailable(typeof CSS !== "undefined" && (CSS.supports("mask-image", "url(\"/images/moving-cyclist-subject.svg\")") || CSS.supports("-webkit-mask-image", "url(\"/images/moving-cyclist-subject.svg\")")));
  }, []);

  function update(control: keyof ExposureSettings, value: string) {
    setSelected((current) => ({ ...current, [control]: Number(value) }));
    setFeedback(null);
  }

  function chooseMode(nextMode: ExposureMode) {
    setMode(nextMode);
    setCompensation(0);
    setAutoIso(false);
    setFeedback(null);
  }

  return <div className={visualEffectsAvailable ? undefined : "no-visual-effects"}>
    <section className="lesson-explanation" aria-label="Explanation">{explanation}</section>
    <section className="experiment" aria-labelledby="mode-experiment-title">
      <div className="experiment-heading"><div><p className="eyebrow">Guided experiment</p><h2 id="mode-experiment-title">Keep the important choice</h2></div><p>Change the division of responsibility and see which settings the Camera preserves or selects.</p></div>
      <div className="simulator cyclist-simulator">
        <figure className="lesson-preview cyclist-preview" data-testid="mode-rendered-result" data-motion-band={motion.band} data-exposure-stops={exposure} aria-label={`Rendered Result in ${modeNames[mode]} at f/${resolved.settings.aperture}, 1/${resolved.settings.shutter}s, ISO ${resolved.settings.iso}. ${motion.description}`}><div className="lesson-preview-frame"><Image src="/images/moving-cyclist-960.jpg" alt="Cyclist riding along a road" fill priority sizes="(max-width: 760px) 100vw, 65vw" style={{ filter: `brightness(${Math.max(.35, Math.min(1.8, 2 ** exposure))})` }} />{Array.from({ length: motion.band === "flowing" ? 3 : motion.band === "trace" ? 1 : 0 }, (_, index) => <Image className="cyclist-motion-echo" key={index} src="/images/moving-cyclist-960.jpg" alt="" aria-hidden fill priority sizes="(max-width: 760px) 100vw, 65vw" style={{ opacity: motion.band === "flowing" ? .3 - index * .06 : .26, transform: `translateX(${-motion.offset * (index + 1)}px)`, filter: `brightness(${Math.max(.35, Math.min(1.8, 2 ** exposure))}) blur(${motion.band === "flowing" ? 3.5 + index * 2 : 2.5}px)` }} />)}<div className="preview-readout"><span>{modeNames[mode]}</span><strong>f/{resolved.settings.aperture} · 1/{resolved.settings.shutter}s · ISO {resolved.settings.iso}</strong></div></div><figcaption>{motion.description} {!visualEffectsAvailable && "The calibrated visual motion effect is unavailable; this textual outcome remains authoritative. "}{resolved.atLimit ? "The Camera reached a configured limit before applying all requested compensation." : `The result is ${resolved.appliedCompensation === 0 ? "at" : `${Math.abs(resolved.appliedCompensation)} Stop${Math.abs(resolved.appliedCompensation) === 1 ? "" : "s"} ${resolved.appliedCompensation > 0 ? "above" : "below"}`} the Meter Reference.`}</figcaption></figure>
        <div className="camera-controls">
          <fieldset className="mode-selector"><legend>Exposure Mode</legend>{(Object.keys(modeNames) as ExposureMode[]).map((value) => <label key={value}><input type="radio" name="exposure-mode" value={value} checked={mode === value} onChange={() => chooseMode(value)} />{modeNames[value]}</label>)}</fieldset>
          {(["aperture", "shutter", "iso"] as const).map((control) => <label key={control}>{control === "iso" ? "ISO" : control === "shutter" ? "Shutter speed" : "Aperture"}<select aria-label={`Learner ${control}`} value={selected[control]} disabled={resolved.cameraControls.includes(control)} onChange={(event) => update(control, event.target.value)}>{exposureModeScene.limits[control].map((value) => <option key={value} value={value}>{control === "aperture" ? `f/${value}` : control === "shutter" ? `1/${value}s` : `ISO ${value}`}</option>)}</select><span>{resolved.cameraControls.includes(control) ? "Camera-selected" : "Learner-selected"}</span></label>)}
          <label>Exposure Compensation<select aria-label="Exposure Compensation" value={compensation} disabled={mode === "M"} onChange={(event) => { setCompensation(Number(event.target.value)); setFeedback(null); }}>{[-2, -1, 0, 1, 2].map((value) => <option key={value} value={value}>{value > 0 ? "+" : ""}{value} Stop{Math.abs(value) === 1 ? "" : "s"}</option>)}</select></label>
          <label className="auto-iso-control"><input type="checkbox" checked={autoIso} disabled={!hasManualIsoAttempt} onChange={(event) => { setAutoIso(event.target.checked); setFeedback(null); }} />Auto ISO (optional digital behavior)</label>
          {!hasManualIsoAttempt && <p className="control-outcome">Available after your first manual-ISO Attempt.</p>}
          <button className="button primary-button capture-button" onClick={() => { setFeedback(evaluateCyclistAttempt(resolved.settings, "freeze")); setHasManualIsoAttempt(true); }}>Take photo</button>
        </div>
      </div>
      <p className="control-outcome" aria-live="polite">{resolved.cameraControls.length ? `Camera selects ${resolved.cameraControls.join(", ")}.` : "The Learner selects every Exposure Control."} ISO begins manual; Auto ISO is off until you enable it.</p>
    </section>
    {feedback && <div className="feedback" aria-live="polite"><p className="eyebrow">Criterion Status</p><h2>{complete ? "Challenge complete" : "Review the result"}</h2><p>{lessonSevenChallenge.photographicIntention}</p><div className="criteria"><article><h3>Usable exposure</h3><strong>{feedback.exposure.status}</strong><p>{feedback.exposure.explanation}</p></article><article><h3>Intended motion rendering</h3><strong>{feedback.motion.status}</strong><p>{feedback.motion.explanation}</p></article></div><p><strong>Tradeoff Feedback:</strong> The Challenge assesses the Rendered Result, not the Exposure Mode label. More than one mode and settings combination can satisfy the same Photographic Intention.</p></div>}
    <details className="scene-assumptions"><summary>Scene Assumptions and limits</summary><p>This reuses the Moving Cyclist Curated Scene: an 85 mm view, stable support, and steady left-to-right subject motion. Camera choices are deterministic and restricted to the displayed aperture, shutter-speed, and ISO ranges.</p></details>
    <aside className="photo-credit"><p><strong>Source Photograph:</strong> “cyclist riding bicycle on road” by <a href="https://unsplash.com/@miqul">Michal Mrozek</a>, used under the <a href="https://unsplash.com/license">Unsplash License</a>. Local derivatives are documented in the image manifest.</p></aside>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonSeven.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
  </div>;
}
