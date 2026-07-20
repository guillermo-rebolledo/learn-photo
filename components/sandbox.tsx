"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { resolveExposureMode, type ExposureMode } from "@/lib/exposure-mode-model";
import { buildLuminanceHistogram, summarizeHistogram, type LuminanceHistogram } from "@/lib/metering-model";
import { formatShutter, nearestScaleSettings, type ExposureSettings } from "@/lib/exposure-scales";
import { reconcileSceneSettings, sandboxExposureOffset, sandboxScenes, sceneCredit, scenePreviewImage, sceneScale, type SandboxScale, type SandboxSceneId } from "@/lib/sandbox-model";
import { useSettledRender } from "./use-settled-render";

const modeNames: Record<ExposureMode, string> = { Auto: "Auto", P: "Program (P)", A: "Aperture Priority (A / Av)", S: "Shutter Priority (S / Tv)", M: "Manual (M)" };

function portraitBlurFor(sceneId: SandboxSceneId, aperture: number) {
  return sceneId === "window-light-portrait" ? (aperture <= 2.8 ? 14 : aperture >= 8 ? 0 : 7) : 0;
}

function motionEchoCountFor(sceneId: SandboxSceneId, shutter: number) {
  return sceneId === "moving-cyclist" && shutter < 500 ? (shutter <= 60 ? 3 : 1) : 0;
}

function noiseOpacityFor(sceneId: SandboxSceneId, iso: number) {
  return sceneId === "dim-indoor-performance" ? Math.max(0, Math.min(.28, Math.log2(iso / 100) * .04)) : 0;
}

