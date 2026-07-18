import type { CriterionFeedback, ExposureSettings } from "./exposure-model";
import { dimIndoorPerformanceScene } from "./curriculum";

export type MotionIntention = "freeze" | "show-motion";

export function isoStops(iso: number, referenceIso = 100) {
  return Math.round(Math.log2(iso / referenceIso) * 100) / 100;
}

export function performanceExposureStops(settings: ExposureSettings) {
  const reference = dimIndoorPerformanceScene.meterReference;
  return Math.round(Math.log2((settings.iso / reference.iso) * (reference.shutter / settings.shutter) * ((reference.aperture / settings.aperture) ** 2)) * 100) / 100;
}

export function noiseOutcome(iso: number) {
  const anchors = dimIndoorPerformanceScene.calibration.noise;
  const upperIndex = anchors.findIndex((anchor) => iso <= anchor.iso);
  const upper = anchors[upperIndex < 0 ? anchors.length - 1 : upperIndex];
  const lower = anchors[Math.max(0, (upperIndex < 0 ? anchors.length - 1 : upperIndex) - 1)];
  const progress = upper.iso === lower.iso ? 0 : (Math.log2(iso) - Math.log2(lower.iso)) / (Math.log2(upper.iso) - Math.log2(lower.iso));
  const opacity = Math.round((lower.opacity + (upper.opacity - lower.opacity) * Math.max(0, Math.min(1, progress))) * 100) / 100;
  const band = iso <= 800 ? "clean" : iso <= 3200 ? "visible" : "strong";
  const description = band === "clean" ? "Fine detail remains clean in this calibrated preview." : band === "visible" ? "Noise is visible in darker tones, while detail remains usable." : "Strong noise and reduced fine detail are visible in darker tones.";
  return { band, opacity, description } as const;
}

export function performanceMotion(shutter: number) {
  const safe = dimIndoorPerformanceScene.calibration.motionSafeShutter;
  if (shutter >= safe) return { band: "frozen" as const, offset: 0 };
  if (shutter >= safe / 2) return { band: "trace" as const, offset: 3 };
  return { band: "flowing" as const, offset: 7 };
}

function exposureStatus(distance: number): CriterionFeedback["status"] { return distance <= .4 ? "Achieved" : distance <= 1.1 ? "Close" : "Missed"; }

export function evaluatePerformanceAttempt(settings: ExposureSettings, intention: MotionIntention) {
  const stops = performanceExposureStops(settings);
  const exposure = exposureStatus(Math.abs(stops));
  const motionBand = performanceMotion(settings.shutter).band;
  const motion: CriterionFeedback["status"] = intention === "freeze" ? motionBand === "frozen" ? "Achieved" : motionBand === "trace" ? "Close" : "Missed" : motionBand === "flowing" ? "Achieved" : motionBand === "trace" ? "Close" : "Missed";
  const quality: CriterionFeedback["status"] = settings.iso <= 3200 ? "Achieved" : settings.iso <= 6400 ? "Close" : "Missed";
  return {
    exposure: { status: exposure, explanation: exposure === "Achieved" ? "Rendered Brightness is usable." : stops < 0 ? "The result renders too dark." : "The result renders too bright." },
    motion: { status: motion, explanation: motion === "Achieved" ? `The shutter supports the ${intention === "freeze" ? "frozen" : "flowing"} motion intention.` : `Choose a ${intention === "freeze" ? "faster" : "slower"} shutter for this motion intention.` },
    quality: { status: quality, explanation: quality === "Achieved" ? "ISO is compatible with the image-quality goal." : quality === "Close" ? "Noise is noticeable but may be an acceptable tradeoff." : "Strong noise conflicts with the image-quality goal." },
  } satisfies Record<string, CriterionFeedback>;
}
