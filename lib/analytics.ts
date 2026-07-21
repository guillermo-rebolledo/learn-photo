import { buildAnalyticsEvent, type AnalyticsEvent, type AnalyticsEventName, type AnalyticsEventProperties } from "./analytics-model";

export type AnalyticsProvider = { send(event: AnalyticsEvent): void };

export const noopAnalyticsProvider: AnalyticsProvider = { send() {} };

const defaultEndpoint = "/analytics/events";

/** Returns `endpoint` only when it resolves to `origin`; a cross-origin endpoint returns null so the Learner's credentials never leave the page's origin. */
export function sameOriginEndpoint(endpoint: string, origin: string): string | null {
  try {
    return new URL(endpoint, origin).origin === origin ? endpoint : null;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget beacon delivery; sendBeacon never reports delivery back to the caller, which is what
 * keeps this non-blocking. sendBeacon sends credentials, so a cross-origin endpoint is refused: analytics
 * must never carry the Learner's cookies to another origin.
 */
export function createBeaconAnalyticsProvider(endpoint: string = defaultEndpoint): AnalyticsProvider {
  return {
    send(event) {
      if (typeof window === "undefined" || typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return;
      const target = sameOriginEndpoint(endpoint, window.location.origin);
      if (!target) return;
      navigator.sendBeacon(target, new Blob([JSON.stringify(event)], { type: "application/json" }));
    },
  };
}

let activeProvider: AnalyticsProvider = typeof window === "undefined"
  ? noopAnalyticsProvider
  : createBeaconAnalyticsProvider(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || defaultEndpoint);

export function setAnalyticsProvider(provider: AnalyticsProvider) {
  activeProvider = provider;
}

/**
 * Revalidates an event at the provider boundary and forwards only a fresh, normalized copy, so a
 * mutated or `any`-cast event cannot reach a provider. Provider failure is swallowed so analytics never
 * affects the Learning Loop, Progress, or rendering.
 */
export function dispatchAnalyticsEvent(event: AnalyticsEvent) {
  let validated: AnalyticsEvent;
  try {
    validated = buildAnalyticsEvent(event.name, event.properties as never);
  } catch {
    return;
  }
  try {
    activeProvider.send(validated);
  } catch {
    // A failing or blocked provider must never affect the Learning Loop, Progress, or rendering.
  }
}

/** Sends a curriculum analytics event. No-ops outside the browser; validation happens at the dispatch boundary and never throws. */
export function trackEvent<K extends AnalyticsEventName>(name: K, properties: AnalyticsEventProperties[K]) {
  if (typeof window === "undefined") return;
  dispatchAnalyticsEvent({ name, properties } as AnalyticsEvent);
}
