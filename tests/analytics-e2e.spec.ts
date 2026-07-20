import { expect, test } from "@playwright/test";

type CapturedEvent = { name: string; properties: Record<string, unknown> };

test("Lesson view and Challenge Attempt send validated, non-identifying analytics events", async ({ page }) => {
  const events: CapturedEvent[] = [];
  await page.route("**/analytics/events", async (route) => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ status: 204, body: "" });
  });

  await page.goto("/lessons/light-and-exposure");
  await expect.poll(() => events.some((event) => event.name === "lesson_viewed")).toBe(true);
  expect(events.find((event) => event.name === "lesson_viewed")).toEqual({ name: "lesson_viewed", properties: { lessonSlug: "light-and-exposure" } });

  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByText("Lesson complete")).toBeVisible();
  await expect.poll(() => events.some((event) => event.name === "challenge_attempted")).toBe(true);

  const attemptEvent = events.find((event) => event.name === "challenge_attempted");
  expect(attemptEvent?.properties).toEqual({
    lessonSlug: "light-and-exposure",
    challengeId: "balanced-still-life",
    sceneId: "neutral-still-life",
    criteria: [
      { criterionId: "usable-exposure", status: "Achieved" },
      { criterionId: "highlight-detail", status: "Achieved" },
    ],
    achieved: true,
  });

  const identifierPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const event of events) {
    for (const [key, value] of Object.entries(event.properties)) {
      if (key === "criteria" || typeof value === "boolean") continue;
      expect(value).toMatch(identifierPattern);
    }
  }
});

test("Sandbox scene selection is tracked as Sandbox use", async ({ page }) => {
  const events: CapturedEvent[] = [];
  await page.route("**/analytics/events", async (route) => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ status: 204, body: "" });
  });

  await page.goto("/sandbox");
  await expect.poll(() => events.some((event) => event.name === "sandbox_scene_viewed" && event.properties.sceneId === "neutral-still-life")).toBe(true);

  await page.getByRole("radio", { name: "Moving Cyclist" }).click();
  await expect.poll(() => events.some((event) => event.name === "sandbox_scene_viewed" && event.properties.sceneId === "moving-cyclist")).toBe(true);
});

test("a blocked analytics endpoint never breaks the Learning Loop", async ({ page }) => {
  await page.route("**/analytics/events", (route) => route.abort());

  await page.goto("/lessons/light-and-exposure");
  await page.getByLabel("Shutter speed").selectOption("125");
  await page.getByRole("button", { name: "Take photo" }).click();
  await expect(page.getByText("Criterion Status", { exact: true })).toBeVisible();
  await expect(page.getByText("Close", { exact: true }).first()).toBeVisible();
});
