import { expect, test } from "@playwright/test";

test("accessible Exposure Mode selection preserves Learner controls and exposes aliases", async ({ page }) => {
  await page.goto("/lessons/exposure-modes");
  await expect(page.getByRole("heading", { name: "Decide who makes each choice" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Exposure Mode" })).toBeVisible();
  await page.getByRole("radio", { name: "Shutter Priority (S / Tv)" }).check();
  await expect(page.getByLabel("Learner shutter")).toBeEnabled();
  await expect(page.getByLabel("Learner aperture")).toBeDisabled();
  await page.getByRole("radio", { name: "Manual (M)" }).check();
  await expect(page.getByLabel("Learner aperture")).toBeEnabled();
  await expect(page.getByLabel("Exposure Compensation")).toBeDisabled();
});

test("compensation and optional Auto ISO change only Camera-assigned controls", async ({ page }) => {
  await page.goto("/lessons/exposure-modes");
  const result = page.getByTestId("mode-rendered-result");
  await expect(page.getByLabel(/Auto ISO/)).toBeDisabled();
  await page.getByLabel("Exposure Compensation").selectOption("1");
  await expect(result).toHaveAttribute("data-exposure-stops", "0.97");
  await expect(page.getByText(/0.97 Stops above the Meter Reference/)).toBeVisible();
  await page.getByRole("radio", { name: "Manual (M)" }).check();
  await expect(page.getByLabel(/Auto ISO/)).not.toBeChecked();
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByLabel(/Auto ISO/)).toBeEnabled();
  await page.getByLabel(/Auto ISO/).check();
  await expect(page.getByLabel("Learner iso")).toBeDisabled();
});

test("Challenge assesses the cyclist intention and accepts outcomes from different modes", async ({ page }) => {
  await page.goto("/lessons/exposure-modes");
  await page.getByRole("radio", { name: "Shutter Priority (S / Tv)" }).check();
  await page.getByLabel("Learner shutter").selectOption("500");
  await page.getByLabel("Learner iso").selectOption("800");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();

  await page.getByRole("radio", { name: "Manual (M)" }).check();
  await page.getByLabel("Learner aperture").selectOption("4");
  await page.getByLabel("Learner shutter").selectOption("1000");
  await page.getByLabel("Learner iso").selectOption("1600");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByRole("heading", { name: "Challenge complete" })).toBeVisible();
  await expect(page.getByText(/assesses the Rendered Result, not the Exposure Mode label/)).toBeVisible();
});

test("Reference lists transferable Exposure Modes and aliases", async ({ page }) => {
  await page.goto("/reference");
  const table = page.getByRole("table", { name: "Exposure Modes and common aliases" });
  await expect(table).toContainText("A, Av");
  await expect(table).toContainText("S, Tv");
  await expect(page.getByText(/Optional Auto ISO transfers ISO selection/)).toBeVisible();
});
