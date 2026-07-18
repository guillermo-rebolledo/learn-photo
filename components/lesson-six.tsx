"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  brightSnowScene,
  darkStageScene,
  lessonSix,
  lessonSixChallenges,
} from "@/lib/curriculum";
import type { ExposureSettings } from "@/lib/exposure-model";
import {
  buildLuminanceHistogram,
  evaluateMeteringAttempt,
  meterOffsetStops,
  summarizeHistogram,
  type LuminanceHistogram,
  type MeteringSceneId,
} from "@/lib/metering-model";

const scenes = { "bright-snow": brightSnowScene, "dark-stage": darkStageScene } as const;
const guidedShutters = {
  "bright-snow": [60, 125, 250, 500, 1000],
  "dark-stage": [30, 60, 125, 250, 500],
} as const;

const challengeControls = {
  "bright-snow": { aperture: [5.6, 8, 11], shutter: guidedShutters["bright-snow"], iso: [100, 200, 400] },
  "dark-stage": { aperture: [2, 2.8, 4, 5.6], shutter: guidedShutters["dark-stage"], iso: [400, 800, 1600, 3200] },
} as const;

export function LessonSix({ explanation }: { explanation: React.ReactNode }) {
  const [guidedSceneId, setGuidedSceneId] = useState<MeteringSceneId>("bright-snow");
  const [guidedSettings, setGuidedSettings] = useState<ExposureSettings>(brightSnowScene.meterReference);
  const [visualEffectsAvailable, setVisualEffectsAvailable] = useState(true);
  const guidedScene = scenes[guidedSceneId];
  const guidedOffset = meterOffsetStops(guidedSettings, guidedScene.meterReference);

  useEffect(() => {
    setVisualEffectsAvailable(typeof CSS !== "undefined" && CSS.supports("filter", "brightness(1)"));
  }, []);

  function chooseGuidedScene(sceneId: MeteringSceneId) {
    setGuidedSceneId(sceneId);
    setGuidedSettings(scenes[sceneId].meterReference);
  }

  return <div className={visualEffectsAvailable ? undefined : "no-metering-effects"}>
    <section className="lesson-explanation" aria-label="Explanation">{explanation}</section>

    <section className="experiment" aria-labelledby="meter-experiment-title">
      <div className="experiment-heading">
        <div><p className="eyebrow">Guided experiment</p><h2 id="meter-experiment-title">Compare the evidence</h2></div>
        <p>Move away from the Meter Reference and watch the Rendered Result, meter, luminance Histogram, and text summary change together.</p>
      </div>
      <div className="simulator">
        <MeteringPreview sceneId={guidedSceneId} settings={guidedSettings} eager />
        <div className="camera-controls">
          <label>Guided metering scene<select aria-label="Guided metering scene" value={guidedSceneId} onChange={(event) => chooseGuidedScene(event.target.value as MeteringSceneId)}><option value="bright-snow">Bright Snow</option><option value="dark-stage">Dark Stage</option></select></label>
          <label>Guided shutter speed<select aria-label="Guided shutter speed" value={guidedSettings.shutter} onChange={(event) => setGuidedSettings({ ...guidedSettings, shutter: Number(event.target.value) })}>{guidedShutters[guidedSceneId].map((shutter) => <option key={shutter} value={shutter}>1/{shutter}s</option>)}</select></label>
          <Meter offset={guidedOffset} />
          <p className="control-outcome" aria-live="polite">{meterLabel(guidedOffset)}. Zero is the Camera’s neutral estimate, not a verdict on {guidedScene.name}.</p>
        </div>
      </div>
    </section>

    <section className="experiment" aria-labelledby="meter-challenges-title">
      <div className="experiment-heading">
        <div><p className="eyebrow">Challenges</p><h2 id="meter-challenges-title">Choose for the scene</h2></div>
        <p>Make two deliberate decisions. Both Challenges accept several settings combinations, and neither intention lives at meter zero.</p>
      </div>
      <div className="metering-challenges">
        <MeteringChallenge sceneId="bright-snow" />
        <MeteringChallenge sceneId="dark-stage" />
      </div>
    </section>

    <details className="scene-assumptions"><summary>Scene Assumptions and graceful fallback</summary><p>Bright Snow assumes a still mountain landscape at 27 mm. Dark Stage assumes a handheld Camera at 200 mm and a moving singer under a spotlight. The Conceptual Simulator applies deterministic stops-based brightness to each Source Photograph. If that visual effect is unavailable, the meter, Histogram, textual summary, and Challenge evaluation remain active.</p></details>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonSix.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
    <aside className="photo-credit"><p><strong>Source Photographs:</strong> “Khunjerab — the snowy landscape” by <a href="https://commons.wikimedia.org/wiki/File:Khunjerab_-_the_snowy_landscape.jpg">MaeraT</a>, and “Singer singing on stage” by <a href="https://commons.wikimedia.org/wiki/File:Singer_singing_on_stage.jpg">DonAdkinsPhoto</a>, both used under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Local derivatives are documented in the image manifest.</p></aside>
  </div>;
}

