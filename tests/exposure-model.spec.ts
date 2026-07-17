import { expect, test } from "@playwright/test";
import { evaluateAttempt, renderExposure } from "../lib/exposure-model";

test("identical exposure choices produce an identical Rendered Result", () => {
  const settings = { aperture: 5.6, shutter: 60, iso: 400 } as const;

  expect(renderExposure(settings)).toEqual(renderExposure(settings));
  expect(renderExposure(settings)).toEqual({
    exposureStops: 0,
    baseBrightness: 1,
    highlightOpacity: 0,
    description: "The still life is rendered near the scene's Meter Reference.",
  });
});

test("evaluation reports Achieved, Close, and Missed at calibrated boundaries", () => {
  expect(evaluateAttempt({ aperture: 5.6, shutter: 60, iso: 400 }).exposure.status).toBe("Achieved");
  expect(evaluateAttempt({ aperture: 5.6, shutter: 125, iso: 400 }).exposure.status).toBe("Close");
  expect(evaluateAttempt({ aperture: 5.6, shutter: 250, iso: 400 }).exposure.status).toBe("Missed");
});
