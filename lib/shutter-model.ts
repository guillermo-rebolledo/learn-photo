import type { CriterionFeedback, ExposureSettings } from "./exposure-model";
import { lessonFourChallenges, lessonFourControls, movingCyclistScene } from "./curriculum";

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

function exposureAdjustment(settings: ExposureSettings, stops: number) {
  const widestAperture = lessonFourControls.aperture[0];
  const narrowestAperture = lessonFourControls.aperture[lessonFourControls.aperture.length - 1];
  const lowestIso = lessonFourControls.iso[0];
  const highestIso = lessonFourControls.iso[lessonFourControls.iso.length - 1];

  if (stops < 0) {
    if (settings.iso < highestIso) return "Raise ISO to restore Rendered Brightness without changing the current motion rendering.";
    if (settings.aperture > widestAperture) return "Widen aperture to restore Rendered Brightness without changing the current motion rendering.";
    return "Choose a slower shutter to add Captured Light, knowing it will also increase visible travel.";
  }
  if (settings.iso > lowestIso) return "Lower ISO to restore Rendered Brightness without changing the current motion rendering.";
  if (settings.aperture < narrowestAperture) return "Narrow aperture to restore Rendered Brightness without changing the current motion rendering.";
  return "Choose a faster shutter to reduce Captured Light, knowing it will also reduce visible travel.";
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
    exposure: { status: exposure, explanation: exposure === "Achieved"
      ? challenge.successCriteria[0].feedback.achieved
      : `The result is ${stops < 0 ? "darker" : "brighter"} than this Curated Scene’s usable range. ${exposureAdjustment(settings, stops)}` } satisfies CriterionFeedback,
    motion: { status: motionStatus, explanation: motionStatus === "Achieved"
      ? challenge.successCriteria[1].feedback.achieved
      : intention === "freeze"
        ? `The cyclist retains directional travel, so the moment is not fully held. Choose 1/${movingCyclistScene.calibration.motion.frozenFrom}s or faster, then widen aperture or raise ISO to replace the lost Captured Light.`
        : `The cyclist’s directional travel is too slight for the intended expression. Choose 1/${movingCyclistScene.calibration.motion.flowingThrough}s or slower, then narrow aperture or lower ISO to balance the added Captured Light.` } satisfies CriterionFeedback,
  };
}
