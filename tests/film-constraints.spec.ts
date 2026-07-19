import { expect, test } from "@playwright/test";
import { evaluateFilmConstraint } from "../lib/film-model";
import { filmConstraintChallenges, lessonFour, lessonThree, lessonTwo, validateCurriculumSources, validateFilmChallengeShape } from "../lib/curriculum";

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

test("film curriculum validation enforces evaluator order and positional criterion IDs", () => {
  const challenges = Object.entries(filmConstraintChallenges).map(([key, challenge]) => ({ key, ...challenge }));
  expect(validateFilmChallengeShape(challenges)).toBe(true);
  expect(validateFilmChallengeShape([...challenges].reverse())).toBe(false);
  expect(validateFilmChallengeShape(challenges.map((challenge, index) => index === 0 ? { ...challenge, successCriteria: [...challenge.successCriteria].reverse() } : challenge))).toBe(false);
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

test("malformed saved Film Constraint feedback and Attempts are discarded", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("learn-photo-progress", JSON.stringify({
    filmConstraintFeedback: { depth: { exposure: { status: "Bogus" } } },
    filmConstraintPreviousFeedback: { motion: "invalid" },
    filmConstraintCurrentAttempts: { depth: { aperture: "wide", shutter: -1, iso: 800 } },
    filmConstraintPreviousAttempts: { motion: { aperture: null, shutter: 250, iso: 400 } },
  })));
  await page.goto("/lessons/iso-and-image-quality");
  await expect(page.getByRole("region", { name: "Depth Film Constraint feedback" })).toHaveCount(0);
  await expect(page.getByLabel("Depth Film Constraint aperture")).toHaveValue("4");
  await expect(page.getByTestId("depth-film-rendered-result")).toBeVisible();
});

test("changing Film Constraint controls clears completed feedback", async ({ page }) => {
  await page.goto("/lessons/iso-and-image-quality");
  await page.getByRole("button", { name: "Take depth Film Constraint photo" }).click();
  const feedback = page.getByRole("region", { name: "Depth Film Constraint feedback" });
  await expect(feedback).toContainText("Challenge complete");
  await page.getByLabel("Depth Film Constraint aperture").selectOption("2.8");
  await expect(feedback).toHaveCount(0);
});

test("Film Constraints remain usable when browser-local Progress writes are blocked", async ({ page }) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "learn-photo-progress" && value.includes("filmConstraintSettings")) throw new DOMException("Storage blocked", "SecurityError");
      return setItem.call(this, key, value);
    };
  });
  await page.goto("/lessons/iso-and-image-quality");
  await page.getByRole("button", { name: "Take depth Film Constraint photo" }).click();
  await expect(page.getByRole("region", { name: "Depth Film Constraint feedback" })).toContainText("Challenge complete");
});

test("Reference compares digital ISO with film speed", async ({ page }) => {
  await page.goto("/reference");
  const comparison = page.getByRole("table", { name: "Digital ISO and film speed comparison" });
  await expect(comparison).toContainText("Change for each photograph");
  await expect(comparison).toContainText("Fixed across the loaded roll");
});
