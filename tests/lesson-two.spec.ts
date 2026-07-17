import { expect, test } from "@playwright/test";

test("learner completes the equivalent-exposure Challenge with multiple valid combinations", async ({ page }) => {
  await page.goto("/lessons/stops-and-equivalent-exposures");

  await expect(page.getByRole("heading", { name: "One Stop is one doubling or halving" })).toBeVisible();
  await expect(page.getByText("Aperture and shutter speed change Captured Light; digital ISO changes Rendered Brightness")).toBeVisible();

  await page.getByLabel("Challenge aperture").selectOption("5.6");
  await page.getByLabel("Challenge shutter speed").selectOption("60");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(page.getByText(/wider depth of field/i)).toBeVisible();

  await page.getByLabel("Challenge aperture").selectOption("4");
  await page.getByLabel("Challenge shutter speed").selectOption("250");
  await page.getByLabel("Challenge ISO").selectOption("800");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(page.locator(".equivalent-feedback").getByText(/higher ISO/i)).toBeVisible();
  await page.getByRole("button", { name: "Compare with previous Attempt" }).click();
  await expect(page.getByText(/Previous Attempt: f\/5.6/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/successful Attempt is saved/)).toBeVisible();
});

test("accessible adjustment announces stop changes and Camera Scale persists", async ({ page }) => {
  await page.goto("/lessons/stops-and-equivalent-exposures");

  await page.getByRole("button", { name: "Double ISO" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("ISO 800 is one Stop brighter than ISO 400.")).toBeVisible();

  await page.getByLabel("Control scale").selectOption("camera");
  await expect(page.getByLabel("Challenge ISO").locator("option")).toHaveCount(22);
  await page.reload();
  await expect(page.getByLabel("Control scale")).toHaveValue("camera");

  await page.getByLabel("Challenge ISO").selectOption("125");
  await page.getByLabel("Control scale").selectOption("beginner");
  await expect(page.getByLabel("Challenge ISO")).toHaveValue("100");
});

test("malformed browser-local Progress recovers and remains writable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("learn-photo-progress", "not json"));
  await page.goto("/lessons/stops-and-equivalent-exposures");

  await page.getByLabel("Control scale").selectOption("camera");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.scale)).toBe("camera");

  await page.evaluate(() => localStorage.setItem("learn-photo-progress", JSON.stringify({ completedChallenges: "invalid" })));
  await page.getByLabel("Challenge ISO").selectOption("800");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.lessonTwoSettings?.iso)).toBe(800);
  await expect(page.evaluate(() => JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.completedChallenges)).resolves.toEqual([]);
});

test("Reference exposes stop and scale tables with Curriculum Sources", async ({ page }) => {
  await page.goto("/reference");

  await expect(page.getByRole("heading", { name: "Exposure Stops" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Beginner Scale full-stop values" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Camera Scale third-stop values" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Full-stop relationships" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Curriculum Sources" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Understanding shutter speed" })).toHaveAttribute("href", /^https:/);
});
