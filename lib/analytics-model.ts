import type { CriterionStatus } from "./exposure-model";

export type AnalyticsEventProperties = {
  lesson_viewed: { lessonSlug: string };
  challenge_attempted: {
    lessonSlug: string;
    challengeId: string;
    sceneId: string;
    criteria: readonly { criterionId: string; status: CriterionStatus }[];
    achieved: boolean;
  };
  sandbox_scene_viewed: { sceneId: string };
};

export type AnalyticsEventName = keyof AnalyticsEventProperties;

export type AnalyticsEvent = {
  [K in AnalyticsEventName]: { name: K; properties: AnalyticsEventProperties[K] };
}[AnalyticsEventName];

const identifierPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const criterionStatuses: readonly CriterionStatus[] = ["Achieved", "Close", "Missed"];

const allowedProperties: { [K in AnalyticsEventName]: readonly string[] } = {
  lesson_viewed: ["lessonSlug"],
  challenge_attempted: ["lessonSlug", "challengeId", "sceneId", "criteria", "achieved"],
  sandbox_scene_viewed: ["sceneId"],
};

export const analyticsEventCatalog: readonly { name: AnalyticsEventName; purpose: string; properties: readonly string[] }[] = [
  { name: "lesson_viewed", purpose: "Shows which Lessons Learners reach, to measure Learning Path drop-off.", properties: allowedProperties.lesson_viewed },
  { name: "challenge_attempted", purpose: "Shows Lesson and Challenge progress and Success Criterion difficulty across Attempts.", properties: allowedProperties.challenge_attempted },
  { name: "sandbox_scene_viewed", purpose: "Shows which Curated Scenes Learners explore in the unrestricted Sandbox.", properties: allowedProperties.sandbox_scene_viewed },
];

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && identifierPattern.test(value);
}

function isValidCriteria(value: unknown): value is AnalyticsEventProperties["challenge_attempted"]["criteria"] {
  return Array.isArray(value) && value.length > 0 && value.every((criterion) => {
    if (!criterion || typeof criterion !== "object") return false;
    const keys = Object.keys(criterion);
    const candidate = criterion as { criterionId: unknown; status: unknown };
    return keys.length === 2
      && keys.every((key) => key === "criterionId" || key === "status")
      && isIdentifier(candidate.criterionId)
      && criterionStatuses.includes(candidate.status as CriterionStatus);
  });
}

/** Throws on any property outside the event's allowlist or shaped as free text, so typed content or identifying fields can never reach a provider. */
export function buildAnalyticsEvent<K extends AnalyticsEventName>(name: K, properties: AnalyticsEventProperties[K]): AnalyticsEvent {
  const allowed = allowedProperties[name];
  if (!allowed) throw new Error(`Unknown analytics event "${String(name)}".`);

  const keys = Object.keys(properties as object);
  const unexpected = keys.filter((key) => !allowed.includes(key));
  if (unexpected.length > 0) throw new Error(`Analytics event "${name}" contains unexpected propert${unexpected.length === 1 ? "y" : "ies"}: ${unexpected.join(", ")}.`);
  const missing = allowed.filter((key) => !keys.includes(key));
  if (missing.length > 0) throw new Error(`Analytics event "${name}" is missing required propert${missing.length === 1 ? "y" : "ies"}: ${missing.join(", ")}.`);

  const values = properties as Record<string, unknown>;
  for (const key of keys) {
    if (key === "criteria") {
      if (!isValidCriteria(values[key])) throw new Error(`Analytics event "${name}" property "criteria" must be a non-empty list of canonical criterion identifiers and statuses.`);
      continue;
    }
    if (typeof values[key] === "boolean") continue;
    if (!isIdentifier(values[key])) throw new Error(`Analytics event "${name}" property "${key}" must be a canonical lowercase identifier, not free text.`);
  }

  return { name, properties } as AnalyticsEvent;
}
