import { expect, test } from "@playwright/test";

type VitalWindow = Window & typeof globalThis & {
  __learnPhotoVitals?: { cls: number; lcp: number; interactions: number[] };
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const vitals = { cls: 0, lcp: 0, interactions: [] as number[] };
    (window as VitalWindow).__learnPhotoVitals = vitals;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) vitals.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      vitals.lcp = entries.at(-1)?.startTime ?? vitals.lcp;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const event = entry as PerformanceEntry & { duration: number; interactionId: number };
        if (event.interactionId) vitals.interactions.push(event.duration);
      }
    }).observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
  });
});

test("Sandbox route supports the Core Web Vitals and responsive layout budgets", async ({ page }) => {
  await page.goto("/sandbox");
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-render-quality", "refined");
  await page.getByLabel("Shutter speed").selectOption("30");
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-shutter", "30");
  await page.waitForTimeout(250);

  const result = await page.evaluate(() => {
    const vitals = (window as VitalWindow).__learnPhotoVitals!;
    return {
      cls: vitals.cls,
      lcp: vitals.lcp,
      inp: Math.max(0, ...vitals.interactions),
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(result.lcp).toBeGreaterThan(0);
  expect(result.lcp).toBeLessThanOrEqual(2_500);
  expect(result.inp).toBeLessThanOrEqual(200);
  expect(result.cls).toBeLessThanOrEqual(0.1);
  expect(result.hasHorizontalOverflow).toBe(false);
});

test("Exposure Control updates fit the reference animation frame", async ({ page }) => {
  await page.goto("/sandbox");
  await expect(page.getByTestId("sandbox-rendered-result")).toHaveAttribute("data-render-quality", "refined");

  const durations = await page.evaluate(async () => {
    const control = document.querySelector<HTMLSelectElement>('select[aria-label="Shutter speed"]')!;
    const result = document.querySelector<HTMLElement>('[data-testid="sandbox-rendered-result"]')!;
    const samples: number[] = [];

    for (const value of ["30", "60", "30", "60", "30", "60", "30", "60"]) {
      const startedAt = performance.now();
      const update = new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          if (result.dataset.shutter === value) {
            observer.disconnect();
            samples.push(performance.now() - startedAt);
            resolve();
          }
        });
        observer.observe(result, { attributes: true, attributeFilter: ["data-shutter"] });
      });
      control.value = value;
      control.dispatchEvent(new Event("change", { bubbles: true }));
      await update;
    }

    return samples;
  });

  expect(Math.max(...durations)).toBeLessThanOrEqual(16.7);
});

test("phone and 200% text layouts retain controls without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sandbox");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });

  await expect(page.getByLabel("Shutter speed")).toBeVisible();
  await expect(page.getByLabel("Show luminance Histogram")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
