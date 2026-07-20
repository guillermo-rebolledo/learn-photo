import { expect, test } from "@playwright/test";

test.describe("production release smoke", () => {
  test("landing and every top-level destination load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Learn to shape light, not chase settings." })).toBeVisible();

    await page.getByRole("link", { name: "Sandbox", exact: true }).click();
    await expect(page).toHaveURL(/\/sandbox\/?$/);
    await expect(page.getByRole("heading", { name: "Explore exposure freely." })).toBeVisible();

    await page.getByRole("link", { name: "Reference", exact: true }).click();
    await expect(page).toHaveURL(/\/reference\/?$/);
    await expect(page.getByRole("heading", { name: "Exposure Stops" })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: /Night Sky bonus/i }).click();
    await expect(page).toHaveURL(/\/night-sky\/?$/);
    await expect(page.getByRole("heading", { name: "Shape starlight over time" })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Start learning" }).click();
    await expect(page).toHaveURL(/\/lessons\/light-and-exposure\/?$/);
    await expect(page.getByRole("heading", { name: "Light and exposure" })).toBeVisible();
  });

  test("a representative Challenge can be completed", async ({ page }) => {
    await page.goto("/lessons/light-and-exposure");
    await page.getByLabel("Shutter speed").selectOption("60");
    await page.getByRole("button", { name: "Take photo" }).click();
    await expect(page.getByText("Lesson complete")).toBeVisible();
  });

  test("Capstone can be completed end to end", async ({ page }) => {
    await page.goto("/lessons/choosing-settings");

    const motion = page.getByRole("region", { name: "Motion Capstone Challenge" });
    await motion.getByLabel("Motion aperture").selectOption("2.8");
    await motion.getByLabel("Motion shutter").selectOption("500");
    await motion.getByRole("button", { name: "Take photo" }).click();
    await expect(motion.getByRole("heading", { name: "Challenge complete" })).toBeVisible();

    const depth = page.getByRole("region", { name: "Depth of field Capstone Challenge" });
    await depth.getByLabel("Depth aperture").selectOption("8");
    await depth.getByLabel("Depth shutter").selectOption("30");
    await depth.getByRole("button", { name: "Take photo" }).click();
    await expect(depth.getByRole("heading", { name: "Challenge complete" })).toBeVisible();

    const lowLight = page.getByRole("region", { name: "Low-light Capstone Challenge" });
    await lowLight.getByRole("button", { name: "Take photo" }).click();

    await expect(page.getByRole("heading", { name: "Capstone complete" })).toBeVisible();
    await expect(page.getByText(/Learning Path is complete/i)).toBeVisible();
  });

  test("Reset progress clears learning state", async ({ page }) => {
    await page.goto("/lessons/light-and-exposure");
    await page.getByLabel("ISO").selectOption("800");

    await page.getByRole("button", { name: "Reset progress" }).click();
    await expect(page.getByLabel("ISO")).toHaveValue("400");
    await expect(page.evaluate(() => localStorage.getItem("learn-photo-progress"))).resolves.toBeNull();
  });

  test("Night Sky bonus Challenge can be completed", async ({ page }) => {
    await page.goto("/night-sky");

    const sharp = page.getByRole("region", { name: "Relatively sharp stars Challenge" });
    await sharp.getByLabel("Bulb Exposure duration").selectOption("30");
    await sharp.getByLabel("Aperture").selectOption("2.8");
    await sharp.getByLabel("ISO").selectOption("3200");
    await sharp.getByRole("button", { name: "Take photo" }).click();
    await expect(sharp.getByRole("heading", { name: "Challenge complete" })).toBeVisible();

    const trails = page.getByRole("region", { name: "Deliberate star trails Challenge" });
    await trails.getByLabel("Bulb Exposure duration").selectOption("300");
    await trails.getByLabel("Aperture").selectOption("4");
    await trails.getByLabel("ISO").selectOption("400");
    await trails.getByRole("button", { name: "Take photo" }).click();
    await expect(page.getByRole("heading", { name: "Night Sky bonus complete" })).toBeVisible();
  });
});
