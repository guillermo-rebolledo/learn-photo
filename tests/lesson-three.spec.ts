import { expect, test } from "@playwright/test";
import { apertureCapturedLightStops, evaluatePortraitAttempt, portraitDepth } from "../lib/aperture-model";

test("aperture calculations express relative captured light and depth", () => {
  expect(apertureCapturedLightStops(2.8, 5.6)).toBe(2);
  expect(apertureCapturedLightStops(11, 5.6)).toBe(-1.95);
  expect(portraitDepth(2)).toMatchObject({ band: "shallow", blurRadius: 14 });
  expect(portraitDepth(11)).toMatchObject({ band: "deep", blurRadius: 0 });
  expect(evaluatePortraitAttempt({ aperture: 2.8, shutter: 250, iso: 400 }, "soft-background")).toMatchObject({
    exposure: { status: "Achieved" },
    depth: { status: "Achieved" },
  });
  expect(evaluatePortraitAttempt({ aperture: 8, shutter: 30, iso: 400 }, "defined-background")).toMatchObject({
    exposure: { status: "Achieved" },
    depth: { status: "Achieved" },
  });
});

test("learner changes aperture and receives synchronized visual and text outcomes", async ({ page }) => {
  await page.goto("/lessons/aperture-and-depth-of-field");

  await expect(page.getByRole("heading", { name: "Aperture shapes light and depth" })).toBeVisible();
  await expect(page.getByText(/format, focal length, and camera-to-subject distance/i)).toBeVisible();
  const preview = page.getByRole("region", { name: "Open the lens, soften the room" }).getByTestId("portrait-rendered-result");
  await expect(preview).toHaveAttribute("data-depth-band", "moderate");

  await page.getByLabel("Guided aperture").selectOption("2");
  await expect(preview).toHaveAttribute("data-depth-band", "shallow");
  await expect(page.getByText(/background is strongly softened/i).first()).toBeVisible();

  await page.locator("summary", { hasText: "Why this varies in real life" }).click();
  await expect(page.getByText(/APS-C format/)).toBeVisible();
  await expect(page.getByText(/50 mm focal length/)).toBeVisible();
});

test("portrait Challenges grade exposure and depth independently and accept multiple solutions", async ({ page }) => {
  await page.goto("/lessons/aperture-and-depth-of-field");

  await page.getByLabel("Portrait intention").selectOption("soft-background");
  await page.getByLabel("Challenge aperture").selectOption("2.8");
  await page.getByLabel("Challenge shutter speed").selectOption("250");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Usable exposure" })).toContainText("Achieved");
  await expect(page.getByRole("article").filter({ hasText: "Intended depth of field" })).toContainText("Achieved");

  await page.getByLabel("Challenge aperture").selectOption("2");
  await page.getByLabel("Challenge shutter speed").selectOption("500");
  await page.getByLabel("Challenge ISO").selectOption("400");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
});

test("portrait controls support keyboard operation, touch sizing, and text fallback", async ({ page }) => {
  await page.goto("/lessons/aperture-and-depth-of-field");
  const aperture = page.getByLabel("Guided aperture");
  await aperture.focus();
  await expect(aperture).toBeFocused();
  await aperture.selectOption("2");
  await expect(aperture).toHaveCSS("min-height", "44px");
  const takePhoto = page.getByRole("button", { name: "Take photo" });
  await takePhoto.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Criterion Status")).toBeVisible();

  await page.evaluate(() => document.documentElement.classList.add("no-visual-effects"));
  await expect(page.getByText(/visual depth effect is unavailable/i).first()).toBeVisible();
  await expect(page.getByText(/background is strongly softened/i).first()).toBeVisible();
});

test("portrait settings, completion, and previous Attempt remain browser-local", async ({ page }) => {
  await page.goto("/lessons/aperture-and-depth-of-field");
  await page.getByLabel("Challenge aperture").selectOption("2.8");
  await page.getByLabel("Challenge shutter speed").selectOption("250");
  await page.getByRole("button", { name: "Take photo" }).click();
  await page.getByLabel("Challenge aperture").selectOption("2");
  await page.getByLabel("Challenge shutter speed").selectOption("500");
  await page.getByRole("button", { name: "Take photo" }).click();
  await page.getByRole("button", { name: "Compare with previous Attempt" }).click();
  await expect(page.getByText(/Previous Attempt: f\/2.8/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Challenge aperture")).toHaveValue("2");
  await expect(page.getByText(/successful Attempt is saved/)).toBeVisible();
});

test("portrait Challenge operates through a touchscreen tap", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/lessons/aperture-and-depth-of-field");
  await page.getByLabel("Challenge aperture").selectOption("2.8");
  await page.getByLabel("Challenge shutter speed").selectOption("250");
  await page.getByRole("button", { name: "Take photo" }).tap();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await context.close();
});
