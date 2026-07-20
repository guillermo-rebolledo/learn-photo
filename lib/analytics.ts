import { buildAnalyticsEvent, type AnalyticsEvent, type AnalyticsEventName, type AnalyticsEventProperties } from "./analytics-model";

export type AnalyticsProvider = { send(event: AnalyticsEvent): void };

export const noopAnalyticsProvider: AnalyticsProvider = { send() {} };

const defaultEndpoint = "/analytics/events";

/** Fire-and-forget beacon delivery; sendBeacon never reports delivery back to the caller, which is what keeps this non-blocking. */
export function createBeaconAnalyticsProvider(endpoint: string = defaultEndpoint): AnalyticsProvider {
  return {
    send(event) {
      if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return;
      navigator.sendBeacon(endpoint, new Blob([JSON.stringify(event)], { type: "application/json" }));
    },
  };
}

let activeProvider: AnalyticsProvider = typeof window === "undefined"
  ? noopAnalyticsProvider
  : createBeaconAnalyticsProvider(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || defaultEndpoint);

export function setAnalyticsProvider(provider: AnalyticsProvider) {
  activeProvider = provider;
}

/** Sends an already-validated event to the active provider, swallowing any provider failure so analytics never affects the Learning Loop. */
export function dispatchAnalyticsEvent(event: AnalyticsEvent) {
  try {
    activeProvider.send(event);
  } catch {
    // A failing or blocked provider must never affect the Learning Loop, Progress, or rendering.
  }
}

/** Validates and sends a curriculum analytics event. No-ops outside the browser and never throws. */
export function trackEvent<K extends AnalyticsEventName>(name: K, properties: AnalyticsEventProperties[K]) {
  if (typeof window === "undefined") return;
  try {
    dispatchAnalyticsEvent(buildAnalyticsEvent(name, properties));
  } catch {
    // A malformed event is dropped rather than breaking the caller.
  }
}
