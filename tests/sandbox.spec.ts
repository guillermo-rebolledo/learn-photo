import { expect, test } from "@playwright/test";

test("learner can explore all six Curated Scenes without Learning Path locks", async ({ page }) => {
  await page.goto("/sandbox");

  const scenes = page.getByRole("radiogroup", { name: "Curated Scene" });
  await expect(scenes.getByRole("radio")).toHaveCount(6);
  await expect(page.getByRole("heading", { name: "Explore exposure freely." })).toBeVisible();
  await expect(page.getByText(/no Challenge, grade, or completion state/i)).toBeVisible();

  for (const name of ["Neutral Still Life", "Window-Light Portrait", "Moving Cyclist", "Dim Indoor Performance", "Bright Snow", "Dark Stage"]) {
    await scenes.getByRole("radio", { name }).check();
    await expect(page.getByTestId("sandbox-rendered-result")).toBeVisible();
  }

  await scenes.getByRole("radio", { name: "Bright Snow" }).check();
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-scene", "bright-snow");
  await expect(page.getByText(/settings adjusted for Bright Snow/i)).toBeVisible();
  await expect(page.getByLabel("ISO", { exact: true })).toHaveValue("100");

  await scenes.getByRole("radio", { name: "Moving Cyclist" }).check();
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-scene", "moving-cyclist");
});

test("control input gets an immediate preview before photographic refinement settles", async ({ page }) => {
  await page.goto("/sandbox");

  const result = page.getByTestId("sandbox-rendered-result");
  await expect(result).toHaveAttribute("data-render-quality", "refined");
  await expect(result.getByTestId("sandbox-refined-image")).toHaveAttribute("src", /neutral-still-life-960\.jpg$/);

  await page.getByLabel("Shutter speed").selectOption("30");

  await expect(result).toHaveAttribute("data-shutter", "30");
  await expect(result).toHaveAttribute("data-render-quality", "preview");
  await expect(result.getByTestId("sandbox-preview-image")).toHaveAttribute("src", /neutral-still-life-480\.jpg$/);
  await expect(result.getByTestId("sandbox-refined-image")).toHaveCount(0);

  await expect(result).toHaveAttribute("data-render-quality", "refined");
  await expect(result.getByTestId("sandbox-refined-image")).toHaveAttribute("src", /neutral-still-life-960\.jpg$/);
});

test("only the active Curated Scene requests photographic assets", async ({ page }) => {
  const photographicRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/images\/(?:neutral-still-life|window-light-portrait|moving-cyclist|dim-indoor-performance|bright-snow|dark-stage)-/.test(request.url())) {
      photographicRequests.push(request.url());
    }
  });

  await page.goto("/sandbox");
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-render-quality", "refined");

  expect(photographicRequests.length).toBeGreaterThan(0);
  expect(photographicRequests.every((url) => url.includes("neutral-still-life"))).toBe(true);

  await page.getByRole("radio", { name: "Moving Cyclist" }).check();
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-scene", "moving-cyclist");
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-render-quality", "refined");
  expect(photographicRequests.some((url) => url.includes("moving-cyclist-480.jpg"))).toBe(true);
  expect(photographicRequests.some((url) => url.includes("moving-cyclist-960.jpg"))).toBe(true);
  expect(photographicRequests.some((url) => url.includes("window-light-portrait"))).toBe(false);
});

test("scale, Exposure Mode, meter, and optional Histogram stay synchronized", async ({ page }) => {
  await page.goto("/sandbox");

  await page.getByLabel("Control scale").selectOption("camera");
  await expect(page.getByLabel("Aperture").locator("option")).toHaveCount(25);
  await page.getByRole("radio", { name: "Shutter Priority (S / Tv)" }).check();
  await page.getByLabel("Shutter speed").selectOption("500");
  await expect(page.getByLabel("Aperture", { exact: true })).toBeDisabled();
  await expect(page.getByText(/Camera selects aperture/i)).toBeVisible();
  await page.getByLabel("Exposure Compensation").selectOption("1");
  await page.getByLabel("Auto ISO").check();
  await expect(page.getByLabel("ISO", { exact: true })).toBeDisabled();

  await page.getByLabel("Show luminance Histogram").check();
  await expect(page.getByTestId("sandbox-histogram")).toBeVisible();
  await expect(page.getByTestId("sandbox-histogram")).toContainText(/tones|Clipping/i);
  await expect(page.getByText(/Meter Reference/i).last()).toBeVisible();
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-shutter", "500");
});

test("phone layout supports touch and keyboard-equivalent scene selection", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/sandbox");

  const portrait = page.getByRole("radio", { name: "Window-Light Portrait" });
  await portrait.tap();
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-scene", "window-light-portrait");

  const cyclist = page.getByRole("radio", { name: "Moving Cyclist" });
  await cyclist.focus();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-scene", "moving-cyclist");
  const scale = page.getByLabel("Control scale");
  await scale.selectOption("camera");
  await expect(scale).toHaveValue("camera");
  const shutterPriority = page.getByRole("radio", { name: "Shutter Priority (S / Tv)" });
  await shutterPriority.tap();
  const shutter = page.getByLabel("Shutter speed");
  await shutter.selectOption("4000");
  await expect(shutter).toHaveValue("4000");
  await page.getByLabel("Exposure Compensation").selectOption("1");
  await page.getByLabel("Auto ISO").tap();
  await page.getByLabel("Show luminance Histogram").tap();
  await expect(page.getByTestId("sandbox-histogram")).toBeVisible();
  await context.close();
});

test("theme changes never alter the Curated Scene rendering", async ({ page }) => {
  await page.goto("/sandbox");
  const result = page.getByTestId("sandbox-rendered-result");
  const before = await result.getAttribute("style");

  await page.getByRole("switch", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(result).toHaveAttribute("style", before ?? "");
});

test("text outcomes remain available when visual effects are unsupported", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(CSS, "supports", { configurable: true, value: () => false });
  });
  await page.goto("/sandbox");

  await expect(page.getByText(/visual refinement is unavailable/i)).toBeVisible();
  await expect(page.getByTestId("sandbox-text-outcome")).toContainText(/Rendered Result|Meter Reference/);
  await page.getByLabel("Show luminance Histogram").check();
  await expect(page.getByTestId("sandbox-histogram")).toBeVisible();
});

test("Histogram asset failure does not disable supported visual effects", async ({ page }) => {
  await page.goto("/sandbox");
  await page.evaluate(() => {
    Object.defineProperty(window, "Image", { configurable: true, value: class {
      onerror: null | (() => void) = null;
      set src(_value: string) { queueMicrotask(() => this.onerror?.()); }
    } });
  });

  await page.getByRole("radio", { name: "Window-Light Portrait" }).check();
  await page.getByLabel("Show luminance Histogram").check();
  await expect(page.getByTestId("sandbox-histogram")).toContainText(/Histogram is unavailable/i);
  await expect(page.getByText(/visual refinement is unavailable/i)).toHaveCount(0);
  await expect(page.getByTestId("sandbox-rendered-result").locator(".sandbox-portrait-subject")).toBeVisible();
});
