"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  lessonSix,
  meteringChallenges,
  meteringScenes,
} from "@/lib/curriculum";
import type { ExposureSettings } from "@/lib/exposure-model";
import {
  buildLuminanceHistogram,
  calibratedFallbackHistogram,
  evaluateMeteringAttempt,
  meterOffsetStops,
  renderExposurePixels,
  summarizeHistogram,
  type LuminanceHistogram,
  type MeteringSceneId,
} from "@/lib/metering-model";

export function LessonSix({ explanation }: { explanation: React.ReactNode }) {
  const [guidedSceneId, setGuidedSceneId] = useState<MeteringSceneId>("bright-snow");
  const [guidedSettings, setGuidedSettings] = useState<ExposureSettings>(meteringScenes["bright-snow"].meterReference);
  const [visualEffectsAvailable, setVisualEffectsAvailable] = useState(true);
  const guidedScene = meteringScenes[guidedSceneId];
  const guidedOffset = meterOffsetStops(guidedSettings, guidedScene.meterReference);

  useEffect(() => {
    const context = document.createElement("canvas").getContext("2d");
    setVisualEffectsAvailable(Boolean(context) && typeof CSS !== "undefined" && CSS.supports("display", "block"));
  }, []);

  function chooseGuidedScene(sceneId: MeteringSceneId) {
    setGuidedSceneId(sceneId);
    setGuidedSettings(meteringScenes[sceneId].meterReference);
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
          <label>Guided shutter speed<select aria-label="Guided shutter speed" value={guidedSettings.shutter} onChange={(event) => setGuidedSettings({ ...guidedSettings, shutter: Number(event.target.value) })}>{guidedScene.controls.shutter.map((shutter) => <option key={shutter} value={shutter}>1/{shutter}s</option>)}</select></label>
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

    <details className="scene-assumptions"><summary>Scene Assumptions and graceful fallback</summary><p>Bright Snow fixes ISO 100 for a still mountain landscape at 27 mm. Dark Stage fixes ISO 1600 and offers only its calibrated 1/125s-or-faster range for a handheld Camera at 200 mm. Those visible limits isolate metering decisions without pretending to render new noise or motion effects. The Conceptual Simulator transforms and clips the Source Photograph’s pixels deterministically. If canvas rendering is unavailable, the meter, Histogram, textual summary, and Challenge evaluation remain active.</p></details>
    <details className="sources"><summary>Sources and further reading</summary><ul>{lessonSix.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a> — {source.publisher}</li>)}</ul></details>
    <aside className="photo-credit"><p><strong>Source Photographs:</strong> “Khunjerab — the snowy landscape” by <a href="https://commons.wikimedia.org/wiki/File:Khunjerab_-_the_snowy_landscape.jpg">MaeraT</a>, and “Singer singing on stage” by <a href="https://commons.wikimedia.org/wiki/File:Singer_singing_on_stage.jpg">DonAdkinsPhoto</a>, both used under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Local derivatives are documented in the image manifest.</p></aside>
  </div>;
}

function MeteringChallenge({ sceneId }: { sceneId: MeteringSceneId }) {
  const scene = meteringScenes[sceneId];
  const challenge = meteringChallenges[sceneId];
  const controls = scene.controls;
  const [settings, setSettings] = useState<ExposureSettings>(scene.meterReference);
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateMeteringAttempt> | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [histogram, setHistogram] = useState(() => calibratedFallbackHistogram(sceneId, 0));
  const captureTimer = useRef<number | null>(null);
  const offset = meterOffsetStops(settings, scene.meterReference);

  useEffect(() => () => {
    if (captureTimer.current !== null) window.clearTimeout(captureTimer.current);
  }, []);

  function update(name: keyof ExposureSettings, value: string) {
    setSettings((current) => ({ ...current, [name]: Number(value) }));
    setFeedback(null);
  }

  function takePhoto() {
    if (captureTimer.current !== null) window.clearTimeout(captureTimer.current);
    setCapturing(true);
    setFeedback(null);
    const evaluation = evaluateMeteringAttempt(sceneId, settings, histogram);
    captureTimer.current = window.setTimeout(() => {
      setFeedback(evaluation);
      setCapturing(false);
    }, 220);
  }

  return <section className="metering-challenge" aria-labelledby={`${sceneId}-challenge-title`}>
    <header><p className="eyebrow">{scene.name}</p><h3 id={`${sceneId}-challenge-title`}>{challenge.photographicIntention}</h3></header>
    <MeteringPreview sceneId={sceneId} settings={settings} capturing={capturing} onHistogramChange={setHistogram} />
    <div className="camera-controls metering-controls">
      <label>{scene.name} aperture<select aria-label={`${scene.name} aperture`} value={settings.aperture} onChange={(event) => update("aperture", event.target.value)}>{controls.aperture.map((value) => <option key={value} value={value}>f/{value}</option>)}</select></label>
      <label>{scene.name} shutter speed<select aria-label={`${scene.name} shutter speed`} value={settings.shutter} onChange={(event) => update("shutter", event.target.value)}>{controls.shutter.map((value) => <option key={value} value={value}>1/{value}s</option>)}</select></label>
      <div className="fixed-control"><span>{scene.name} ISO</span><strong>ISO {scene.assumptions.fixedIso} · fixed Scene Assumption</strong></div>
      <Meter offset={offset} />
      <button className="button primary-button capture-button" onClick={takePhoto}>Take {scene.name} photo</button>
    </div>
    {feedback && <div className="feedback metering-feedback" aria-live="polite"><p className="eyebrow">Criterion Status</p><h3>{feedback.complete ? "Challenge complete" : "Keep experimenting"}</h3>{Object.values(feedback.criteria).map((criterion, index) => <article key={challenge.successCriteria[index].id}><h4>{challenge.successCriteria[index].label}</h4><strong className={`status status-${criterion.status.toLowerCase()}`}>{criterion.status}</strong><p>{criterion.explanation}</p></article>)}<p><strong>Tradeoff Feedback:</strong> Aperture, shutter speed, and ISO can move the Rendered Result relative to the Meter Reference in different combinations. Judge tonal distribution, Clipping evidence, and the scene assumptions together.</p></div>}
  </section>;
}

