import { lessonOneCriteria, neutralStillLifeScene } from "./curriculum";

export type ExposureSettings = {
  aperture: number;
  shutter: number;
  iso: number;
};

export type CriterionStatus = "Achieved" | "Close" | "Missed";

export type CriterionFeedback = {
  status: CriterionStatus;
  explanation: string;
};

const reference: ExposureSettings = neutralStillLifeScene.meterReference;

export function exposureStops(settings: ExposureSettings): number {
  return Math.log2((settings.iso / reference.iso) * (reference.shutter / settings.shutter) * ((reference.aperture / settings.aperture) ** 2));
}

export function renderExposure(settings: ExposureSettings) {
  const stops = exposureStops(settings);
  const roundedStops = Math.round(stops * 100) / 100;
  const description = Math.abs(stops) < neutralStillLifeScene.calibration.achievedWithinStops
    ? "The still life is rendered near the scene's Meter Reference."
    : stops < 0
      ? `The still life is rendered ${Math.abs(roundedStops)} ${Math.abs(roundedStops) === 1 ? "stop" : "stops"} darker than the Meter Reference.`
      : `The still life is rendered ${roundedStops} ${roundedStops === 1 ? "stop" : "stops"} brighter than the Meter Reference.`;

  const rendering = neutralStillLifeScene.calibration.rendering;
  return {
    exposureStops: roundedStops,
    baseBrightness: Math.max(rendering.minBrightness, Math.min(rendering.maxBrightness, 2 ** stops)),
    highlightOpacity: Math.max(0, Math.min(rendering.maxHighlightOpacity, stops * rendering.highlightOpacityPerStop)),
    description,
  };
}

function statusForDistance(distance: number): CriterionStatus {
  if (distance <= neutralStillLifeScene.calibration.achievedWithinStops) return "Achieved";
  if (distance <= neutralStillLifeScene.calibration.closeWithinStops) return "Close";
  return "Missed";
}

export function evaluateAttempt(settings: ExposureSettings) {
  const stops = exposureStops(settings);
  const exposureStatus = statusForDistance(Math.abs(stops));
  const highlightStatus: CriterionStatus = stops <= lessonOneCriteria.highlightDetail.achievedLimitStops ? "Achieved" : stops <= neutralStillLifeScene.calibration.closeWithinStops ? "Close" : "Missed";

  return {
    exposure: {
      status: exposureStatus,
      explanation: exposureStatus === "Achieved"
        ? lessonOneCriteria.usableExposure.feedback.achieved
        : stops < 0
          ? lessonOneCriteria.usableExposure.feedback.darker
          : lessonOneCriteria.usableExposure.feedback.brighter,
    } satisfies CriterionFeedback,
    highlights: {
      status: highlightStatus,
      explanation: highlightStatus === "Achieved"
        ? lessonOneCriteria.highlightDetail.feedback.achieved
        : lessonOneCriteria.highlightDetail.feedback.compromised,
    } satisfies CriterionFeedback,
  };
}
