import { expect, test } from "@playwright/test";
import {
  buildLuminanceHistogram,
  evaluateMeteringAttempt,
  meterOffsetStops,
  summarizeHistogram,
} from "../lib/metering-model";
import { brightSnowScene, darkStageScene } from "../lib/curriculum";

test("meter offsets are calculated from each Curated Scene's Meter Reference", () => {
  expect(meterOffsetStops(brightSnowScene.meterReference, brightSnowScene.meterReference)).toBe(0);
  expect(meterOffsetStops({ aperture: 8, shutter: 125, iso: 100 }, brightSnowScene.meterReference)).toBe(1);
  expect(meterOffsetStops({ aperture: 8, shutter: 250, iso: 200 }, brightSnowScene.meterReference)).toBe(1);
  expect(meterOffsetStops({ aperture: 2.8, shutter: 250, iso: 1600 }, darkStageScene.meterReference)).toBe(-1);
  expect(meterOffsetStops({ aperture: 2.8, shutter: 125, iso: 800 }, darkStageScene.meterReference)).toBe(-1);
});

test("luminance Histogram summaries describe distribution and exact clipping boundaries", () => {
  const histogram = buildLuminanceHistogram(new Uint8ClampedArray([
    1, 1, 1, 255,
    128, 128, 128, 255,
    254, 254, 254, 255,
  ]), 0, 16);

  expect(histogram.bins).toHaveLength(16);
  expect(histogram.shadowClipping).toBe(true);
  expect(histogram.highlightClipping).toBe(true);
  expect(summarizeHistogram(histogram)).toContain("both shadow and highlight Clipping");

  const insideLimits = buildLuminanceHistogram(new Uint8ClampedArray([
    2, 2, 2, 255,
    253, 253, 253, 255,
  ]), 0, 16);
  expect(insideLimits).toMatchObject({ shadowClipping: false, highlightClipping: false });
});

test("the Histogram remains luminance-only instead of exposing RGB channels", () => {
  const histogram = buildLuminanceHistogram(new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255,
  ]), 0, 16);

  expect(histogram.bins.reduce((total, count) => total + count, 0)).toBe(3);
  expect(histogram).not.toHaveProperty("red");
  expect(histogram).not.toHaveProperty("green");
  expect(histogram).not.toHaveProperty("blue");
});

test("evaluation follows each Photographic Intention and accepts multiple settings combinations", () => {
  for (const settings of [
    { aperture: 8, shutter: 125, iso: 100 },
    { aperture: 5.6, shutter: 250, iso: 100 },
    { aperture: 4, shutter: 500, iso: 100 },
  ]) expect(evaluateMeteringAttempt("bright-snow", settings)).toMatchObject({ complete: true, criteria: { tones: { status: "Achieved" }, detail: { status: "Achieved" } } });

  for (const settings of [
    { aperture: 2.8, shutter: 250, iso: 1600 },
    { aperture: 2, shutter: 500, iso: 1600 },
    { aperture: 4, shutter: 125, iso: 1600 },
  ]) expect(evaluateMeteringAttempt("dark-stage", settings)).toMatchObject({ complete: true, criteria: { tones: { status: "Achieved" }, detail: { status: "Achieved" } } });

  expect(evaluateMeteringAttempt("bright-snow", brightSnowScene.meterReference)).toMatchObject({ complete: false, criteria: { tones: { status: "Missed" } } });
  expect(evaluateMeteringAttempt("dark-stage", darkStageScene.meterReference)).toMatchObject({ complete: false, criteria: { tones: { status: "Missed" } } });
  const clippedResult = buildLuminanceHistogram(new Uint8ClampedArray([255, 255, 255, 255]), 0);
  expect(evaluateMeteringAttempt("bright-snow", { aperture: 8, shutter: 125, iso: 100 }, clippedResult)).toMatchObject({ complete: false, criteria: { tones: { status: "Achieved" }, detail: { status: "Missed" } } });
});

