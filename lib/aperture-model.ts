import type { CriterionFeedback, ExposureSettings } from "./exposure-model";
import { lessonThreeChallenge, windowLightPortraitScene } from "./curriculum";

export type PortraitIntention = "soft-background" | "defined-background";

const reference: ExposureSettings = { aperture: 5.6, shutter: 60, iso: 400 };

export function apertureCapturedLightStops(aperture: number, referenceAperture = reference.aperture) {
  return Math.round((2 * Math.log2(referenceAperture / aperture)) * 100) / 100;
}

export function portraitDepth(aperture: number) {
  const calibration = windowLightPortraitScene.calibration;
  if (aperture <= calibration.shallowThrough) return { band: "shallow" as const, blurRadius: calibration.blurRadius.shallow, description: "The subject stays defined while the background is strongly softened." };
  if (aperture >= calibration.deepFrom) return { band: "deep" as const, blurRadius: calibration.blurRadius.deep, description: "The Source Photograph’s available background detail is preserved behind the subject." };
  return { band: "moderate" as const, blurRadius: calibration.blurRadius.moderate, description: "The subject is distinct and the room keeps moderate definition." };
}

function status(distance: number): CriterionFeedback["status"] {
  if (distance <= 0.38) return "Achieved";
  if (distance <= 1.05) return "Close";
  return "Missed";
}

export function portraitExposureStops(settings: ExposureSettings) {
  return Math.round(Math.log2((settings.iso / reference.iso) * (reference.shutter / settings.shutter) * ((reference.aperture / settings.aperture) ** 2)) * 100) / 100;
}

export function evaluatePortraitAttempt(settings: ExposureSettings, intention: PortraitIntention) {
  const exposureDifference = portraitExposureStops(settings);
  const intentionExposure = lessonThreeChallenge.photographicIntentions[intention].targetExposureStops;
  const exposureStatus = status(Math.abs(exposureDifference - intentionExposure));
  const depth = portraitDepth(settings.aperture);
  const depthStatus: CriterionFeedback["status"] = intention === "soft-background"
    ? depth.band === "shallow" ? "Achieved" : depth.band === "moderate" ? "Close" : "Missed"
    : depth.band === "deep" ? "Achieved" : depth.band === "moderate" ? "Close" : "Missed";
  return {
    exposure: { status: exposureStatus, explanation: exposureStatus === "Achieved" ? "The portrait has usable exposure for this intention." : exposureDifference < 0 ? "The portrait is darker than intended." : "The portrait is brighter than intended." } satisfies CriterionFeedback,
    depth: { status: depthStatus, explanation: depthStatus === "Achieved" ? "The relative depth of field supports the portrait intention." : intention === "soft-background" ? "Use a wider aperture to soften the background more." : "Use a narrower aperture to keep more background definition." } satisfies CriterionFeedback,
  };
}
