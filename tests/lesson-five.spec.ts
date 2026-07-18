import { expect, test } from "@playwright/test";
import { evaluatePerformanceAttempt, isoStops, noiseOutcome } from "../lib/iso-model";

test("ISO Stops and calibrated noise outcomes are deterministic", () => {
  expect(isoStops(800)).toBe(3);
  expect(isoStops(3200, 800)).toBe(2);
  expect(noiseOutcome(100)).toEqual(expect.objectContaining({ band: "clean", opacity: 0 }));
  expect(noiseOutcome(3200)).toEqual(expect.objectContaining({ band: "visible", opacity: 0.17 }));
  expect(noiseOutcome(12800)).toEqual(expect.objectContaining({ band: "strong", opacity: 0.26 }));
});

test("low-light criteria are independent and multiple solutions are valid", () => {
  expect(evaluatePerformanceAttempt({ aperture: 1.8, shutter: 250, iso: 800 }, "freeze")).toMatchObject({ exposure: { status: "Achieved" }, motion: { status: "Achieved" }, quality: { status: "Achieved" } });
  expect(evaluatePerformanceAttempt({ aperture: 1.8, shutter: 500, iso: 1600 }, "freeze")).toMatchObject({ exposure: { status: "Achieved" }, motion: { status: "Achieved" }, quality: { status: "Achieved" } });
  expect(evaluatePerformanceAttempt({ aperture: 1.8, shutter: 30, iso: 12800 }, "show-motion")).toMatchObject({ motion: { status: "Achieved" }, quality: { status: "Missed" } });
});

test("guided ISO synchronizes visual and text outcomes", async ({ page }) => {
  await page.goto("/lessons/iso-and-image-quality");
  await expect(page.getByRole("heading", { name: "ISO changes the rendering, not the light gathered" })).toBeVisible();
  await page.getByLabel("Guided ISO").selectOption("12800");
  await expect(page.getByTestId("performance-rendered-result").first()).toHaveAttribute("data-noise-band", "strong");
  await expect(page.getByText(/Strong noise and reduced fine detail/).first()).toBeVisible();
  await expect(page.getByText(/Captured Light is unchanged/)).toBeVisible();
});

test("Challenge controls are accessible and grade each criterion", async ({ page }) => {
  await page.goto("/lessons/iso-and-image-quality");
  const iso = page.getByLabel("Challenge ISO");
  await iso.focus();
  await expect(iso).toBeFocused();
  await expect(iso).toHaveCSS("min-height", "44px");
  await page.getByLabel("Challenge aperture").selectOption("1.8");
  await page.getByLabel("Challenge shutter speed").selectOption("250");
  await iso.selectOption("800");
  const takePhoto = page.getByRole("button", { name: "Take photo" });
  await takePhoto.focus();
  await page.keyboard.press("Enter");
  await expect(takePhoto).toBeFocused();
  await expect(page.locator(".feedback[aria-live='polite']")).toContainText("Tradeoff Feedback");
  await expect(page.getByRole("article").filter({ hasText: "Usable exposure" })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Usable exposure" })).toContainText("Achieved");
  await expect(page.getByRole("article").filter({ hasText: "Intended motion" })).toContainText("Achieved");
  await expect(page.getByRole("article").filter({ hasText: "ISO-compatible image quality" })).toContainText("Achieved");
});

test("Challenge remains usable when visual effects degrade", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(CSS, "supports", { configurable: true, value: () => false }); });
  await page.goto("/lessons/iso-and-image-quality");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(page.getByText(/Visual effects are unavailable/).first()).toBeVisible();
});

test("low-light extremes remain readable in both themes", async ({ page }) => {
  await page.goto("/lessons/iso-and-image-quality");
  for (const iso of ["100", "12800"]) {
    await page.getByLabel("Guided ISO").selectOption(iso);
    await expect(page.getByText(new RegExp(`ISO ${iso} is`))).toBeVisible();
  }
  await page.getByRole("switch", { name: /dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("performance-rendered-result").first()).toBeVisible();
});