test("guided Meter Reference and Histogram stay synchronized with the Rendered Result", async ({ page }) => {
  await page.goto("/lessons/meter-and-histogram");
  await expect(page.getByRole("heading", { name: "Read the image, not a rule" })).toBeVisible();
  const result = page.getByTestId("metering-rendered-result").first();
  await expect(result).toHaveAttribute("data-meter-offset", "0");
  await expect(page.getByTestId("luminance-histogram").first()).toHaveAttribute("aria-label", /luminance Histogram/i);
  await expect(page.getByTestId("histogram-summary").first()).not.toBeEmpty();

  await page.getByLabel("Guided shutter speed").selectOption("125");
  await expect(result).toHaveAttribute("data-meter-offset", "1");
  await expect.poll(async () => Number(await page.getByTestId("luminance-histogram").first().getAttribute("data-pixel-count"))).toBeGreaterThan(1000);
  await expect(page.getByText(/Meter Reference: \+1 Stop/).first()).toBeVisible();

  await page.getByLabel("Guided metering scene").selectOption("dark-stage");
  await expect(page.getByText(/Dark Stage/).first()).toBeVisible();
  await expect(result).toHaveAttribute("data-meter-offset", "0");
});

test("Bright Snow and Dark Stage Challenges reward deliberate departures from meter zero", async ({ page }) => {
  await page.goto("/lessons/meter-and-histogram");
  await page.getByRole("button", { name: "Take Bright Snow photo" }).click();
  await expect(page.getByTestId("shutter-curtain").first()).toBeVisible();
  await expect(page.getByText("Criterion Status")).toHaveCount(0);
  await expect(page.getByRole("article").filter({ hasText: "Bright Snow tonal rendering" })).toContainText("Missed");
  await page.getByLabel("Bright Snow shutter speed").selectOption("125");
  await page.getByRole("button", { name: "Take Bright Snow photo" }).click();
  await expect(page.getByRole("article").filter({ hasText: "Bright Snow tonal rendering" })).toContainText("Achieved");
  await expect(page.getByRole("article").filter({ hasText: "Snow highlight detail" })).toContainText("Achieved");

  await page.getByRole("button", { name: "Take Dark Stage photo" }).click();
  await expect(page.getByRole("article").filter({ hasText: "Dark Stage tonal rendering" })).toContainText("Missed");
  await page.getByLabel("Dark Stage shutter speed").selectOption("250");
  await page.getByRole("button", { name: "Take Dark Stage photo" }).click();
  await expect(page.getByRole("article").filter({ hasText: "Dark Stage tonal rendering" })).toContainText("Achieved");
  await expect(page.getByRole("article").filter({ hasText: "Performer and stage detail" })).toContainText("Achieved");
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toHaveCount(2);
});

test("metering controls and nonvisual Histogram evidence remain accessible", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(CSS, "supports", { configurable: true, value: () => false }));
  await page.goto("/lessons/meter-and-histogram");
  const control = page.getByLabel("Guided shutter speed");
  await control.focus();
  await expect(control).toBeFocused();
  await expect(control).toHaveCSS("min-height", "44px");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("histogram-summary").first()).not.toBeEmpty();
  await expect(page.getByText(/visual canvas rendering is unavailable/i).first()).toBeVisible();
});

test("representative highlight and shadow states remain readable in both themes", async ({ page }) => {
  await page.goto("/lessons/meter-and-histogram");
  await page.getByLabel("Guided shutter speed").selectOption("60");
  await expect(page.getByText(/highlight Clipping/i).first()).toBeVisible();
  await page.getByLabel("Guided metering scene").selectOption("dark-stage");
  await page.getByLabel("Guided shutter speed").selectOption("500");
  await expect(page.getByText(/shadow Clipping/i).first()).toBeVisible();
  await page.getByRole("switch", { name: /dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("luminance-histogram").first()).toBeVisible();
});
