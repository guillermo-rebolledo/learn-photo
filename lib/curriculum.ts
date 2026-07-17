type Lesson = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  time: `${number} min`;
};

export type CurriculumSource = {
  title: string;
  publisher: string;
  url: `https://${string}`;
};

type SuccessCriterion = {
  id: string;
  label: string;
  essential: boolean;
  feedback: { achieved: string; close: string; missed: string };
};

export const lessonOne = {
  slug: "light-and-exposure",
  sources: [
    { title: "Understanding ISO sensitivity", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-iso-sensitivity" },
    { title: "Exposure", publisher: "Cambridge in Colour", url: "https://www.cambridgeincolour.com/tutorials/camera-exposure.htm" },
  ] satisfies CurriculumSource[],
} as const;

export const lessonTwo = {
  slug: "stops-and-equivalent-exposures",
  sources: [
    { title: "Understanding shutter speed", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-shutter-speed" },
    { title: "Understanding maximum aperture", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-maximum-aperture" },
    { title: "ISO speed and exposure", publisher: "Canon", url: "https://www.canon-europe.com/pro/infobank/iso/" },
  ] satisfies CurriculumSource[],
} as const;

export const neutralStillLifeScene = {
  id: "neutral-still-life",
  sourceAsset: "neutral-still-life-960.jpg",
  highlightMask: "neutral-still-life-highlights.svg",
  assumptions: { focalLengthMm: 28, focusDistanceM: 1.2, stability: "handheld", subjectMotion: "still" },
  meterReference: { aperture: 5.6, shutter: 60, iso: 400 },
  calibration: {
    achievedWithinStops: 0.35,
    closeWithinStops: 1.1,
    rendering: { minBrightness: 0.28, maxBrightness: 2.3, maxHighlightOpacity: 0.72, highlightOpacityPerStop: 0.36 },
  },
} as const;

export const lessonTwoChallenge = {
  id: "equivalent-still-life",
  lessonSlug: lessonTwo.slug,
  sceneId: neutralStillLifeScene.id,
  referenceSettings: { aperture: 4, shutter: 125, iso: 400 },
  equivalentWithinStops: 0.12,
  photographicIntention: "Preserve the reference brightness with a different settings combination.",
  successCriteria: [{
    id: "equivalent-brightness",
    label: "Equivalent brightness",
    essential: true,
    feedback: {
      achieved: "The opposite Stop changes preserve the reference brightness.",
      close: "The result is close to the reference; one smaller opposite adjustment can balance it.",
      missed: "The changes do not balance yet; offset brighter Stops with darker Stops.",
    },
  }] satisfies SuccessCriterion[],
} as const;

export const lessonOneCriteria = {
  usableExposure: {
    id: "usable-exposure",
    feedback: {
      achieved: "The tabletop tones remain clear and natural for this Photographic Intention.",
      darker: "The scene is darker than intended. Use a slower shutter, wider aperture, or higher ISO.",
      brighter: "The scene is brighter than intended. Use a faster shutter, narrower aperture, or lower ISO.",
    },
  },
  highlightDetail: {
    id: "highlight-detail",
    achievedLimitStops: 0.35,
    feedback: {
      achieved: "The window-side highlights retain useful detail.",
      compromised: "Bright objects are losing separation. Reduce Rendered Brightness to protect them.",
    },
  },
} as const;

export const lessonOneChallenge = {
  id: "balanced-still-life",
  lessonSlug: lessonOne.slug,
  sceneId: neutralStillLifeScene.id,
  photographicIntention: "Keep the tabletop tones natural while preserving the bright window-side objects.",
  successCriteria: [lessonOneCriteria.usableExposure, lessonOneCriteria.highlightDetail] as const,
} as const;

function validateLessonOne() {
  const sourceUrls = new Set(lessonOne.sources.map(({ url }) => url));
  const manifestSlugs = new Set(lessons.map(({ slug }) => slug));
  if (lessonOne.sources.length < 2 || sourceUrls.size !== lessonOne.sources.length || lessonOne.sources.some((source) => !source.title.trim() || !source.publisher.trim() || !source.url.startsWith("https://"))) {
    throw new Error("Lesson 1 requires repository-managed explanation and at least two secure Curriculum Sources.");
  }
  const criterionIds = new Set(lessonOneChallenge.successCriteria.map(({ id }) => id));
  if (!manifestSlugs.has(lessonOneChallenge.lessonSlug) || lessonOneChallenge.sceneId !== neutralStillLifeScene.id || criterionIds.size !== 2 || criterionIds.size !== lessonOneChallenge.successCriteria.length) {
    throw new Error("Lesson 1 Challenge relationships are inconsistent.");
  }
}

function validateLessonTwo() {
  const sourceUrls = new Set(lessonTwo.sources.map(({ url }) => url));
  const manifestSlugs = new Set(lessons.map(({ slug }) => slug));
  if (lessonTwo.sources.length < 2 || sourceUrls.size !== lessonTwo.sources.length || lessonTwo.sources.some((source) => !source.title.trim() || !source.publisher.trim() || !source.url.startsWith("https://"))) {
    throw new Error("Lesson 2 requires at least two secure Curriculum Sources.");
  }
  const criterionIds = new Set(lessonTwoChallenge.successCriteria.map(({ id }) => id));
  if (!manifestSlugs.has(lessonTwoChallenge.lessonSlug) || lessonTwoChallenge.sceneId !== neutralStillLifeScene.id || criterionIds.size !== lessonTwoChallenge.successCriteria.length || lessonTwoChallenge.successCriteria.some(({ feedback }) => Object.values(feedback).some((text) => !text.trim()))) {
    throw new Error("Lesson 2 Challenge relationships are inconsistent.");
  }
}

function defineLearningPath<const T extends readonly Lesson[]>(items: T): T {
  const slugs = new Set(items.map(({ slug }) => slug));
  const numbers = new Set(items.map(({ number }) => number));
  if (items.length !== 8 || slugs.size !== items.length || numbers.size !== items.length) {
    throw new Error("Learning Path must contain eight uniquely numbered Lessons with unique routes.");
  }
  return items;
}

export const lessons = defineLearningPath([
  { slug: "light-and-exposure", number: "01", title: "Light and exposure", summary: "See how a photograph begins with captured light.", time: "7 min" },
  { slug: "stops-and-equivalent-exposures", number: "02", title: "Stops and equivalent exposures", summary: "Reason in simple doublings and halvings.", time: "8 min" },
  { slug: "aperture-and-depth-of-field", number: "03", title: "Aperture and depth of field", summary: "Shape light and background definition.", time: "9 min" },
  { slug: "shutter-speed-and-motion", number: "04", title: "Shutter speed and motion", summary: "Freeze movement or let it flow.", time: "9 min" },
  { slug: "iso-and-image-quality", number: "05", title: "ISO and image quality", summary: "Lift rendered brightness and weigh the tradeoff.", time: "8 min" },
  { slug: "meter-and-histogram", number: "06", title: "Meter and Histogram", summary: "Read evidence without treating it as an answer.", time: "10 min" },
  { slug: "exposure-modes", number: "07", title: "Exposure modes", summary: "Decide which choices belong to you or the Camera.", time: "9 min" },
  { slug: "choosing-settings", number: "08", title: "Choosing settings for an intention", summary: "Bring every Exposure Control together.", time: "10 min" },
] as const);

validateLessonOne();
validateLessonTwo();
