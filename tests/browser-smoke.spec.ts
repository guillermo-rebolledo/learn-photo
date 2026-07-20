import { expect, test } from "@playwright/test";

test("learner can navigate the product and manipulate a Curated Scene", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Learn to shape light, not chase settings." })).toBeVisible();

  await page.getByRole("link", { name: "Sandbox", exact: true }).click();
  await expect(page).toHaveURL(/\/sandbox$/);
  await page.getByRole("radio", { name: "Moving Cyclist" }).check();
  await page.getByLabel("Shutter speed").selectOption("30");

  const result = page.getByTestId("sandbox-rendered-result");
  await expect(result).toHaveAttribute("data-scene", "moving-cyclist");
  await expect(result).toHaveAttribute("data-shutter", "30");
  await expect(result).toHaveAttribute("data-render-quality", "refined");
  await expect(page.getByTestId("sandbox-text-outcome")).toContainText(/directional travel/i);

  await page.getByRole("link", { name: "Reference", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Exposure Stops" })).toBeVisible();
});
