import { expect, test } from "@playwright/test";
import { evaluateCyclistAttempt, shutterCapturedLightStops, cyclistMotion } from "../lib/shutter-model";

test("shutter calculations express captured light and scene-calibrated motion boundaries", () => {
  expect(shutterCapturedLightStops(500, 125)).toBe(-2);
  expect(shutterCapturedLightStops(30, 125)).toBe(2.06);
  expect(cyclistMotion(1000)).toMatchObject({ band: "frozen", offset: 0 });
  expect(cyclistMotion(125)).toMatchObject({ band: "trace" });
  expect(cyclistMotion(30)).toMatchObject({ band: "flowing" });

  expect(evaluateCyclistAttempt({ aperture: 4, shutter: 500, iso: 800 }, "freeze")).toMatchObject({
    exposure: { status: "Achieved" }, motion: { status: "Achieved" },
  });
  expect(evaluateCyclistAttempt({ aperture: 8, shutter: 30, iso: 200 }, "express-motion")).toMatchObject({
    exposure: { status: "Achieved" }, motion: { status: "Achieved" },
  });
});

test("learner changes shutter speed and receives synchronized directional motion text", async ({ page }) => {
  await page.goto("/lessons/shutter-speed-and-motion");
  await expect(page.getByRole("heading", { name: "Shutter speed shapes time" })).toBeVisible();
  const preview = page.getByRole("region", { name: "Hold a moment or let it travel" }).getByTestId("cyclist-rendered-result");
  await expect(preview).toHaveAttribute("data-motion-band", "trace");
  await page.getByLabel("Guided shutter speed").selectOption("30");
  await expect(preview).toHaveAttribute("data-motion-band", "flowing");
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

test("cyclist controls are keyboard accessible and preserve textual fallback", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(CSS, "supports", { configurable: true, value: () => false }));
  await page.goto("/lessons/shutter-speed-and-motion");
  const shutter = page.getByLabel("Guided shutter speed");
  await shutter.focus();
  await expect(shutter).toBeFocused();
  await shutter.selectOption("30");
  await expect(shutter).toHaveCSS("min-height", "44px");
  await expect(page.getByText(/visual motion effect is unavailable/i).first()).toBeVisible();
  await page.getByRole("button", { name: "Take photo" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Criterion Status")).toBeVisible();
});
