import { expect, test, type Page } from "@playwright/test";

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-render-quality", "refined");
}

test("landing and Learning Path remain composed in both desktop themes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("learn-desktop-light.png", { fullPage: true, animations: "disabled" });

  await page.getByRole("switch", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page).toHaveScreenshot("learn-desktop-dark.png", { fullPage: true, animations: "disabled" });
});

test("Sandbox remains composed on a phone in both themes and at 200% text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sandbox");
  await settle(page);
  await expect(page).toHaveScreenshot("sandbox-phone-light.png", { fullPage: true, animations: "disabled" });

  await page.getByRole("switch", { name: "Use dark theme" }).click();
  await expect(page).toHaveScreenshot("sandbox-phone-dark.png", { fullPage: true, animations: "disabled" });

  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(page).toHaveScreenshot("sandbox-phone-zoomed-text.png", { fullPage: true, animations: "disabled" });
});

test("all six Curated Scenes retain representative visual extremes", async ({ page }) => {
  await page.goto("/sandbox");
  const result = page.getByTestId("sandbox-rendered-result");
  await settle(page);
  await expect(result).toHaveScreenshot("scene-neutral-reference.png", { animations: "disabled" });

  await page.getByRole("radio", { name: "Window-Light Portrait" }).check();
  await page.getByLabel("Aperture", { exact: true }).selectOption("2.8");
  await settle(page);
  await expect(result).toHaveScreenshot("scene-portrait-wide-aperture.png", { animations: "disabled" });

  await page.getByRole("radio", { name: "Moving Cyclist" }).check();
  await page.getByLabel("Shutter speed").selectOption("30");
  await settle(page);
  await expect(result).toHaveScreenshot("scene-cyclist-slow-shutter.png", { animations: "disabled" });

  await page.getByRole("radio", { name: "Dim Indoor Performance" }).check();
  await page.getByLabel("ISO", { exact: true }).selectOption("12800");
  await settle(page);
  await expect(result).toHaveScreenshot("scene-performance-high-iso.png", { animations: "disabled" });

  await page.getByRole("radio", { name: "Bright Snow" }).check();
  await page.getByLabel("Shutter speed").selectOption("60");
  await settle(page);
  await expect(result).toHaveScreenshot("scene-snow-bright.png", { animations: "disabled" });

  await page.getByRole("radio", { name: "Dark Stage" }).check();
  await page.getByLabel("Shutter speed").selectOption("500");
  await settle(page);
  await expect(result).toHaveScreenshot("scene-stage-dark.png", { animations: "disabled" });
});

test("Challenge feedback has a stable visual baseline", async ({ page }) => {
  await page.goto("/lessons/aperture-and-depth-of-field");
  await page.getByLabel("Portrait intention").selectOption("soft-background");
  await page.getByLabel("Challenge aperture").selectOption("2.8");
  await page.getByLabel("Challenge shutter speed").selectOption("250");
  await page.getByRole("button", { name: "Take photo" }).click();
  const feedback = page.getByRole("heading", { name: "Challenge complete" }).locator("..");
  await expect(feedback).toHaveScreenshot("challenge-feedback-achieved.png", { animations: "disabled" });
});

test("unsupported effects retain an explicit visual fallback", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(CSS, "supports", { configurable: true, value: () => false }));
  await page.goto("/sandbox");
  await settle(page);
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveScreenshot("sandbox-effects-fallback.png", { animations: "disabled" });
});