export function Sandbox() {
  const [sceneId, setSceneId] = useState<SandboxSceneId>("neutral-still-life");
  const [scaleName, setScaleName] = useState<SandboxScale>("beginner");
  const [mode, setMode] = useState<ExposureMode>("M");
  const [selected, setSelected] = useState<ExposureSettings>({ aperture: 5.6, shutter: 60, iso: 400 });
  const [showHistogram, setShowHistogram] = useState(false);
  const [compensation, setCompensation] = useState(0);
  const [autoIso, setAutoIso] = useState(false);
  const [histogram, setHistogram] = useState<LuminanceHistogram | null>(null);
  const [histogramUnavailable, setHistogramUnavailable] = useState(false);
  const [adjustment, setAdjustment] = useState("");
  const [visualEffectsAvailable, setVisualEffectsAvailable] = useState(true);
  const scene = sandboxScenes.find((candidate) => candidate.id === sceneId) ?? sandboxScenes[0];
  const limits = sceneScale(scene, scaleName);
  const refinementGeneration = useRef(0);
  const resolved = resolveExposureMode({ mode, selected, scene: { meterReference: scene.meterReference, limits }, compensation, autoIso });
  const offset = sandboxExposureOffset(resolved.settings, scene);
  const credit = sceneCredit(scene);
  const renderKey = `${scene.id}:${resolved.settings.aperture}:${resolved.settings.shutter}:${resolved.settings.iso}`;
  const { isSettled: renderIsSettled } = useSettledRender(renderKey, renderKey);
  const previewImage = scenePreviewImage(scene);

  useEffect(() => {
    setVisualEffectsAvailable(typeof CSS !== "undefined" && CSS.supports("filter", "brightness(1)"));
  }, []);

  useEffect(() => {
    refinementGeneration.current += 1;
    setHistogram(null);
    setHistogramUnavailable(false);
  }, [renderKey]);

  function chooseScene(nextId: SandboxSceneId) {
    const nextScene = sandboxScenes.find((candidate) => candidate.id === nextId) ?? sandboxScenes[0];
    const next = reconcileSceneSettings(resolved.settings, nextScene, scaleName);
    const changed = (Object.keys(next) as (keyof ExposureSettings)[]).filter((control) => next[control] !== resolved.settings[control]);
    setSceneId(nextId);
    setSelected(next);
    setAdjustment(changed.length ? `Settings adjusted for ${nextScene.name}: ${changed.map((control) => control === "iso" ? `ISO ${next.iso}` : control === "aperture" ? `aperture f/${next.aperture}` : `shutter ${formatShutter(next.shutter)}`).join(", ")} to remain valid under its Scene Assumptions.` : `Settings preserved for ${nextScene.name}; each remains valid under its Scene Assumptions.`);
  }

  function chooseScale(nextScale: SandboxScale) {
    const next = nearestScaleSettings(resolved.settings, sceneScale(scene, nextScale));
    setScaleName(nextScale);
    setSelected(next);
    setAdjustment(`Settings aligned to the ${nextScale === "camera" ? "Camera Scale" : "Beginner Scale"}.`);
  }

  function update(control: keyof ExposureSettings, value: string) {
    setSelected((current) => ({ ...current, [control]: Number(value) }));
    setAdjustment("");
  }

  const brightness = Math.max(.3, Math.min(1.8, 2 ** offset));
  const publishHistogram = useCallback(async (image: HTMLImageElement, exposureStops: number, currentSceneId: SandboxSceneId, settings: ExposureSettings, generation: number) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 120; canvas.height = 80;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas unavailable");
      const drawingContext = context;
      const blur = portraitBlurFor(currentSceneId, settings.aperture);
      context.filter = `brightness(${2 ** exposureStops}) blur(${blur}px)`;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      function loadLayer(source: string) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const next = new window.Image();
          next.onload = () => resolve(next);
          next.onerror = reject;
          next.src = source;
        });
      }

      async function drawMaskedLayer(maskSource: string, offsetX: number, opacity: number, layerBlur: number) {
        const mask = await loadLayer(maskSource);
        const layer = document.createElement("canvas");
        layer.width = canvas.width; layer.height = canvas.height;
        const layerContext = layer.getContext("2d");
        if (!layerContext) throw new Error("Layer canvas unavailable");
        layerContext.filter = `brightness(${2 ** exposureStops}) blur(${layerBlur}px)`;
        layerContext.drawImage(image, offsetX, 0, canvas.width, canvas.height);
        layerContext.filter = "none";
        layerContext.globalCompositeOperation = "destination-in";
        layerContext.drawImage(mask, 0, 0, canvas.width, canvas.height);
        drawingContext.filter = "none";
        drawingContext.globalAlpha = opacity;
        drawingContext.drawImage(layer, 0, 0);
        drawingContext.globalAlpha = 1;
      }

      if (currentSceneId === "window-light-portrait" && blur > 0) {
        await drawMaskedLayer("/images/window-light-portrait-subject.svg", 0, 1, 0);
      }
      const echoCount = motionEchoCountFor(currentSceneId, settings.shutter);
      if (echoCount > 0) {
        for (let index = 0; index < echoCount; index += 1) {
          await drawMaskedLayer("/images/moving-cyclist-subject.svg", -3 * (index + 1), .26 - index * .05, 3 + index * 2);
        }
      }
      const performanceNoiseOpacity = noiseOpacityFor(currentSceneId, settings.iso);
      if (performanceNoiseOpacity > 0) {
        const noise = await loadLayer("/images/dim-indoor-performance-noise.svg");
        drawingContext.filter = "none";
        drawingContext.globalAlpha = performanceNoiseOpacity;
        drawingContext.globalCompositeOperation = "screen";
        const tileSize = 18;
        for (let x = 0; x < canvas.width; x += tileSize) for (let y = 0; y < canvas.height; y += tileSize) drawingContext.drawImage(noise, x, y, tileSize, tileSize);
        drawingContext.globalCompositeOperation = "source-over";
        drawingContext.globalAlpha = 1;
      }
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      if (generation !== refinementGeneration.current) return;
      setHistogram(buildLuminanceHistogram(pixels, 0));
      setHistogramUnavailable(false);
    } catch {
      if (generation !== refinementGeneration.current) return;
      setHistogram(null);
      setHistogramUnavailable(true);
    }
  }, []);

  const histogramSummary = histogram ? summarizeHistogram(histogram) : histogramUnavailable ? "The pixel-derived luminance Histogram is unavailable; the textual Rendered Result remains authoritative." : renderIsSettled ? "The pixel-derived luminance Histogram is updating." : "The responsive preview is active; the pixel-derived luminance Histogram will refine when input settles.";
  const histogramMax = histogram ? Math.max(...histogram.bins, 1) : 1;
  const motionEchoes = renderIsSettled ? motionEchoCountFor(scene.id, resolved.settings.shutter) : 0;
  const portraitBlur = renderIsSettled ? portraitBlurFor(scene.id, resolved.settings.aperture) : 0;
  const noiseOpacity = renderIsSettled ? noiseOpacityFor(scene.id, resolved.settings.iso) : 0;

  return <div className={visualEffectsAvailable ? undefined : "no-sandbox-effects"}>
    <fieldset className="sandbox-scenes" role="radiogroup" aria-label="Curated Scene"><legend>Curated Scene</legend>{sandboxScenes.map((candidate) => <label key={candidate.id}><input type="radio" name="sandbox-scene" checked={scene.id === candidate.id} onChange={() => chooseScene(candidate.id)} />{candidate.name}</label>)}</fieldset>
    <p className="sandbox-adjustment" aria-live="polite">{adjustment}</p>
    <div className="simulator sandbox-simulator">
      <figure className="lesson-preview sandbox-preview" data-testid="sandbox-rendered-result" data-scene={scene.id} data-shutter={resolved.settings.shutter} data-render-quality={renderIsSettled ? "refined" : "preview"} style={{ "--sandbox-brightness": brightness } as React.CSSProperties} aria-label={`Rendered Result for ${scene.name}. ${scene.outcome(resolved.settings, scene.meterReference)}`}>
        <div className="lesson-preview-frame">
          <Image data-testid="sandbox-preview-image" key={previewImage} src={`/images/${previewImage}`} alt={scene.alt} fill priority sizes="(max-width: 900px) 100vw, 65vw" style={{ filter: visualEffectsAvailable ? `brightness(${brightness})` : "none" }} />
          {renderIsSettled && <Image data-testid="sandbox-refined-image" key={`${scene.image}:${renderKey}`} className="sandbox-refined-image" src={`/images/${scene.image}`} alt="" aria-hidden fill loading="eager" sizes="(max-width: 900px) 100vw, 65vw" onLoad={(event) => publishHistogram(event.currentTarget, offset, scene.id, resolved.settings, refinementGeneration.current)} style={{ filter: visualEffectsAvailable ? `brightness(${brightness}) blur(${portraitBlur}px)` : "none" }} />}
          {renderIsSettled && portraitBlur > 0 && <Image className="sandbox-portrait-subject" src={`/images/${scene.image}`} alt="" aria-hidden fill loading="lazy" sizes="(max-width: 900px) 100vw, 65vw" style={{ filter: `brightness(${brightness})` }} />}
          {renderIsSettled && Array.from({ length: motionEchoes }, (_, index) => <Image className="sandbox-cyclist-echo" key={index} src={`/images/${scene.image}`} alt="" aria-hidden fill loading="lazy" sizes="(max-width: 900px) 100vw, 65vw" style={{ opacity: .26 - index * .05, transform: `translateX(${-18 * (index + 1)}px)`, filter: `brightness(${brightness}) blur(${3 + index * 2}px)` }} />)}
          {renderIsSettled && noiseOpacity > 0 && <span className="noise-layer" style={{ opacity: noiseOpacity }} />}
          <div className="preview-readout"><span>{scene.name}</span><strong>f/{resolved.settings.aperture} · {formatShutter(resolved.settings.shutter)} · ISO {resolved.settings.iso}</strong></div>
        </div>
        {showHistogram && <div className="histogram-panel" data-testid="sandbox-histogram">{histogram && <svg className="histogram" role="img" aria-label={`Luminance Histogram. ${histogramSummary}`} viewBox={`0 0 ${histogram.bins.length * 10} 60`} preserveAspectRatio="none"><title>Luminance Histogram</title>{histogram.bins.map((count, index) => { const height = count / histogramMax * 58; return <rect key={index} x={index * 10 + 1} y={60 - height} width="8" height={height} />; })}</svg>}<div className="histogram-axis"><span>Darker</span><span>Brighter</span></div><p aria-live="polite">{histogramSummary}</p></div>}
        <figcaption data-testid="sandbox-text-outcome">{scene.outcome(resolved.settings, scene.meterReference)} {!visualEffectsAvailable && "Visual refinement is unavailable; the Source Photograph, controls, Meter Reference, Histogram, and this textual outcome remain usable."}</figcaption>
      </figure>
      <div className="camera-controls">
        <label>Control scale<select aria-label="Control scale" value={scaleName} onChange={(event) => chooseScale(event.target.value as SandboxScale)}><option value="beginner">Beginner Scale</option><option value="camera">Camera Scale</option></select></label>
        <fieldset className="mode-selector"><legend>Exposure Mode</legend>{(Object.keys(modeNames) as ExposureMode[]).map((value) => <label key={value}><input type="radio" name="sandbox-mode" checked={mode === value} onChange={() => setMode(value)} />{modeNames[value]}</label>)}</fieldset>
        {(["aperture", "shutter", "iso"] as const).map((control) => <label key={control}>{control === "iso" ? "ISO" : control === "shutter" ? "Shutter speed" : "Aperture"}<select aria-label={control === "iso" ? "ISO" : control === "shutter" ? "Shutter speed" : "Aperture"} value={resolved.cameraControls.includes(control) ? resolved.settings[control] : selected[control]} disabled={resolved.cameraControls.includes(control)} onChange={(event) => update(control, event.target.value)}>{limits[control].map((value) => <option value={value} key={value}>{control === "iso" ? `ISO ${value}` : control === "aperture" ? `f/${value}` : formatShutter(value)}</option>)}</select><span>{resolved.cameraControls.includes(control) ? "Camera-selected" : "Learner-selected"}</span></label>)}
        <label>Exposure Compensation<select aria-label="Exposure Compensation" value={compensation} disabled={mode === "M"} onChange={(event) => setCompensation(Number(event.target.value))}>{[-2, -1, 0, 1, 2].map((value) => <option key={value} value={value}>{value > 0 ? "+" : ""}{value} Stop{Math.abs(value) === 1 ? "" : "s"}</option>)}</select></label>
        <label className="sandbox-histogram-toggle"><input type="checkbox" aria-label="Auto ISO" checked={autoIso} onChange={(event) => setAutoIso(event.target.checked)} />Auto ISO (optional)</label>
        <label className="sandbox-histogram-toggle"><input type="checkbox" aria-label="Show luminance Histogram" checked={showHistogram} onChange={(event) => setShowHistogram(event.target.checked)} />Show luminance Histogram</label>
        <div className="meter-readout" aria-label="Meter Reference"><strong>Meter Reference · {offset > 0 ? "+" : ""}{offset.toFixed(1)} Stops</strong><div className="meter-track" aria-hidden><span>−2</span><span>−1</span><span>0</span><span>+1</span><span>+2</span><i style={{ left: `${Math.max(0, Math.min(100, 50 + offset * 25))}%` }} /></div></div>
        <p className="control-outcome" aria-live="polite">{resolved.cameraControls.length ? `Camera selects ${resolved.cameraControls.join(", ")}.` : "The Learner selects every Exposure Control."}</p>
      </div>
    </div>
    <details className="scene-assumptions"><summary>Scene Assumptions and Conceptual Simulator limits</summary><p>{scene.assumptions} This deterministic Conceptual Simulator demonstrates relative outcomes; it does not predict a particular Camera, lens, or real scene exactly.</p></details>
    <aside className="photo-credit"><strong>Source Photograph:</strong> <a href={credit.sourceUrl}>{credit.photographer}</a> · <a href={credit.licenseUrl}>{credit.license}</a>. Local derivatives and modifications are documented in the image manifest.</aside>
  </div>;
}
