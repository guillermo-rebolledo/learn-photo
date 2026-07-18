import type { CriterionFeedback, ExposureSettings } from "./exposure-model";
import { lessonFourChallenges, movingCyclistScene } from "./curriculum";

export type CyclistIntention = "freeze" | "express-motion";

const reference = movingCyclistScene.meterReference;

export function shutterCapturedLightStops(shutter: number, referenceShutter = reference.shutter) {
  return Math.round(Math.log2(referenceShutter / shutter) * 100) / 100;
}

export function cyclistExposureStops(settings: ExposureSettings) {
  return Math.round(Math.log2((settings.iso / reference.iso) * (reference.shutter / settings.shutter) * ((reference.aperture / settings.aperture) ** 2)) * 100) / 100;
}

export function cyclistMotion(shutter: number) {
  const { frozenFrom, flowingThrough, offsets } = movingCyclistScene.calibration.motion;
  if (shutter >= frozenFrom) return { band: "frozen" as const, offset: offsets.frozen, description: "The cyclist is held with little simulated directional travel." };
  if (shutter <= flowingThrough) return { band: "flowing" as const, offset: offsets.flowing, description: "A pronounced directional trail follows the cyclist’s travel." };
  return { band: "trace" as const, offset: offsets.trace, description: "A short directional trace suggests movement while the cyclist remains recognizable." };
}

function exposureStatus(distance: number): CriterionFeedback["status"] {
  if (distance <= movingCyclistScene.calibration.exposure.achievedWithinStops) return "Achieved";
  if (distance <= movingCyclistScene.calibration.exposure.closeWithinStops) return "Close";
  return "Missed";
}

export function evaluateCyclistAttempt(settings: ExposureSettings, intention: CyclistIntention) {
  const stops = cyclistExposureStops(settings);
  const exposure = exposureStatus(Math.abs(stops));
  const motion = cyclistMotion(settings.shutter);
  const motionStatus: CriterionFeedback["status"] = intention === "freeze"
    ? motion.band === "frozen" ? "Achieved" : motion.band === "trace" ? "Close" : "Missed"
    : motion.band === "flowing" ? "Achieved" : motion.band === "trace" ? "Close" : "Missed";
  const challenge = lessonFourChallenges[intention];

  return {
    exposure: { status: exposure, explanation: exposure === "Achieved" ? challenge.successCriteria[0].feedback.achieved : stops < 0 ? "The result is darker than this Curated Scene’s usable range." : "The result is brighter than this Curated Scene’s usable range." } satisfies CriterionFeedback,
    motion: { status: motionStatus, explanation: challenge.successCriteria[1].feedback[motionStatus.toLowerCase() as "achieved" | "close" | "missed"] } satisfies CriterionFeedback,
  };
}
