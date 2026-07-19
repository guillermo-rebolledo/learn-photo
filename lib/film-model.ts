import type { CriterionFeedback, ExposureSettings } from "./exposure-model";
import { filmConstraintChallenges } from "./curriculum";

export type FilmIntention = "depth" | "motion";

function statusForDistance(distance: number): CriterionFeedback["status"] {
  return distance <= 0.12 ? "Achieved" : distance <= 1.05 ? "Close" : "Missed";
}

export function filmExposureStops(settings: ExposureSettings, intention: FilmIntention = "depth") {
  const reference = filmConstraintChallenges[intention].meterReference;
  return Math.round(Math.log2((reference.shutter / settings.shutter) * ((reference.aperture / settings.aperture) ** 2)) * 100) / 100;
}

export function evaluateFilmConstraint(settings: ExposureSettings, intention: FilmIntention) {
  const challenge = filmConstraintChallenges[intention];
  const distance = filmExposureStops(settings, intention);
  const exposureStatus = statusForDistance(Math.abs(distance));
  const intentionStatus: CriterionFeedback["status"] = intention === "depth"
    ? settings.aperture >= 4 ? "Achieved" : settings.aperture >= 2.8 ? "Close" : "Missed"
    : settings.shutter >= 250 ? "Achieved" : settings.shutter >= 125 ? "Close" : "Missed";
  const speedStatus: CriterionFeedback["status"] = settings.iso === challenge.rollIso ? "Achieved" : "Missed";
  const [exposureCriterion, intentionCriterion, speedCriterion] = challenge.successCriteria;

  return {
    exposure: { status: exposureStatus, explanation: exposureCriterion.feedback[exposureStatus.toLowerCase() as "achieved" | "close" | "missed"] },
    intention: { status: intentionStatus, explanation: intentionCriterion.feedback[intentionStatus.toLowerCase() as "achieved" | "close" | "missed"] },
    filmSpeed: { status: speedStatus, explanation: speedCriterion.feedback[speedStatus.toLowerCase() as "achieved" | "missed"] },
  } satisfies Record<string, CriterionFeedback>;
}
