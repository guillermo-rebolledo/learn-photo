import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { name: "Learn and settings", path: "/" },
  { name: "Lesson 1 Challenge", path: "/lessons/light-and-exposure" },
  { name: "Lesson 2 Challenge", path: "/lessons/stops-and-equivalent-exposures" },
  { name: "Lesson 3 Challenge", path: "/lessons/aperture-and-depth-of-field" },
  { name: "Lesson 4 Challenge", path: "/lessons/shutter-speed-and-motion" },
  { name: "Lesson 5 Challenge", path: "/lessons/iso-and-image-quality" },
  { name: "Lesson 6 Challenge", path: "/lessons/meter-and-histogram" },
  { name: "Lesson 7 Challenge", path: "/lessons/exposure-modes" },
  { name: "Lesson 8 Capstone", path: "/lessons/choosing-settings" },
  { name: "Sandbox", path: "/sandbox" },
  { name: "Reference", path: "/reference" },
  { name: "Night Sky bonus", path: "/night-sky" },
] as const;

const routePaths = routes.map(({ path }) => path);

for (const theme of ["light", "dark"] as const) {
  for (const route of routes) {
    test(`${route.name} has no automated WCAG A or AA violations in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem("learn-photo-theme", selectedTheme);
      }, theme);
      await page.goto(route.path);
      await expect(page.locator("main")).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
}

test("core surfaces remain usable at 200% text size", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routePaths) {
      await page.goto(route);
      await page.locator("html").evaluate((element) => {
        element.style.fontSize = "200%";
      });

      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const viewportWidth = document.documentElement.clientWidth;
              const scrollWidth = document.documentElement.scrollWidth;
              const overflowingElements =
                scrollWidth > viewportWidth
                  ? [...document.body.querySelectorAll<HTMLElement>("*")]
                      .map((element) => {
                        const bounds = element.getBoundingClientRect();
                        return {
                          element: [
                            element.tagName.toLowerCase(),
                            element.id ? `#${element.id}` : "",
                            element.getAttribute("data-testid")
                              ? `[data-testid=${element.getAttribute("data-testid")}]`
                              : "",
                            element.classList.length > 0
                              ? `.${[...element.classList].join(".")}`
                              : "",
                          ].join(""),
                          left: Math.round(bounds.left),
                          right: Math.round(bounds.right),
                          width: Math.round(bounds.width),
                        };
                      })
                      .filter(({ right }) => right > viewportWidth)
                      .sort((a, b) => b.right - a.right)
                      .slice(0, 8)
                  : [];

              return {
                scrollWidth,
                overflowingElements,
              };
            }),
          {
            message: `${route} should fit within the ${viewport.width}px viewport at 200% text size`,
          },
        )
        .toEqual({ scrollWidth: viewport.width, overflowingElements: [] });
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main select, main input, main button, main a").first()).toBeVisible();
    }
  }
});

test("core surfaces reflow without page-level horizontal scrolling at 200% zoom", async ({ page }) => {
  for (const viewport of [{ width: 640, height: 900 }, { width: 320, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routePaths) {
      await page.goto(route);

      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main select, main input, main button, main a").first()).toBeVisible();
    }
  }
});

for (const route of routes.filter(({ path }) => path.startsWith("/lessons/") || path === "/night-sky")) {
  test(`${route.name} exposes accessible dynamic feedback after an Attempt`, async ({ page }) => {
    await page.goto(route.path);
    const capture = page.getByRole("button", { name: /^Take( .+)? photo$/ }).first();
    await expect(capture).toBeEnabled();
    await capture.click();
    await expect(page.locator("[aria-live='polite']").filter({ hasText: /Criterion Status|Challenge complete|Review|experimenting/i }).first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Sandbox, Reference, and settings remain accessible after state changes", async ({ page }) => {
  await page.goto("/sandbox");
  await page.getByRole("radio", { name: "Window-Light Portrait" }).check();
  await page.getByLabel("Show luminance Histogram").check();
  await expect(page.getByTestId("sandbox-histogram")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.goto("/reference");
  await page.getByRole("searchbox", { name: "Search the Reference" }).fill("film constraint");
  await expect(page.getByRole("status")).toContainText("result");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.goto("/lessons/light-and-exposure");
  await page.getByRole("switch", { name: "Use dark theme" }).click();
  await page.getByRole("button", { name: "Reset progress" }).click();
  await expect(page.getByRole("status")).toHaveText("Progress and theme preference reset.");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("keyboard learners can bypass repeated navigation and receive named Challenge feedback", async ({ page }) => {
  await page.goto("/lessons/light-and-exposure");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();

  const capture = page.getByRole("button", { name: "Take photo" });
  await capture.focus();
  await page.keyboard.press("Enter");
  const feedback = page.getByRole("region", { name: "Tradeoff Feedback" });
  await expect(feedback).toContainText("Criterion Status");
  await expect(feedback).toContainText(/Achieved|Close|Missed/);

  const results = await new AxeBuilder({ page })
    .include("#feedback")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
