import { evaluatePortraitAttempt } from "./aperture-model";
import { evaluatePerformanceAttempt } from "./iso-model";
import { evaluateCyclistAttempt } from "./shutter-model";
import type { CriterionFeedback, ExposureSettings } from "./exposure-model";

export type CapstonePath = "motion" | "depth" | "lowLight";

/** Canonical Challenge identifiers for the three Capstone parts, shared by browser-local Progress and analytics. */
export const capstoneChallengeIds = {
  motion: "capstone-motion",
  depth: "capstone-depth",
  lowLight: "capstone-low-light",
} as const satisfies Record<CapstonePath, string>;

export type CapstoneResult = {
  criteria: readonly { id: string; label: string; essential: boolean; result: CriterionFeedback }[];
  complete: boolean;
  tradeoff: string;
};

function result(criteria: CapstoneResult["criteria"], tradeoff: string): CapstoneResult {
  return { criteria, complete: criteria.every(({ essential, result }) => !essential || result.status === "Achieved"), tradeoff };
}

export function evaluateCapstone(path: CapstonePath, settings: ExposureSettings): CapstoneResult {
  if (path === "motion") {
    const evaluated = evaluateCyclistAttempt(settings, "freeze");
    return result([
      { id: "usable-exposure", label: "Usable exposure", essential: true, result: evaluated.exposure },
      { id: "intended-motion", label: "Intended motion", essential: true, result: evaluated.motion },
    ], evaluated.motion.status !== "Achieved" ? evaluated.motion.explanation : settings.iso > 800 ? "The fast shutter freezes travel, while the higher ISO replaces Rendered Brightness with a visible image-quality cost." : "The fast shutter freezes travel; the wider aperture replaces its lost Captured Light without requiring as much ISO.");
  }
  if (path === "depth") {
    const evaluated = evaluatePortraitAttempt(settings, "defined-background");
    return result([
      { id: "usable-exposure", label: "Usable exposure", essential: true, result: evaluated.exposure },
      { id: "intended-depth", label: "Intended depth of field", essential: true, result: evaluated.depth },
      { id: "fixed-film-speed", label: "Fixed film speed", essential: true, result: { status: settings.iso === 400 ? "Achieved" : "Missed", explanation: settings.iso === 400 ? "ISO 400 remains fixed across the roll." : "The Film Constraint requires ISO 400 across the roll." } },
    ], evaluated.depth.status !== "Achieved" ? evaluated.depth.explanation : "The narrow aperture preserves depth but records less Captured Light, so the slower shutter restores exposure while ISO 400 remains fixed.");
  }
  const evaluated = evaluatePerformanceAttempt(settings, "freeze");
  return result([
    { id: "usable-exposure", label: "Usable exposure", essential: true, result: evaluated.exposure },
    { id: "intended-motion", label: "Intended motion", essential: true, result: evaluated.motion },
    { id: "image-quality", label: "Image quality", essential: false, result: evaluated.quality },
  ], evaluated.motion.status !== "Achieved" ? evaluated.motion.explanation : evaluated.quality.status === "Achieved" ? "A motion-safe shutter protects the performer; the open aperture limits how far ISO must rise." : "The motion-safe shutter and narrower aperture preserve the intended result, while the higher ISO makes noise the optional compromise.");
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
    controls: { aperture: [2.8, 4, 5.6, 8, 11], shutter: [15, 30, 60, 125, 250], iso: [400] },
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
