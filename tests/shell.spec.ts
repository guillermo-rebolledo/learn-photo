import { expect, test } from "@playwright/test";

test("learner can start the first Lesson with pointer input", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Learn to shape light, not chase settings." })).toBeVisible();
  await page.getByRole("link", { name: "Start learning" }).click();

  await expect(page).toHaveURL(/\/lessons\/light-and-exposure\/?$/);
  await expect(page.getByRole("heading", { name: "Light and exposure" })).toBeVisible();
});

test("learner can start the first Lesson with keyboard input", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start learning" }).focus();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/lessons\/light-and-exposure\/?$/);
});

test("Learning Path keeps all eight Lessons available", async ({ page }) => {
  await page.goto("/");

  const path = page.getByRole("region", { name: "Learning Path" });
  await expect(path.getByRole("listitem")).toHaveCount(8);
  await expect(path.getByRole("link", { name: /Choosing settings for an intention/ })).toBeEnabled();
});

test("Sandbox destination opens unrestricted exploration", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sandbox" }).click();

  await expect(page.getByRole("heading", { name: "Explore exposure freely." })).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "Curated Scene" }).getByRole("radio")).toHaveCount(6);
});

test("explicit theme override is browser-local", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const themeSwitch = page.getByRole("switch", { name: "Use dark theme" });
  await expect(themeSwitch).not.toBeChecked();
  await themeSwitch.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(themeSwitch).toBeChecked();
  await expect(page.evaluate(() => localStorage.getItem("learn-photo-theme"))).resolves.toBe("dark");
});
