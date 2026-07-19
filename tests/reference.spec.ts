import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { curriculumSourceGroups, sourcePhotographs, validateReferenceData } from "../lib/reference-data";

test("Learner discovers a canonical term with accessible search", async ({ page }) => {
  await page.goto("/reference");

  const search = page.getByRole("searchbox", { name: "Search the Reference" });
  await search.fill("meter reference");

  const results = page.getByRole("region", { name: "Reference results" });
  await expect(results.getByRole("heading", { name: "Meter Reference" })).toBeVisible();
  await expect(results.getByRole("heading", { name: "Stop", exact: true })).toBeHidden();
  await expect(page.getByRole("status")).toContainText("1 result");
});

test("Reference search supports keyboard filtering and clearing", async ({ page }) => {
  await page.goto("/reference");

  await page.getByRole("searchbox", { name: "Search the Reference" }).focus();
  await page.keyboard.type("film constraint");
  await expect(page.getByRole("heading", { name: "Film Constraint" })).toBeVisible();

  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByRole("heading", { name: "Stop", exact: true })).toBeVisible();
});

test("search filters Curriculum Sources and Source Photograph credits", async ({ page }) => {
  await page.goto("/reference");
  const search = page.getByRole("searchbox", { name: "Search the Reference" });

  await search.fill("Canon");
  await expect(page.getByRole("region", { name: "Curriculum Sources" })).toContainText("Canon");
  await expect(page.getByRole("region", { name: "Curriculum Sources" })).not.toContainText("Cambridge in Colour");

  await search.fill("Ruth Hartnup");
  await expect(page.getByRole("region", { name: "Source Photograph credits" }).getByRole("article")).toHaveCount(1);
});

test("touch and focus navigation operate the search controls", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/reference");
  const search = page.getByRole("searchbox", { name: "Search the Reference" });

  await search.tap();
  await search.fill("film constraint");
  await expect(page.getByRole("heading", { name: "Film Constraint" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Clear search" })).toBeFocused();
  await context.close();
});

test("Reference consolidates Lesson sources and Source Photograph provenance", async ({ page }) => {
  await page.goto("/reference");

  const sources = page.getByRole("region", { name: "Curriculum Sources" });
  await expect(sources.getByRole("heading", { name: "Light and exposure" })).toBeVisible();
  await expect(sources.getByRole("heading", { name: "Exposure modes" })).toBeVisible();
  await expect(sources.getByRole("link", { name: "Understanding ISO sensitivity" }).first()).toHaveAttribute("href", /^https:\/\//);

  const photographs = page.getByRole("region", { name: "Source Photograph credits" });
  await expect(photographs.getByRole("article")).toHaveCount(6);
  await expect(photographs.getByRole("link", { name: "Ruth Hartnup" })).toHaveAttribute("href", /^https:\/\//);
  await expect(photographs).toContainText("License verified");
});

test("Reference data has complete sources, credits, and local asset references", () => {
  expect(validateReferenceData).not.toThrow();
  expect(curriculumSourceGroups).toHaveLength(7);

  for (const group of curriculumSourceGroups) {
    expect(existsSync(`content/lessons/${group.slug}.mdx`)).toBe(true);
    for (const source of group.sources) expect(() => new URL(source.url)).not.toThrow();
  }

  for (const photograph of sourcePhotographs) {
    expect(existsSync(`public/images/${photograph.file}`)).toBe(true);
    expect(photograph.photographer).not.toBe("");
    expect(photograph.license).not.toBe("");
    expect(photograph.licenseVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
});

test("external Curriculum Source and credit references do not resolve as broken", async ({ request }) => {
  test.setTimeout(90_000);
  const urls = new Set([
    ...curriculumSourceGroups.flatMap(({ sources }) => sources.map(({ url }) => url)),
    ...sourcePhotographs.flatMap(({ sourceUrl, licenseUrl }) => [sourceUrl, licenseUrl]),
  ]);
  const urlsByOrigin = Map.groupBy([...urls], (url) => new URL(url).origin);
  const resultGroups = await Promise.all([...urlsByOrigin.values()].map(async (originUrls) => {
    const originResults: { url: string; status: number }[] = [];
    for (const url of originUrls) {
      let response;
      try {
        response = await request.fetch(url, { method: "HEAD", timeout: 20_000, failOnStatusCode: false, headers: { connection: "close" } });
      } catch {
        try {
          response = await request.get(url, { timeout: 20_000, failOnStatusCode: false, headers: { connection: "close" } });
        } catch {
          originResults.push({ url, status: 0 });
          continue;
        }
      }
      originResults.push({ url, status: response.status() });
    }
    return originResults;
  }));
  const results = resultGroups.flat();

  expect(results.filter(({ status }) => status === 0 || status === 404 || status >= 500)).toEqual([]);
});
