import { expect, test } from "@playwright/test";
import { evaluateFilmConstraint } from "../lib/film-model";
import { lessonFour, lessonThree, lessonTwo, validateCurriculumSources } from "../lib/curriculum";

test("Film Constraint evaluation locks roll ISO and accepts multiple solutions", () => {
  expect(evaluateFilmConstraint({ aperture: 4, shutter: 60, iso: 400 }, "depth")).toMatchObject({
    exposure: { status: "Achieved" }, filmSpeed: { status: "Achieved" }, intention: { status: "Achieved" },
  });
  expect(evaluateFilmConstraint({ aperture: 5.6, shutter: 30, iso: 400 }, "depth")).toMatchObject({
    exposure: { status: "Achieved" }, filmSpeed: { status: "Achieved" }, intention: { status: "Achieved" },
  });
  expect(evaluateFilmConstraint({ aperture: 4, shutter: 250, iso: 800 }, "depth").filmSpeed).toMatchObject({ status: "Missed" });
  expect(evaluateFilmConstraint({ aperture: 2, shutter: 250, iso: 400 }, "motion")).toMatchObject({
    exposure: { status: "Achieved" }, filmSpeed: { status: "Achieved" }, intention: { status: "Achieved" },
  });
});

test("relevant Lessons validate authoritative film Curriculum Sources", () => {
  for (const lesson of [lessonTwo, lessonThree, lessonFour]) {
    expect(() => validateCurriculumSources(lesson.sources, lesson.slug)).not.toThrow();
    expect(lesson.sources.some(({ publisher }) => publisher === "Kodak")).toBe(true);
  }
  expect(() => validateCurriculumSources([{ title: "", publisher: "Unknown", url: "https://example.com" }], "Invalid Lesson")).toThrow(/Curriculum Sources/);
});

test("Lesson explains film speed and exposes authoritative film sources", async ({ page }) => {
  await page.goto("/lessons/iso-and-image-quality");
  await expect(page.getByRole("heading", { name: "Film speed is chosen for the roll" })).toBeVisible();
  await expect(page.getByText(/Digital ISO can change for every photograph/)).toBeVisible();
  await expect(page.getByText(/grain/i).first()).toBeVisible();
  const sources = page.locator("details.sources");
  await sources.getByText("Sources and further reading").click();
  await expect(sources.getByRole("link", { name: /Kodak.*guide/i })).toHaveAttribute("href", /^https:\/\/www\.kodak\.com\//);
});

test("Film Constraints lock ISO, evaluate tradeoffs, and restore unfinished choices", async ({ page }) => {
  await page.goto("/lessons/iso-and-image-quality");
  await expect(page.getByLabel("Depth Film Constraint ISO")).toBeDisabled();
  await expect(page.getByLabel("Depth Film Constraint ISO")).toHaveValue("400");
  await page.getByLabel("Depth Film Constraint aperture").selectOption("5.6");
  await page.getByLabel("Depth Film Constraint shutter speed").selectOption("30");
  await page.reload();
  await expect(page.getByLabel("Depth Film Constraint aperture")).toHaveValue("5.6");
  await expect(page.getByLabel("Depth Film Constraint shutter speed")).toHaveValue("30");
  await page.getByRole("button", { name: "Take depth Film Constraint photo" }).click();
  const feedback = page.getByRole("region", { name: "Depth Film Constraint feedback" });
  await expect(feedback).toContainText("Challenge complete");
  await expect(feedback).toContainText("fixed at ISO 400 across this roll");
});

test("Reference compares digital ISO with film speed", async ({ page }) => {
  await page.goto("/reference");
  const comparison = page.getByRole("table", { name: "Digital ISO and film speed comparison" });
  await expect(comparison).toContainText("Change for each photograph");
  await expect(comparison).toContainText("Fixed across the loaded roll");
});
