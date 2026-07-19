import { expect, test } from "@playwright/test";

test("Lesson 8 teaches an intention-first settings strategy", async ({ page }) => {
  await page.goto("/lessons/choosing-settings");

  await expect(page.getByRole("heading", { name: "Choose settings from the photograph you want" })).toBeVisible();
  await expect(page.getByText(/choose the Exposure Control that most directly shapes it/i)).toBeVisible();
  await expect(page.getByText(/rebalance the other controls/i)).toBeVisible();
  await expect(page.getByText(/more than one settings combination/i)).toBeVisible();
});

test("motion Capstone supports retries, learner-initiated hints, and multiple solutions", async ({ page }) => {
  await page.goto("/lessons/choosing-settings");
  const challenge = page.getByRole("region", { name: "Motion Capstone Challenge" });

  await expect(challenge.getByText(/hint/i)).toHaveCount(1);
  await expect(challenge.getByText(/start with shutter speed/i)).toHaveCount(0);
  await challenge.getByRole("button", { name: "Show hint" }).click();
  await expect(challenge.getByText(/start with shutter speed/i)).toBeVisible();

  await challenge.getByRole("button", { name: "Take photo" }).click();
  await expect(challenge.getByRole("heading", { name: "Review the result" })).toBeVisible();
  await challenge.getByLabel("Motion aperture").selectOption("2.8");
  await challenge.getByLabel("Motion shutter").selectOption("500");
  await challenge.getByRole("button", { name: "Retry" }).click();
  await expect(challenge.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(challenge.getByText(/no grade/i)).toBeVisible();

  await challenge.getByLabel("Motion aperture").selectOption("4");
  await challenge.getByLabel("Motion shutter").selectOption("1000");
  await challenge.getByLabel("Motion ISO").selectOption("1600");
  await challenge.getByRole("button", { name: "Retry" }).click();
  await expect(challenge.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
});

test("depth Capstone applies a Film Constraint and completes on essential criteria", async ({ page }) => {
  await page.goto("/lessons/choosing-settings");
  const challenge = page.getByRole("region", { name: "Depth of field Capstone Challenge" });

  await expect(challenge.getByLabel("Depth ISO")).toBeDisabled();
  await expect(challenge.getByLabel("Depth ISO")).toHaveValue("400");
  await challenge.getByLabel("Depth aperture").selectOption("8");
  await challenge.getByLabel("Depth shutter").selectOption("30");
  await challenge.getByRole("button", { name: "Take photo" }).click();
  await expect(challenge.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(challenge.getByText("Fixed across the roll", { exact: true })).toBeVisible();
});

test("optional low-light quality may remain Close without blocking Capstone completion", async ({ page }) => {
  await page.goto("/lessons/choosing-settings");
  const challenge = page.getByRole("region", { name: "Low-light Capstone Challenge" });

  await challenge.getByLabel("Low-light aperture").selectOption("5.6");
  await challenge.getByLabel("Low-light shutter").selectOption("250");
  await challenge.getByLabel("Low-light ISO").selectOption("6400");
  await challenge.getByRole("button", { name: "Take photo" }).click();
  await expect(challenge.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(challenge.getByRole("article", { name: "Image quality optional" })).toContainText("Close");
});

test("Capstone completion updates Progress and restores unfinished settings", async ({ page }) => {
  await page.goto("/lessons/choosing-settings");
  const motion = page.getByRole("region", { name: "Motion Capstone Challenge" });
  await motion.getByLabel("Motion aperture").selectOption("2.8");
  await motion.getByLabel("Motion shutter").selectOption("500");
  await motion.getByRole("button", { name: "Take photo" }).click();

  await page.reload();
  await expect(motion.getByLabel("Motion shutter")).toHaveValue("500");
  await expect(motion.getByRole("heading", { name: "Challenge complete" })).toBeVisible();

  const depth = page.getByRole("region", { name: "Depth of field Capstone Challenge" });
  await depth.getByLabel("Depth aperture").selectOption("8");
  await depth.getByLabel("Depth shutter").selectOption("30");
  await depth.getByRole("button", { name: "Take photo" }).click();
  const lowLight = page.getByRole("region", { name: "Low-light Capstone Challenge" });
  await lowLight.getByRole("button", { name: "Take photo" }).click();

  await expect(page.getByRole("heading", { name: "Capstone complete" })).toBeVisible();
  await expect(page.getByText(/Learning Path is complete/i)).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.completedLessons)).toContain("choosing-settings");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("learn-photo-progress") ?? "null")?.capstoneComplete)).toBe(true);
  await page.goto("/");
  await expect(page.getByText("Learning Path complete")).toBeVisible();
  await expect(page.getByRole("link", { name: /Light and exposure/ })).toBeEnabled();
  await expect(page.getByRole("link", { name: /Choosing settings for an intention/ })).toBeEnabled();
});
