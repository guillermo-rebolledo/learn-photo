import { expect, test } from "@playwright/test";

test("Night Sky bonus is directly accessible with documented assumptions and Bulb presets", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Night Sky bonus/i }).click();

  await expect(page).toHaveURL(/\/night-sky$/);
  await expect(page.getByRole("heading", { name: "Shape starlight over time" })).toBeVisible();
  await expect(page.getByText(/tripod/i)).toBeVisible();
  await expect(page.getByText(/remote or delayed release/i)).toBeVisible();
  await expect(page.getByText(/fixed focus/i)).toBeVisible();
  await expect(page.getByText(/full-frame/i)).toBeVisible();
  await expect(page.getByText(/24 mm/i)).toBeVisible();

  const sharp = page.getByRole("region", { name: "Relatively sharp stars Challenge" });
  await expect(sharp.getByLabel("Bulb Exposure duration").locator("option")).toHaveText([
    "30 seconds", "1 minute", "2 minutes", "5 minutes", "10 minutes",
  ]);
  await expect(page.getByText(/simulated immediately/i)).toBeVisible();
});

test("both Night Sky intentions accept multiple valid settings and explain tradeoffs", async ({ page }) => {
  await page.goto("/night-sky");
  const sharp = page.getByRole("region", { name: "Relatively sharp stars Challenge" });
  await sharp.getByLabel("Bulb Exposure duration").selectOption("30");
  await sharp.getByLabel("Aperture").selectOption("2.8");
  await sharp.getByLabel("ISO").selectOption("3200");
  await sharp.getByRole("button", { name: "Take photo" }).click();
  await expect(sharp.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(sharp.getByText(/no universal sharp-star limit/i)).toBeVisible();

  await sharp.getByLabel("Aperture").selectOption("2");
  await sharp.getByLabel("ISO").selectOption("1600");
  await sharp.getByRole("button", { name: "Retry" }).click();
  await expect(sharp.getByRole("heading", { name: "Challenge complete" })).toBeVisible();

  const trails = page.getByRole("region", { name: "Deliberate star trails Challenge" });
  await trails.getByLabel("Bulb Exposure duration").selectOption("300");
  await trails.getByLabel("Aperture").selectOption("4");
  await trails.getByLabel("ISO").selectOption("400");
  await trails.getByRole("button", { name: "Take photo" }).click();
  await expect(trails.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(trails.getByText(/Longer shutter duration lengthens star motion/i)).toBeVisible();

  await trails.getByLabel("Bulb Exposure duration").selectOption("600");
  await trails.getByLabel("ISO").selectOption("200");
  await trails.getByRole("button", { name: "Retry" }).click();
  await expect(trails.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
});

test("Night Sky Progress persists and rendering remains useful with reduced motion and degraded effects", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/night-sky");

  await expect(page.getByTestId("sharp-star-motion")).toHaveCSS("transition-duration", "1e-05s");

  const sharp = page.getByRole("region", { name: "Relatively sharp stars Challenge" });
  await sharp.getByLabel("Bulb Exposure duration").selectOption("30");
  await sharp.getByLabel("Aperture").selectOption("2.8");
  await sharp.getByLabel("ISO").selectOption("3200");
  await sharp.getByRole("button", { name: "Take photo" }).click();
  await expect(sharp.getByText(/Stars remain relatively sharp under these assumptions/i)).toBeVisible();

  const shortMotionAsset = await page.getByTestId("sharp-star-motion").getAttribute("src");
  await sharp.getByLabel("Bulb Exposure duration").selectOption("600");
  const longMotionAsset = await page.getByTestId("sharp-star-motion").getAttribute("src");
  expect(shortMotionAsset).toContain("duration-30");
  expect(longMotionAsset).toContain("duration-600");
  await sharp.getByLabel("Bulb Exposure duration").selectOption("30");

  await page.evaluate(() => localStorage.setItem("learn-photo-visual-effects", "off"));
  await page.reload();
  await expect(sharp.getByText(/visual refinement is unavailable/i)).toBeVisible();

  const trails = page.getByRole("region", { name: "Deliberate star trails Challenge" });
  await trails.getByLabel("Bulb Exposure duration").selectOption("300");
  await trails.getByLabel("Aperture").selectOption("4");
  await trails.getByLabel("ISO").selectOption("400");
  await trails.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Night Sky bonus complete" })).toBeVisible();
  await page.reload();
  await expect(sharp.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(trails.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.nightSkyComplete)).toBe(true);
});
