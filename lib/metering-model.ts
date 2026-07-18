import { brightSnowScene, darkStageScene } from "./curriculum";
import type { CriterionFeedback, ExposureSettings } from "./exposure-model";

export type LuminanceHistogram = {
  bins: number[];
  pixelCount: number;
  shadowClipping: boolean;
  highlightClipping: boolean;
};

export function meterOffsetStops(settings: ExposureSettings, reference: ExposureSettings) {
  const stops = Math.log2(
    (settings.iso / reference.iso)
    * (reference.shutter / settings.shutter)
    * ((reference.aperture / settings.aperture) ** 2),
  );
  return Math.round(stops * 100) / 100;
}

export function buildLuminanceHistogram(pixels: Uint8ClampedArray, exposureStops: number, binCount = 24): LuminanceHistogram {
  const bins = Array.from({ length: binCount }, () => 0);
  const multiplier = 2 ** exposureStops;
  let pixelCount = 0;
  let shadowClipping = false;
  let highlightClipping = false;

  for (let index = 0; index + 3 < pixels.length; index += 4) {
    if (pixels[index + 3] === 0) continue;
    const red = Math.min(255, Math.round(pixels[index] * multiplier));
    const green = Math.min(255, Math.round(pixels[index + 1] * multiplier));
    const blue = Math.min(255, Math.round(pixels[index + 2] * multiplier));
    const luminance = Math.round((0.2126 * red) + (0.7152 * green) + (0.0722 * blue));
    const bin = Math.min(binCount - 1, Math.floor((luminance / 256) * binCount));
    bins[bin] += 1;
    pixelCount += 1;
    shadowClipping ||= luminance <= 1;
    highlightClipping ||= luminance >= 254;
  }

  return { bins, pixelCount, shadowClipping, highlightClipping };
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

export type MeteringSceneId = typeof brightSnowScene.id | typeof darkStageScene.id;

export function evaluateMeteringAttempt(sceneId: MeteringSceneId, settings: ExposureSettings): CriterionFeedback {
  const scene = sceneId === brightSnowScene.id ? brightSnowScene : darkStageScene;
  const offset = meterOffsetStops(settings, scene.meterReference);
  const target = scene.intendedOffset;
  const status = offset >= target.achievedFrom && offset <= target.achievedThrough
    ? "Achieved"
    : offset >= target.closeFrom && offset <= target.closeThrough
      ? "Close"
      : "Missed";
  const signedOffset = `${offset > 0 ? "+" : ""}${offset}`;

  if (status === "Achieved") return {
    status,
    explanation: sceneId === "bright-snow"
      ? `At ${signedOffset} Stops, the snow remains intentionally bright without treating meter zero as the answer.`
      : `At ${signedOffset} Stops, the stage remains intentionally dark while the lit performer stays prominent.`,
  };

  const direction = sceneId === "bright-snow"
    ? "Add light relative to the Meter Reference so white snow is not rendered neutral gray."
    : "Remove light relative to the Meter Reference so the dark stage is not lifted toward neutral gray.";
  return { status, explanation: `The result sits at ${signedOffset} Stops. ${direction}` };
}
