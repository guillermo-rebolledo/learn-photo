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
  expect(cameraScale.aperture).toHaveLength(25);
  expect(cameraScale.aperture.at(0)).toBe(1.4);
  expect(cameraScale.aperture.at(-1)).toBe(22);
  expect(cameraScale.shutter.at(0)).toBe(4000);
  expect(cameraScale.shutter.at(-1)).toBe(0.033);
  expect(cameraScale.iso.at(0)).toBe(100);
  expect(cameraScale.iso.at(-1)).toBe(12800);
});

test("multiple settings combinations preserve equivalent rendered brightness", () => {
  const reference = { aperture: 4, shutter: 125, iso: 400 };

  expect(equivalentExposureStops(reference, { aperture: 5.6, shutter: 60, iso: 400 })).toBeCloseTo(0, 0);
  expect(equivalentExposureStops(reference, { aperture: 4, shutter: 250, iso: 800 })).toBeCloseTo(0, 5);
  expect(equivalentExposureStops(reference, { aperture: 8, shutter: 125, iso: 400 })).toBeCloseTo(-2, 1);
});
