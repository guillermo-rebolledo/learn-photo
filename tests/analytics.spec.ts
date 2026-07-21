import { expect, test } from "@playwright/test";
import { buildAnalyticsEvent } from "../lib/analytics-model";
import { dispatchAnalyticsEvent, noopAnalyticsProvider, sameOriginEndpoint, setAnalyticsProvider, trackEvent, type AnalyticsProvider } from "../lib/analytics";

test.afterEach(() => {
  setAnalyticsProvider(noopAnalyticsProvider);
});

test("only same-origin endpoints are accepted, so credentials never leave the page origin", () => {
  const origin = "https://learn-photo.example";
  // Relative and same-host absolute endpoints resolve to the page origin and are allowed.
  expect(sameOriginEndpoint("/analytics/events", origin)).toBe("/analytics/events");
  expect(sameOriginEndpoint("https://learn-photo.example/collect", origin)).toBe("https://learn-photo.example/collect");
  // Absolute and protocol-relative cross-origin endpoints are refused.
  expect(sameOriginEndpoint("https://collector.other-site.example/collect", origin)).toBeNull();
  expect(sameOriginEndpoint("//evil.example/collect", origin)).toBeNull();
  expect(sameOriginEndpoint("http://learn-photo.example/collect", origin)).toBeNull();
});

test("dispatch drops an event mutated after it was built", () => {
  const sent: unknown[] = [];
  setAnalyticsProvider({ send: (event) => sent.push(event) });

  const event = buildAnalyticsEvent("sandbox_scene_viewed", { sceneId: "neutral-still-life" });
  (event.properties as { sceneId: string }).sceneId = "jane-doe";
  dispatchAnalyticsEvent(event);

  expect(sent).toEqual([]);
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
