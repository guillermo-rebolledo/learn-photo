import { expect, test } from "@playwright/test";
import { buildAnalyticsEvent } from "../lib/analytics-model";
import { dispatchAnalyticsEvent, noopAnalyticsProvider, setAnalyticsProvider, trackEvent, type AnalyticsProvider } from "../lib/analytics";

test.afterEach(() => {
  setAnalyticsProvider(noopAnalyticsProvider);
});

test("dispatch sends a built event to the active provider", () => {
  const sent: unknown[] = [];
  setAnalyticsProvider({ send: (event) => sent.push(event) });

  dispatchAnalyticsEvent(buildAnalyticsEvent("sandbox_scene_viewed", { sceneId: "neutral-still-life" }));

  expect(sent).toEqual([{ name: "sandbox_scene_viewed", properties: { sceneId: "neutral-still-life" } }]);
});

test("a throwing provider never propagates to the caller", () => {
  const provider: AnalyticsProvider = { send: () => { throw new Error("provider is down"); } };
  setAnalyticsProvider(provider);

  expect(() => dispatchAnalyticsEvent(buildAnalyticsEvent("sandbox_scene_viewed", { sceneId: "neutral-still-life" }))).not.toThrow();
});

test("trackEvent no-ops outside the browser instead of throwing", () => {
  const sent: unknown[] = [];
  setAnalyticsProvider({ send: (event) => sent.push(event) });

  expect(() => trackEvent("sandbox_scene_viewed", { sceneId: "neutral-still-life" })).not.toThrow();
  // This spec runs in Node, so `window` is undefined and trackEvent must no-op rather than reach the provider.
  expect(sent).toEqual([]);
});