function MeteringChallenge({ sceneId }: { sceneId: MeteringSceneId }) {
  const scene = scenes[sceneId];
  const challenge = sceneId === "bright-snow" ? lessonSixChallenges.brightSnow : lessonSixChallenges.darkStage;
  const controls = challengeControls[sceneId];
  const [settings, setSettings] = useState<ExposureSettings>(scene.meterReference);
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateMeteringAttempt> | null>(null);
  const [capturing, setCapturing] = useState(false);
  const offset = meterOffsetStops(settings, scene.meterReference);

  function update(name: keyof ExposureSettings, value: string) {
    setSettings((current) => ({ ...current, [name]: Number(value) }));
    setFeedback(null);
  }

  function takePhoto() {
    setCapturing(true);
    setFeedback(evaluateMeteringAttempt(sceneId, settings));
    window.setTimeout(() => setCapturing(false), 220);
  }

  return <section className="metering-challenge" aria-labelledby={`${sceneId}-challenge-title`}>
    <header><p className="eyebrow">{scene.name}</p><h3 id={`${sceneId}-challenge-title`}>{challenge.photographicIntention}</h3></header>
    <MeteringPreview sceneId={sceneId} settings={settings} capturing={capturing} />
    <div className="camera-controls metering-controls">
      <label>{scene.name} aperture<select aria-label={`${scene.name} aperture`} value={settings.aperture} onChange={(event) => update("aperture", event.target.value)}>{controls.aperture.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
      <label>{scene.name} shutter speed<select aria-label={`${scene.name} shutter speed`} value={settings.shutter} onChange={(event) => update("shutter", event.target.value)}>{controls.shutter.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
      <label>{scene.name} ISO<select aria-label={`${scene.name} ISO`} value={settings.iso} onChange={(event) => update("iso", event.target.value)}>{controls.iso.map((value) => <option key={value} value={value}>ISO {value}</option>)}</select></label>
      <Meter offset={offset} />
      <button className="button primary-button capture-button" onClick={takePhoto}>Take {scene.name} photo</button>
    </div>
    {feedback && <div className="feedback metering-feedback" aria-live="polite"><p className="eyebrow">Criterion Status</p><h3>{feedback.status === "Achieved" ? "Challenge complete" : "Keep experimenting"}</h3><article><h4>{scene.name} intention</h4><strong className={`status status-${feedback.status.toLowerCase()}`}>{feedback.status}</strong><p>{feedback.explanation}</p></article><p><strong>Tradeoff Feedback:</strong> Aperture, shutter speed, and ISO can move the Rendered Result relative to the Meter Reference in different combinations. Judge the visible intention and Clipping evidence together.</p></div>}
  </section>;
}

function MeteringPreview({ sceneId, settings, eager = false, capturing = false }: { sceneId: MeteringSceneId; settings: ExposureSettings; eager?: boolean; capturing?: boolean }) {
  const scene = scenes[sceneId];
  const meterOffset = meterOffsetStops(settings, scene.meterReference);
  const renderedFromSourceStops = meterOffset - intendedSourceOffset(sceneId);
  const [histogram, setHistogram] = useState(() => fallbackHistogram(sceneId, renderedFromSourceStops));
  const summary = summarizeHistogram(histogram);
  const brightness = Math.max(0.25, Math.min(2, 2 ** renderedFromSourceStops));

  useEffect(() => setHistogram(fallbackHistogram(sceneId, renderedFromSourceStops)), [sceneId, renderedFromSourceStops]);

  function deriveHistogram(image: HTMLImageElement) {
    try {
      const width = Math.min(240, image.naturalWidth);
      const height = Math.max(1, Math.round(width * image.naturalHeight / image.naturalWidth));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, width, height);
      setHistogram(buildLuminanceHistogram(context.getImageData(0, 0, width, height).data, renderedFromSourceStops));
    } catch {
      // The calibrated fallback stays synchronized when pixel inspection is unavailable.
    }
  }

  return <figure className={`lesson-preview metering-preview ${sceneId}`} data-testid="metering-rendered-result" data-meter-offset={meterOffset} aria-label={`Rendered Result for ${scene.name} at ${signedStops(meterOffset)}. ${summary}`}>
    <div className="lesson-preview-frame">
      <Image key={scene.sourceAsset} src={`/images/${scene.sourceAsset}`} alt={sceneId === "bright-snow" ? "A broad snow-covered mountain landscape beneath a blue sky" : "A singer lit in violet and blue against a dark stage"} fill priority={eager} sizes="(max-width: 800px) 100vw, 58vw" style={{ filter: `brightness(${brightness})` }} onLoad={(event) => deriveHistogram(event.currentTarget)} />
      {capturing && <span className="shutter-curtain" data-testid="shutter-curtain" aria-hidden />}
      <div className="preview-readout"><span>{scene.name}</span><strong>f/{settings.aperture} · 1/{settings.shutter}s · ISO {settings.iso}</strong></div>
    </div>
    <Histogram histogram={histogram} summary={summary} />
    <figcaption>{summary} <span className="metering-fallback">The visual brightness effect is unavailable; the synchronized meter, luminance Histogram, text, and evaluation remain authoritative.</span></figcaption>
  </figure>;
}

function Histogram({ histogram, summary }: { histogram: LuminanceHistogram; summary: string }) {
  const maximum = Math.max(1, ...histogram.bins);
  const width = 240;
  const height = 92;
  const barWidth = width / histogram.bins.length;
  return <div className="histogram-panel">
    <svg className="histogram" data-testid="luminance-histogram" role="img" aria-label={`Luminance Histogram. ${summary}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <title>Luminance Histogram</title>
      {histogram.bins.map((count, index) => {
        const barHeight = count / maximum * (height - 4);
        return <rect key={index} x={index * barWidth} y={height - barHeight} width={Math.max(1, barWidth - 1)} height={barHeight} />;
      })}
    </svg>
    <div className="histogram-axis" aria-hidden><span>Dark</span><span>Bright</span></div>
    <p data-testid="histogram-summary" aria-live="polite">{summary}</p>
  </div>;
}

function Meter({ offset }: { offset: number }) {
  const position = Math.max(0, Math.min(100, ((offset + 2) / 4) * 100));
  return <div className="meter-readout" role="img" aria-label={meterLabel(offset)}>
    <div className="meter-track" aria-hidden><span>−2</span><span>−1</span><span>0</span><span>+1</span><span>+2</span><i style={{ left: `${position}%` }} /></div>
    <strong>{meterLabel(offset)}</strong>
  </div>;
}

function meterLabel(offset: number) {
  return `Meter Reference: ${signedStops(offset)}`;
}

function signedStops(offset: number) {
  return `${offset > 0 ? "+" : ""}${offset} Stop${Math.abs(offset) === 1 ? "" : "s"}`;
}

function intendedSourceOffset(sceneId: MeteringSceneId) {
  return sceneId === "bright-snow" ? 1 : -1;
}

function fallbackHistogram(sceneId: MeteringSceneId, renderedFromSourceStops: number) {
  const values = sceneId === "bright-snow"
    ? [110, 145, 170, 185, 195, 205, 215, 220, 225, 230, 232, 235, 238, 240, 244, 248, 250]
    : [0, 0, 1, 2, 4, 7, 10, 14, 20, 28, 38, 52, 72, 96, 130, 180, 232];
  return buildLuminanceHistogram(new Uint8ClampedArray(values.flatMap((value) => [value, value, value, 255])), renderedFromSourceStops);
}
