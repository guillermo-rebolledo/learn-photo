import { meteringChallenges, meteringScenes } from "./curriculum";
import type { CriterionFeedback, CriterionStatus, ExposureSettings } from "./exposure-model";

export type MeteringSceneId = keyof typeof meteringScenes;

export type LuminanceHistogram = {
  bins: number[];
  pixelCount: number;
  shadowClipping: boolean;
  highlightClipping: boolean;
  shadowClippedRatio: number;
  highlightClippedRatio: number;
};

export type MeteringAttemptEvaluation = {
  complete: boolean;
  criteria: Record<string, CriterionFeedback>;
};

export function meterOffsetStops(settings: ExposureSettings, reference: ExposureSettings) {
  const stops = Math.log2(
    (settings.iso / reference.iso)
    * (reference.shutter / settings.shutter)
    * ((reference.aperture / settings.aperture) ** 2),
  );
  return Math.round(stops * 100) / 100;
}

export function renderExposurePixels(pixels: Uint8ClampedArray, exposureStops: number) {
  const rendered = new Uint8ClampedArray(pixels.length);
  const multiplier = 2 ** exposureStops;
  for (let index = 0; index + 3 < pixels.length; index += 4) {
    rendered[index] = Math.min(255, Math.round(pixels[index] * multiplier));
    rendered[index + 1] = Math.min(255, Math.round(pixels[index + 1] * multiplier));
    rendered[index + 2] = Math.min(255, Math.round(pixels[index + 2] * multiplier));
    rendered[index + 3] = pixels[index + 3];
  }
  return rendered;
}

export function buildLuminanceHistogram(pixels: Uint8ClampedArray, exposureStops: number, binCount = 24): LuminanceHistogram {
  const bins = Array.from({ length: binCount }, () => 0);
  const rendered = renderExposurePixels(pixels, exposureStops);
  let pixelCount = 0;
  let shadowClippedPixels = 0;
  let highlightClippedPixels = 0;

  for (let index = 0; index + 3 < rendered.length; index += 4) {
    if (rendered[index + 3] === 0) continue;
    const luminance = Math.round((0.2126 * rendered[index]) + (0.7152 * rendered[index + 1]) + (0.0722 * rendered[index + 2]));
    const bin = Math.min(binCount - 1, Math.floor((luminance / 256) * binCount));
    bins[bin] += 1;
    pixelCount += 1;
    if (luminance <= 1) shadowClippedPixels += 1;
    if (luminance >= 254) highlightClippedPixels += 1;
  }

  const shadowClippedRatio = pixelCount === 0 ? 0 : shadowClippedPixels / pixelCount;
  const highlightClippedRatio = pixelCount === 0 ? 0 : highlightClippedPixels / pixelCount;
  return {
    bins,
    pixelCount,
    shadowClipping: shadowClippedPixels > 0,
    highlightClipping: highlightClippedPixels > 0,
    shadowClippedRatio,
    highlightClippedRatio,
  };
}

export function calibratedFallbackHistogram(sceneId: MeteringSceneId, meterOffset: number) {
  const scene = meteringScenes[sceneId];
  const pixels = new Uint8ClampedArray(scene.calibration.fallbackLuminances.flatMap((value) => [value, value, value, 255]));
  return buildLuminanceHistogram(pixels, meterOffset - scene.calibration.sourceRenderingOffset);
}

export function summarizeHistogram(histogram: LuminanceHistogram) {
  const weightedTotal = histogram.bins.reduce((total, count, index) => total + (count * (index + 0.5)), 0);
  const center = histogram.pixelCount === 0 ? 0.5 : weightedTotal / histogram.pixelCount / histogram.bins.length;
  const distribution = center < 0.38
    ? "Most tones sit toward the darker left side."
    : center > 0.62
      ? "Most tones sit toward the brighter right side."
      : "Tones are distributed mainly through the middle."
  const clipping = histogram.shadowClipping && histogram.highlightClipping
    ? "There is both shadow and highlight Clipping."
    : histogram.shadowClipping
      ? "There is shadow Clipping at the darkest limit."
      : histogram.highlightClipping
        ? "There is highlight Clipping at the brightest limit."
        : "No shadow or highlight Clipping is detected."
  return `${distribution} ${clipping}`;
}

function tonalStatus(sceneId: MeteringSceneId, offset: number): CriterionStatus {
  const target = meteringScenes[sceneId].calibration.intendedOffset;
  if (offset >= target.achievedFrom && offset <= target.achievedThrough) return "Achieved";
  if (offset >= target.closeFrom && offset <= target.closeThrough) return "Close";
  return "Missed";
}

function feedbackFor(status: CriterionStatus, feedback: { achieved: string; close: string; missed: string }): CriterionFeedback {
  return { status, explanation: feedback[status.toLowerCase() as "achieved" | "close" | "missed"] };
}

export function evaluateMeteringAttempt(sceneId: MeteringSceneId, settings: ExposureSettings, suppliedHistogram?: LuminanceHistogram): MeteringAttemptEvaluation {
  const scene = meteringScenes[sceneId];
  const challenge = meteringChallenges[sceneId];
  const offset = meterOffsetStops(settings, scene.meterReference);
  const histogram = suppliedHistogram ?? calibratedFallbackHistogram(sceneId, offset);
  const tones = feedbackFor(tonalStatus(sceneId, offset), challenge.successCriteria[0].feedback);

  if (sceneId === "bright-snow") {
    const detailCalibration = meteringScenes[sceneId].calibration.detail;
    const detailStatus: CriterionStatus = histogram.highlightClippedRatio <= detailCalibration.achievedHighlightClippingThrough
      ? "Achieved"
      : histogram.highlightClippedRatio <= detailCalibration.closeHighlightClippingThrough ? "Close" : "Missed";
    const criteria = {
      tones,
      detail: feedbackFor(detailStatus, meteringChallenges[sceneId].successCriteria[1].feedback),
    };
    return { complete: Object.values(criteria).every(({ status }) => status === "Achieved"), criteria };
  }

  const detailCalibration = meteringScenes[sceneId].calibration.detail;
  const detailStatus: CriterionStatus = histogram.highlightClippedRatio <= detailCalibration.achievedHighlightClippingThrough
    && histogram.shadowClippedRatio <= detailCalibration.achievedShadowClippingThrough
    ? "Achieved"
    : histogram.highlightClippedRatio <= detailCalibration.closeHighlightClippingThrough
      && histogram.shadowClippedRatio <= detailCalibration.closeShadowClippingThrough ? "Close" : "Missed";
  const criteria = {
    tones,
    detail: feedbackFor(detailStatus, meteringChallenges[sceneId].successCriteria[1].feedback),
  };
  return { complete: Object.values(criteria).every(({ status }) => status === "Achieved"), criteria };
}
