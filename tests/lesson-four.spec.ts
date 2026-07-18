import { expect, test } from "@playwright/test";
import { evaluateCyclistAttempt, shutterCapturedLightStops, cyclistMotion } from "../lib/shutter-model";
import { movingCyclistScene } from "../lib/curriculum";

test("shutter calculations express captured light and scene-calibrated motion boundaries", () => {
  expect(shutterCapturedLightStops(500, 125)).toBe(-2);
  expect(shutterCapturedLightStops(30, 125)).toBe(2.06);
  expect(cyclistMotion(1000)).toMatchObject({ band: "frozen", offset: 0 });
  expect(cyclistMotion(500)).toMatchObject({ band: "frozen" });
  expect(cyclistMotion(499)).toMatchObject({ band: "trace" });
  expect(cyclistMotion(125)).toMatchObject({ band: "trace" });
  expect(cyclistMotion(61)).toMatchObject({ band: "trace" });
  expect(cyclistMotion(60)).toMatchObject({ band: "flowing" });
  expect(cyclistMotion(30)).toMatchObject({ band: "flowing" });

  expect(evaluateCyclistAttempt({ aperture: 4, shutter: 500, iso: 800 }, "freeze")).toMatchObject({
    exposure: { status: "Achieved" }, motion: { status: "Achieved" },
  });
  expect(evaluateCyclistAttempt({ aperture: 8, shutter: 30, iso: 200 }, "express-motion")).toMatchObject({
    exposure: { status: "Achieved" }, motion: { status: "Achieved" },
  });
  expect(evaluateCyclistAttempt({ aperture: 8, shutter: 1000, iso: 1600 }, "freeze").exposure.explanation).toContain("Widen aperture");
  expect(evaluateCyclistAttempt({ aperture: 4, shutter: 4000, iso: 1600 }, "freeze").exposure.explanation).toContain("slower shutter");
  expect(evaluateCyclistAttempt({ aperture: 4, shutter: 30, iso: 100 }, "express-motion").exposure.explanation).toContain("Narrow aperture");
  expect(evaluateCyclistAttempt({ aperture: 11, shutter: 4, iso: 100 }, "express-motion").exposure.explanation).toContain("faster shutter");
  expect(evaluateCyclistAttempt({ aperture: 5.6, shutter: 125, iso: 400 }, "freeze").motion.explanation).toContain(`1/${movingCyclistScene.calibration.motion.frozenFrom}s`);
});

test("learner changes shutter speed and receives synchronized directional motion text", async ({ page }) => {
  await page.goto("/lessons/shutter-speed-and-motion");
  await expect(page.getByRole("heading", { name: "Shutter speed shapes time" })).toBeVisible();
  const preview = page.getByRole("region", { name: "Hold a moment or let it travel" }).getByTestId("cyclist-rendered-result");
  await expect(preview).toHaveAttribute("data-motion-band", "trace");
  await expect(preview.getByTestId("cyclist-motion-echo")).toHaveCount(1);
  await page.getByLabel("Guided shutter speed", { exact: true }).selectOption("30");
  await expect(preview).toHaveAttribute("data-motion-band", "flowing");
  await expect(preview.getByTestId("cyclist-motion-echo")).toHaveCount(3);
  await expect(page.getByText(/directional trail follows the cyclist/i).first()).toBeVisible();
  await page.getByText("Why this varies in real life").click();
  await expect(page.getByText(/panning direction/i)).toBeVisible();
});

test("separate cyclist Challenges independently grade usable exposure and motion with multiple solutions", async ({ page }) => {
  await page.goto("/lessons/shutter-speed-and-motion");
  await page.getByLabel("Cyclist Challenge").selectOption("freeze");
  await page.getByLabel("Challenge shutter speed").selectOption("500");
  await page.getByLabel("Challenge aperture").selectOption("4");
  await page.getByLabel("Challenge ISO").selectOption("800");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Usable exposure" })).toContainText("Achieved");
  await expect(page.getByRole("article").filter({ hasText: "Intended motion rendering" })).toContainText("Achieved");

  await page.getByLabel("Cyclist Challenge").selectOption("express-motion");
  await page.getByLabel("Challenge shutter speed").selectOption("30");
  await page.getByLabel("Challenge aperture").selectOption("8");
  await page.getByLabel("Challenge ISO").selectOption("200");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
});

test("cyclist shutter control operates from the keyboard", async ({ page }) => {
  await page.goto("/lessons/shutter-speed-and-motion");
  const faster = page.getByRole("button", { name: "Choose a faster guided shutter speed" });
  await faster.focus();
  await expect(faster).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Guided shutter speed", { exact: true })).toHaveValue("250");
  await expect(page.getByTestId("cyclist-rendered-result").first()).toHaveAttribute("data-motion-band", "trace");
});

test("cyclist controls preserve touch sizing and textual fallback", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(CSS, "supports", { configurable: true, value: () => false }));
  await page.goto("/lessons/shutter-speed-and-motion");
  const shutter = page.getByLabel("Guided shutter speed", { exact: true });
  await shutter.selectOption("30");
  await expect(shutter).toHaveCSS("min-height", "44px");
  await expect(page.getByText(/visual motion effect is unavailable/i).first()).toBeVisible();
  await page.getByRole("button", { name: "Take photo" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Criterion Status")).toBeVisible();
});

test("capture retains the immediately previous Attempt and provides Tradeoff Feedback", async ({ page }) => {
  await page.goto("/lessons/shutter-speed-and-motion");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByTestId("shutter-curtain")).toBeVisible();
  await expect(page.getByText(/choose 1\/500s or faster/i)).toBeVisible();
  await page.getByLabel("Challenge shutter speed").selectOption("500");
  await page.getByRole("button", { name: "Take photo" }).click();
  await page.getByRole("button", { name: "Compare with previous Attempt" }).click();
  await expect(page.getByText(/Previous Attempt: f\/5.6 · 1\/125s · ISO 400/)).toBeVisible();
  await expect(page.getByText(/Tradeoff Feedback:/)).toBeVisible();
});

test("lesson remains usable when browser-local Progress cannot be written", async ({ page }) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (value.includes("lessonFourSettings")) {
        (window as Window & { __quotaExceededTriggered?: boolean }).__quotaExceededTriggered = true;
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }
      return setItem.call(this, key, value);
    };
  });
  await page.goto("/lessons/shutter-speed-and-motion");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByText("Criterion Status")).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __quotaExceededTriggered?: boolean }).__quotaExceededTriggered)).toBe(true);
  await page.getByLabel("Challenge shutter speed").selectOption("500");
  await expect(page.getByLabel("Challenge shutter speed")).toHaveValue("500");
});
