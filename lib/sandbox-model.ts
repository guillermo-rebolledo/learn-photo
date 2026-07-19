import imageManifest from "@/public/images/manifest.json";
import { beginnerScale, cameraScale, nearestScaleSettings, type ExposureScale, type ExposureSettings } from "./exposure-scales";

export type SandboxSceneId = "neutral-still-life" | "window-light-portrait" | "moving-cyclist" | "dim-indoor-performance" | "bright-snow" | "dark-stage";
export type SandboxScale = "beginner" | "camera";

type ManifestKey = keyof typeof imageManifest;

export type SandboxScene = {
  id: SandboxSceneId;
  name: string;
  image: string;
  alt: string;
  meterReference: ExposureSettings;
  assumptions: string;
  outcome: (settings: ExposureSettings, reference: ExposureSettings) => string;
  manifestKey: ManifestKey;
  limits?: Partial<{ [Control in keyof ExposureSettings]: readonly number[] }>;
};

const exposureOffset = (settings: ExposureSettings, reference: ExposureSettings) =>
  Math.log2((settings.iso / reference.iso) * (reference.shutter / settings.shutter) * ((reference.aperture / settings.aperture) ** 2));

function tonalOutcome(settings: ExposureSettings, reference: ExposureSettings) {
  const stops = exposureOffset(settings, reference);
  if (Math.abs(stops) < 0.35) return "The Rendered Result is close to this scene’s Meter Reference.";
  return `The Rendered Result is ${Math.abs(stops).toFixed(1)} Stops ${stops > 0 ? "brighter" : "darker"} than this scene’s Meter Reference.`;
}

export const sandboxScenes: readonly SandboxScene[] = [
  { id: "neutral-still-life", name: "Neutral Still Life", image: "neutral-still-life-960.jpg", alt: "A tabletop still life with fruit, cups, and books in window light", meterReference: { aperture: 5.6, shutter: 60, iso: 400 }, assumptions: "Full-frame format, 50 mm view, tripod stability, 2 m focus distance, and still objects.", outcome: (settings, reference) => `${tonalOutcome(settings, reference)} This neutral scene makes equivalent exposure combinations easy to compare.`, manifestKey: "neutralStillLife" },
  { id: "window-light-portrait", name: "Window-Light Portrait", image: "window-light-portrait-960.jpg", alt: "A portrait beside a window", meterReference: { aperture: 5.6, shutter: 60, iso: 400 }, assumptions: "APS-C format, 50 mm view, 2.2 m focus distance, handheld Camera, and a still subject.", outcome: (settings, reference) => `${tonalOutcome(settings, reference)} ${settings.aperture <= 2.8 ? "The background appears softly defined." : settings.aperture >= 8 ? "More background definition remains visible." : "Background definition is moderate."}`, manifestKey: "windowLightPortrait" },
  { id: "moving-cyclist", name: "Moving Cyclist", image: "moving-cyclist-960.jpg", alt: "A cyclist riding along a road", meterReference: { aperture: 5.6, shutter: 125, iso: 400 }, assumptions: "85 mm view, stable support, fixed Camera position, and steady left-to-right subject motion.", outcome: (settings, reference) => `${tonalOutcome(settings, reference)} ${settings.shutter >= 500 ? "The fast shutter holds the cyclist with little visible travel." : settings.shutter <= 60 ? "The slower shutter shows strong directional travel." : "A short directional trace communicates motion."}`, manifestKey: "movingCyclist" },
  { id: "dim-indoor-performance", name: "Dim Indoor Performance", image: "dim-indoor-performance-960.jpg", alt: "A violinist performing under dim colored stage light", meterReference: { aperture: 1.8, shutter: 250, iso: 800 }, assumptions: "Full-frame format, 85 mm view, handheld Camera, and an energetic performer.", outcome: (settings, reference) => `${tonalOutcome(settings, reference)} ${settings.iso >= 3200 ? "High ISO adds pronounced simulated noise." : "The simulated noise remains restrained."}`, manifestKey: "dimIndoorPerformance" },
  { id: "bright-snow", name: "Bright Snow", image: "bright-snow-960.jpg", alt: "A broad snow-covered mountain landscape beneath a blue sky", meterReference: { aperture: 8, shutter: 250, iso: 100 }, assumptions: "27 mm view, handheld Camera, still landscape, and ISO fixed at 100 for this calibrated scene.", outcome: (settings, reference) => `${tonalOutcome(settings, reference)} Bright tones may need to sit above the neutral Meter Reference without losing highlight detail.`, manifestKey: "brightSnow", limits: { iso: [100] } },
  { id: "dark-stage", name: "Dark Stage", image: "dark-stage-960.jpg", alt: "A singer lit against a dark stage", meterReference: { aperture: 2.8, shutter: 125, iso: 1600 }, assumptions: "200 mm view, handheld Camera, singer held within a 1/125s-or-faster range, and ISO fixed at 1600.", outcome: (settings, reference) => `${tonalOutcome(settings, reference)} The scene is intended to remain dark while separating the lit performer.`, manifestKey: "darkStage", limits: { shutter: [4000, 2000, 1000, 500, 250, 125], iso: [1600] } },
] as const;

export function sceneScale(scene: SandboxScene, scaleName: SandboxScale): ExposureScale {
  const scale = scaleName === "camera" ? cameraScale : beginnerScale;
  return {
    aperture: scene.limits?.aperture ?? scale.aperture,
    shutter: scene.limits?.shutter ? scale.shutter.filter((value) => scene.limits?.shutter?.includes(value)) : scale.shutter,
    iso: scene.limits?.iso ?? scale.iso,
  };
}

export function reconcileSceneSettings(settings: ExposureSettings, scene: SandboxScene, scaleName: SandboxScale) {
  return nearestScaleSettings(settings, sceneScale(scene, scaleName));
}

export function sandboxExposureOffset(settings: ExposureSettings, scene: SandboxScene) {
  return exposureOffset(settings, scene.meterReference);
}

export function sceneCredit(scene: SandboxScene) {
  return imageManifest[scene.manifestKey];
}
