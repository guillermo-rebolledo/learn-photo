import { evaluatePortraitAttempt } from "./aperture-model";
import { evaluatePerformanceAttempt } from "./iso-model";
import { evaluateCyclistAttempt } from "./shutter-model";
import type { CriterionFeedback, ExposureSettings } from "./exposure-model";

export type CapstonePath = "motion" | "depth" | "lowLight";
export type CapstoneResult = {
  criteria: readonly { id: string; label: string; essential: boolean; result: CriterionFeedback }[];
  complete: boolean;
};

function result(criteria: CapstoneResult["criteria"]): CapstoneResult {
  return { criteria, complete: criteria.every(({ essential, result }) => !essential || result.status === "Achieved") };
}

export function evaluateCapstone(path: CapstonePath, settings: ExposureSettings): CapstoneResult {
  if (path === "motion") {
    const evaluated = evaluateCyclistAttempt(settings, "freeze");
    return result([
      { id: "usable-exposure", label: "Usable exposure", essential: true, result: evaluated.exposure },
      { id: "intended-motion", label: "Intended motion", essential: true, result: evaluated.motion },
    ]);
  }
  if (path === "depth") {
    const evaluated = evaluatePortraitAttempt(settings, "defined-background");
    return result([
      { id: "usable-exposure", label: "Usable exposure", essential: true, result: evaluated.exposure },
      { id: "intended-depth", label: "Intended depth of field", essential: true, result: evaluated.depth },
      { id: "fixed-film-speed", label: "Fixed film speed", essential: true, result: { status: settings.iso === 400 ? "Achieved" : "Missed", explanation: settings.iso === 400 ? "ISO 400 remains fixed across the roll." : "The Film Constraint requires ISO 400 across the roll." } },
    ]);
  }
  const evaluated = evaluatePerformanceAttempt(settings, "freeze");
  return result([
    { id: "usable-exposure", label: "Usable exposure", essential: true, result: evaluated.exposure },
    { id: "intended-motion", label: "Intended motion", essential: true, result: evaluated.motion },
    { id: "image-quality", label: "Image quality", essential: false, result: evaluated.quality },
  ]);
}

export const capstoneDefinitions = {
  motion: {
    title: "Hold a decisive moment",
    regionLabel: "Motion Capstone Challenge",
    intention: "Freeze the cyclist while keeping the exposure usable.",
    hint: "Start with shutter speed because motion is the defining intention; then rebalance aperture or ISO.",
    defaults: { aperture: 5.6, shutter: 125, iso: 400 },
    controls: { aperture: [2.8, 4, 5.6, 8], shutter: [60, 125, 250, 500, 1000], iso: [100, 200, 400, 800, 1600] },
  },
  depth: {
    title: "Keep the room legible on film",
    regionLabel: "Depth of field Capstone Challenge",
    intention: "Preserve background definition with an ISO 400 Film Constraint.",
    hint: "Start with a narrower aperture for depth, then use shutter speed to restore Captured Light; film speed stays fixed.",
    defaults: { aperture: 5.6, shutter: 60, iso: 400 },
    controls: { aperture: [2.8, 4, 5.6, 8, 11], shutter: [30, 60, 125, 250], iso: [400] },
  },
  lowLight: {
    title: "Protect a low-light performance",
    regionLabel: "Low-light Capstone Challenge",
    intention: "Hold the performer with usable exposure; limit noise where the tradeoff allows.",
    hint: "Protect a motion-safe shutter first, open the aperture where possible, then raise ISO only as far as needed.",
    defaults: { aperture: 1.8, shutter: 250, iso: 800 },
    controls: { aperture: [1.8, 2.8, 4, 5.6], shutter: [125, 250, 500], iso: [800, 1600, 3200, 6400, 12800] },
  },
} as const satisfies Record<CapstonePath, { title: string; regionLabel: string; intention: string; hint: string; defaults: ExposureSettings; controls: { aperture: readonly number[]; shutter: readonly number[]; iso: readonly number[] } }>;
