import type { CriterionStatus } from "./exposure-model";
import {
  lessons,
  lessonOneChallenge,
  lessonTwoChallenge,
  lessonThreeChallenge,
  lessonFourChallenges,
  lessonFiveChallenge,
  filmConstraintChallenges,
  lessonSixChallenges,
  lessonSevenChallenge,
  neutralStillLifeScene,
  windowLightPortraitScene,
  movingCyclistScene,
  dimIndoorPerformanceScene,
  brightSnowScene,
  darkStageScene,
} from "./curriculum";
import { capstoneChallengeIds } from "./capstone-model";

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

const criterionStatuses: readonly CriterionStatus[] = ["Achieved", "Close", "Missed"];

// The Night Sky bonus vocabulary is declared here rather than derived from night-sky-model, because that
// module imports image assets and cannot be loaded outside the Next bundler (e.g. in unit tests). The
// tests/analytics-e2e.spec.ts Night Sky case runs the real bonus in a browser and asserts these values
// stay in sync — an Attempt whose ids drifted from this registry would be rejected and never emitted.
const nightSkySurface = "night-sky";
const nightSkyChallengeIds = ["sharp", "trails"].map((intention) => `${nightSkySurface}-${intention}`);
const nightSkyCriterionIds = ["usable-exposure", "star-motion", "noise"];

// Registries of the only identifiers analytics is allowed to emit, derived from the domain model so
// they cannot drift from the curriculum. An event carrying anything else — including well-formatted
// but non-curriculum text — is rejected before it can reach a provider.
const curriculumChallenges: readonly { id: string; successCriteria: readonly { id: string }[] }[] = [
  lessonOneChallenge,
  lessonTwoChallenge,
  lessonThreeChallenge,
  lessonFourChallenges.freeze,
  lessonFourChallenges["express-motion"],
  lessonFiveChallenge,
  filmConstraintChallenges.depth,
  filmConstraintChallenges.motion,
  lessonSixChallenges.brightSnow,
  lessonSixChallenges.darkStage,
  lessonSevenChallenge,
];

const knownLessonSlugs = new Set<string>([...lessons.map((lesson) => lesson.slug), nightSkySurface]);
const knownSceneIds = new Set<string>([
  neutralStillLifeScene.id,
  windowLightPortraitScene.id,
  movingCyclistScene.id,
  dimIndoorPerformanceScene.id,
  brightSnowScene.id,
  darkStageScene.id,
  nightSkySurface,
]);
const knownChallengeIds = new Set<string>([
  ...curriculumChallenges.map((challenge) => challenge.id),
  ...Object.values(capstoneChallengeIds),
  ...nightSkyChallengeIds,
]);
const knownCriterionIds = new Set<string>([
  ...curriculumChallenges.flatMap((challenge) => challenge.successCriteria.map((criterion) => criterion.id)),
  ...nightSkyCriterionIds,
  // The optional "Image quality" Capstone Success Criterion is defined inside evaluateCapstone rather
  // than a static challenge object; tests/analytics-model.spec.ts guards it against drift.
  "image-quality",
]);

export const analyticsIdentifierRegistries = {
  lessonSlug: knownLessonSlugs,
  challengeId: knownChallengeIds,
  sceneId: knownSceneIds,
  criterionId: knownCriterionIds,
} as const;

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

function isKnown(registry: ReadonlySet<string>) {
  return (value: unknown): value is string => typeof value === "string" && registry.has(value);
}

const isKnownLessonSlug = isKnown(knownLessonSlugs);
const isKnownChallengeId = isKnown(knownChallengeIds);
const isKnownSceneId = isKnown(knownSceneIds);
const isKnownCriterionId = isKnown(knownCriterionIds);

function isValidCriteria(value: unknown): value is AnalyticsEventProperties["challenge_attempted"]["criteria"] {
  return Array.isArray(value) && value.length > 0 && value.every((criterion) => {
    if (!criterion || typeof criterion !== "object") return false;
    const keys = Object.keys(criterion);
    const candidate = criterion as { criterionId: unknown; status: unknown };
    return keys.length === 2
      && keys.every((key) => key === "criterionId" || key === "status")
      && isKnownCriterionId(candidate.criterionId)
      && criterionStatuses.includes(candidate.status as CriterionStatus);
  });
}

const propertyValidators: Record<string, (value: unknown) => boolean> = {
  lessonSlug: isKnownLessonSlug,
  challengeId: isKnownChallengeId,
  sceneId: isKnownSceneId,
  criteria: isValidCriteria,
  achieved: (value) => typeof value === "boolean",
};

function normalizeProperty(key: string, value: unknown): unknown {
  if (key !== "criteria") return value;
  return (value as AnalyticsEventProperties["challenge_attempted"]["criteria"]).map(({ criterionId, status }) => ({ criterionId, status }));
}

/**
 * Validates a curriculum analytics event against the domain identifier registries and returns a fresh,
 * normalized copy. Throws on any property outside the event's allowlist or on any value that is not a
 * recognized curriculum identifier, so names or typed content can never reach a provider — even if a
 * caller mutates the input afterwards, the returned copy is unaffected.
 */
export function buildAnalyticsEvent<K extends AnalyticsEventName>(name: K, properties: AnalyticsEventProperties[K]): AnalyticsEvent {
  const allowed = allowedProperties[name];
  if (!allowed) throw new Error(`Unknown analytics event "${String(name)}".`);

  const keys = Object.keys(properties as object);
  const unexpected = keys.filter((key) => !allowed.includes(key));
  if (unexpected.length > 0) throw new Error(`Analytics event "${name}" contains unexpected propert${unexpected.length === 1 ? "y" : "ies"}: ${unexpected.join(", ")}.`);
  const missing = allowed.filter((key) => !keys.includes(key));
  if (missing.length > 0) throw new Error(`Analytics event "${name}" is missing required propert${missing.length === 1 ? "y" : "ies"}: ${missing.join(", ")}.`);

  const values = properties as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!propertyValidators[key](values[key])) {
      if (key === "criteria") throw new Error(`Analytics event "${name}" property "criteria" must list recognized curriculum Success Criteria and Criterion Statuses.`);
      if (key === "achieved") throw new Error(`Analytics event "${name}" property "achieved" must be a boolean.`);
      throw new Error(`Analytics event "${name}" property "${key}" is not a recognized curriculum identifier.`);
    }
    normalized[key] = normalizeProperty(key, values[key]);
  }

  return { name, properties: normalized } as AnalyticsEvent;
}
