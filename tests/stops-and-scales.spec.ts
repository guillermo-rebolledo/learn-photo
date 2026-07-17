import { expect, test } from "@playwright/test";
import {
  beginnerScale,
  cameraScale,
  equivalentExposureStops,
} from "../lib/exposure-scales";

test("Beginner and Camera Scales cover the agreed control envelope", () => {
  expect(beginnerScale).toEqual({
    aperture: [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22],
    shutter: [4000, 2000, 1000, 500, 250, 125, 60, 30, 15, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.067, 0.033],
    iso: [100, 200, 400, 800, 1600, 3200, 6400, 12800],
  });
  expect(cameraScale).toEqual({
    aperture: [1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22],
    shutter: [4000, 3200, 2500, 2000, 1600, 1250, 1000, 800, 640, 500, 400, 320, 250, 200, 160, 125, 100, 80, 60, 50, 40, 30, 25, 20, 15, 13, 10, 8, 6, 5, 4, 3, 2.5, 2, 1.6, 1.3, 1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.167, 0.125, 0.1, 0.077, 0.067, 0.05, 0.04, 0.033],
    iso: [100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800],
  });
});

test("multiple settings combinations preserve equivalent rendered brightness", () => {
  const reference = { aperture: 4, shutter: 125, iso: 400 };

  expect(equivalentExposureStops(reference, { aperture: 5.6, shutter: 60, iso: 400 })).toBeCloseTo(0, 0);
  expect(equivalentExposureStops(reference, { aperture: 4, shutter: 250, iso: 800 })).toBeCloseTo(0, 5);
  expect(equivalentExposureStops(reference, { aperture: 8, shutter: 125, iso: 400 })).toBeCloseTo(-2, 1);
});
