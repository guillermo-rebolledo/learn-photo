"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { dimIndoorPerformanceScene, lessonFive, lessonFiveChallenge } from "@/lib/curriculum";
import { evaluatePerformanceAttempt, isoStops, noiseOutcome, performanceExposureStops, performanceMotion, type MotionIntention } from "@/lib/iso-model";
import type { ExposureSettings } from "@/lib/exposure-model";

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
