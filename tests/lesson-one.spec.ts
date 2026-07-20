import { expect, test } from "@playwright/test";

test("learner completes the first Learning Loop and compares a retry", async ({ page }) => {
  await page.goto("/");
  const landingResult = page.getByText(/Meter Reference/).first();
  await page.getByLabel("Landing shutter speed").selectOption("125");
  await expect(landingResult).toContainText("darker");
  await page.getByRole("link", { name: "Start learning" }).click();

  await expect(page.getByRole("heading", { name: "Light and exposure" })).toBeVisible();
  await expect(page.getByText("Criterion Status", { exact: true })).toHaveCount(0);
  await page.getByLabel("Shutter speed").selectOption("125");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByText("Criterion Status", { exact: true })).toBeVisible();
  await expect(page.getByText("Close", { exact: true }).first()).toBeVisible();

  await page.getByLabel("Shutter speed").selectOption("60");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByText("Lesson complete")).toBeVisible();
  await page.getByRole("button", { name: "Compare with previous Attempt" }).click();
  await expect(page.getByText(/Previous Attempt: f\/5.6 · 1\/125s · ISO 400/)).toBeVisible();

  await page.reload();
  await expect(page.getByText("Lesson complete")).toBeVisible();
});

test("Lesson complete only describes the current successful Attempt", async ({ page }) => {
  await page.goto("/lessons/light-and-exposure");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByText("Lesson complete")).toBeVisible();

  await page.getByLabel("Shutter speed").selectOption("250");
  await page.getByRole("button", { name: "Take photo" }).click();

  await expect(page.getByText("Missed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Lesson complete")).toHaveCount(0);
});

test("unfinished settings restore and Reset progress clears learning state", async ({ page }) => {
  await page.goto("/lessons/light-and-exposure");
  await page.evaluate(() => localStorage.setItem("learn-photo-theme", "dark"));
  await page.getByLabel("ISO").selectOption("800");
  await page.getByLabel("Control scale").selectOption("camera");
  await expect(page.getByLabel("ISO").locator("option")).toHaveCount(13);
  await page.reload();
  await expect(page.getByLabel("ISO")).toHaveValue("800");
  await expect(page.getByLabel("Control scale")).toHaveValue("camera");

  await page.getByRole("button", { name: "Reset progress" }).click();
  await expect(page.getByLabel("ISO")).toHaveValue("400");
  await expect(page.getByRole("status")).toHaveText("Progress and theme preference reset.");
  await expect(page.evaluate(() => localStorage.getItem("learn-photo-progress"))).resolves.toBeNull();
  await expect(page.evaluate(() => localStorage.getItem("learn-photo-theme"))).resolves.toBeNull();

  const firstAnnouncement = page.getByRole("status");
  const firstAnnouncementElement = await firstAnnouncement.elementHandle();
  await page.getByRole("button", { name: "Reset progress" }).click();
  await expect.poll(() => firstAnnouncementElement?.evaluate((element) => element.isConnected)).toBe(false);
  await expect(page.getByRole("status")).toHaveText("Progress and theme preference reset.");
});

test("landing resumes the saved Lesson position", async ({ page }) => {
  await page.goto("/lessons/stops-and-equivalent-exposures");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.lesson)).toBe("stops-and-equivalent-exposures");
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Start learning" })).toHaveAttribute("href", "/lessons/stops-and-equivalent-exposures");
});
