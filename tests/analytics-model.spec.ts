import { expect, test } from "@playwright/test";
import { analyticsEventCatalog, buildAnalyticsEvent } from "../lib/analytics-model";

test("builds a valid lesson_viewed event", () => {
  expect(buildAnalyticsEvent("lesson_viewed", { lessonSlug: "light-and-exposure" })).toEqual({
    name: "lesson_viewed",
    properties: { lessonSlug: "light-and-exposure" },
  });
});

test("builds a valid challenge_attempted event with criteria and achieved", () => {
  const event = buildAnalyticsEvent("challenge_attempted", {
    lessonSlug: "light-and-exposure",
    challengeId: "balanced-still-life",
    sceneId: "neutral-still-life",
    criteria: [{ criterionId: "usable-exposure", status: "Achieved" }, { criterionId: "highlight-detail", status: "Close" }],
    achieved: false,
  });
  expect(event.name).toBe("challenge_attempted");
});

test("builds a valid sandbox_scene_viewed event", () => {
  expect(buildAnalyticsEvent("sandbox_scene_viewed", { sceneId: "moving-cyclist" })).toEqual({
    name: "sandbox_scene_viewed",
    properties: { sceneId: "moving-cyclist" },
  });
});

test("rejects a property outside the event's allowlist", () => {
  expect(() => buildAnalyticsEvent("lesson_viewed", { lessonSlug: "light-and-exposure", learnerName: "Jane" } as never)).toThrow(/unexpected property/);
});

test("rejects a missing required property", () => {
  expect(() => buildAnalyticsEvent("challenge_attempted", { lessonSlug: "light-and-exposure" } as never)).toThrow(/missing required propert/);
});

test("rejects free-text values that could carry typed content or names", () => {
  expect(() => buildAnalyticsEvent("lesson_viewed", { lessonSlug: "My favorite lesson so far!" } as never)).toThrow(/canonical lowercase identifier/);
  expect(() => buildAnalyticsEvent("sandbox_scene_viewed", { sceneId: "jane.doe@example.com" } as never)).toThrow(/canonical lowercase identifier/);
});

test("rejects malformed criteria entries", () => {
  expect(() => buildAnalyticsEvent("challenge_attempted", {
    lessonSlug: "light-and-exposure",
    challengeId: "balanced-still-life",
    sceneId: "neutral-still-life",
    criteria: [{ criterionId: "usable-exposure", status: "Perfect" }],
    achieved: true,
  } as never)).toThrow(/criteria/);

  expect(() => buildAnalyticsEvent("challenge_attempted", {
    lessonSlug: "light-and-exposure",
    challengeId: "balanced-still-life",
    sceneId: "neutral-still-life",
    criteria: [{ criterionId: "usable-exposure", status: "Achieved", note: "left a comment" }],
    achieved: true,
  } as never)).toThrow(/criteria/);

  expect(() => buildAnalyticsEvent("challenge_attempted", {
    lessonSlug: "light-and-exposure",
    challengeId: "balanced-still-life",
    sceneId: "neutral-still-life",
    criteria: [],
    achieved: true,
  } as never)).toThrow(/criteria/);
});

test("rejects an unknown event name", () => {
  expect(() => buildAnalyticsEvent("learner_identified" as never, {} as never)).toThrow(/Unknown analytics event/);
});

test("the privacy-facing catalog documents exactly the properties every event accepts", () => {
  const samples = {
    lesson_viewed: { lessonSlug: "light-and-exposure" },
    challenge_attempted: { lessonSlug: "light-and-exposure", challengeId: "balanced-still-life", sceneId: "neutral-still-life", criteria: [{ criterionId: "usable-exposure", status: "Achieved" as const }], achieved: true },
    sandbox_scene_viewed: { sceneId: "moving-cyclist" },
  };
  expect(analyticsEventCatalog.map((entry) => entry.name).sort()).toEqual(Object.keys(samples).sort());
  for (const entry of analyticsEventCatalog) {
    expect(Object.keys(samples[entry.name]).sort()).toEqual([...entry.properties].sort());
    expect(() => buildAnalyticsEvent(entry.name, samples[entry.name] as never)).not.toThrow();
  }
});