function MeteringPreview({ sceneId, settings, eager = false, capturing = false, onHistogramChange }: { sceneId: MeteringSceneId; settings: ExposureSettings; eager?: boolean; capturing?: boolean; onHistogramChange?: (histogram: LuminanceHistogram) => void }) {
  const scene = meteringScenes[sceneId];
  const meterOffset = meterOffsetStops(settings, scene.meterReference);
  const renderedFromSourceStops = meterOffset - scene.calibration.sourceRenderingOffset;
  const [histogram, setHistogram] = useState(() => calibratedFallbackHistogram(sceneId, meterOffset));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourcePixels = useRef<{ sceneId: MeteringSceneId; pixels: Uint8ClampedArray; width: number; height: number } | null>(null);
  const summary = summarizeHistogram(histogram);

  useEffect(() => {
    const source = sourcePixels.current;
    if (source?.sceneId === sceneId) {
      paintRenderedResult(source.pixels, source.width, source.height);
      return;
    }
    const fallback = calibratedFallbackHistogram(sceneId, meterOffset);
    setHistogram(fallback);
    onHistogramChange?.(fallback);
  }, [sceneId, renderedFromSourceStops]);

  function paintRenderedResult(pixels: Uint8ClampedArray, width: number, height: number) {
    const renderedPixels = renderExposurePixels(pixels, renderedFromSourceStops);
    const context = canvasRef.current?.getContext("2d");
    if (context) {
      canvasRef.current!.width = width;
      canvasRef.current!.height = height;
      context.putImageData(new ImageData(renderedPixels, width, height), 0, 0);
    }
    const derivedHistogram = buildLuminanceHistogram(renderedPixels, 0);
    setHistogram(derivedHistogram);
    onHistogramChange?.(derivedHistogram);
  }

  function deriveHistogram(image: HTMLImageElement) {
    try {
      const width = Math.min(480, image.naturalWidth);
      const height = Math.max(1, Math.round(width * image.naturalHeight / image.naturalWidth));
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, width, height);
      const pixels = new Uint8ClampedArray(context.getImageData(0, 0, width, height).data);
      sourcePixels.current = { sceneId, pixels, width, height };
      paintRenderedResult(pixels, width, height);
    } catch {
      // The calibrated fallback stays synchronized when pixel inspection is unavailable.
    }
  }

  return <figure className={`lesson-preview metering-preview ${sceneId}`} data-testid="metering-rendered-result" data-meter-offset={meterOffset} aria-label={`Rendered Result for ${scene.name} at ${signedStops(meterOffset)}. ${summary}`}>
    <div className="lesson-preview-frame">
      <Image key={scene.sourceAsset} src={`/images/${scene.sourceAsset}`} alt={sceneId === "bright-snow" ? "A broad snow-covered mountain landscape beneath a blue sky" : "A singer lit in violet and blue against a dark stage"} fill priority={eager} sizes="(max-width: 800px) 100vw, 58vw" onLoad={(event) => deriveHistogram(event.currentTarget)} />
      <canvas ref={canvasRef} className="metering-canvas" aria-hidden />
      {capturing && <span className="shutter-curtain" data-testid="shutter-curtain" aria-hidden />}
      <div className="preview-readout"><span>{scene.name}</span><strong>f/{settings.aperture} · 1/{settings.shutter}s · ISO {settings.iso}</strong></div>
    </div>
    <Histogram histogram={histogram} summary={summary} />
    <figcaption>{summary} <span className="metering-fallback">The visual canvas rendering is unavailable; the synchronized meter, luminance Histogram, text, and evaluation remain authoritative.</span></figcaption>
  </figure>;
}

function Histogram({ histogram, summary }: { histogram: LuminanceHistogram; summary: string }) {
  const maximum = Math.max(1, ...histogram.bins);
  const width = 240;
  const height = 92;
  const barWidth = width / histogram.bins.length;
  return <div className="histogram-panel">
    <svg className="histogram" data-testid="luminance-histogram" data-pixel-count={histogram.pixelCount} data-shadow-clipped-ratio={histogram.shadowClippedRatio.toFixed(4)} data-highlight-clipped-ratio={histogram.highlightClippedRatio.toFixed(4)} role="img" aria-label={`Luminance Histogram. ${summary}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
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
