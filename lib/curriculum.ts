import imageManifest from "@/public/images/manifest.json";

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

type LessonDefinition = { slug: string; sources: readonly CurriculumSource[] };
type PortraitScene = {
  id: string;
  sourceAsset: string;
  depthAssets: { background: string; subjectMask: string };
  assumptions: { format: string; focalLengthMm: number; focusDistanceM: number; stability: string; subjectMotion: string };
  meterReference: { aperture: number; shutter: number; iso: number };
  calibration: { shallowThrough: number; deepFrom: number; blurRadius: { shallow: number; moderate: number; deep: number }; representativeApertures: readonly number[] };
};
type PortraitChallenge = {
  id: string;
  lessonSlug: string;
  sceneId: string;
  photographicIntentions: Record<"soft-background" | "defined-background", { label: string; targetExposureStops: number }>;
  successCriteria: readonly SuccessCriterion[];
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

export const lessonThree = {
  slug: "aperture-and-depth-of-field",
  sources: [
    { title: "Understanding maximum aperture", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-maximum-aperture" },
    { title: "Depth of field", publisher: "Cambridge in Colour", url: "https://www.cambridgeincolour.com/tutorials/depth-of-field.htm" },
    { title: "Depth of field explained", publisher: "Canon", url: "https://www.canon-europe.com/get-inspired/tips-and-techniques/depth-of-field/" },
  ] satisfies CurriculumSource[],
} as const satisfies LessonDefinition;

export const lessonFive = {
  slug: "iso-and-image-quality",
  sources: [
    { title: "Understanding ISO sensitivity", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-iso-sensitivity" },
    { title: "ISO speed and exposure", publisher: "Canon", url: "https://www.canon-europe.com/pro/infobank/iso/" },
    { title: "Digital camera noise", publisher: "Cambridge in Colour", url: "https://www.cambridgeincolour.com/tutorials/image-noise.htm" },
  ] satisfies CurriculumSource[],
} as const satisfies LessonDefinition;

export const dimIndoorPerformanceScene = {
  id: "dim-indoor-performance",
  sourceAsset: "dim-indoor-performance-960.jpg",
  assumptions: { format: "full frame", focalLengthMm: 85, stability: "handheld", subjectMotion: "energetic performer" },
  meterReference: { aperture: 1.8, shutter: 250, iso: 800 },
  calibration: { noise: [{ iso: 100, opacity: 0 }, { iso: 800, opacity: 0.08 }, { iso: 3200, opacity: 0.17 }, { iso: 12800, opacity: 0.26 }], motionSafeShutter: 250 },
} as const;

export const lessonFiveChallenge = {
  id: "dim-performance-tradeoffs",
  lessonSlug: lessonFive.slug,
  sceneId: dimIndoorPerformanceScene.id,
  successCriteria: [
    { id: "usable-exposure", label: "Usable exposure", essential: true },
    { id: "intended-motion", label: "Intended motion", essential: true },
    { id: "iso-compatible-quality", label: "ISO-compatible image quality", essential: true },
  ],
} as const;

export const windowLightPortraitScene = {
  id: "window-light-portrait",
  sourceAsset: "window-light-portrait-960.jpg",
  depthAssets: { background: "window-light-portrait-960.jpg", subjectMask: "window-light-portrait-subject.svg" },
  assumptions: { format: "APS-C", focalLengthMm: 50, focusDistanceM: 2.2, stability: "handheld", subjectMotion: "still" },
  meterReference: { aperture: 5.6, shutter: 60, iso: 400 },
  calibration: { shallowThrough: 2.8, deepFrom: 8, blurRadius: { shallow: 14, moderate: 8, deep: 0 }, representativeApertures: [2, 5.6, 11] },
} as const satisfies PortraitScene;

export const lessonThreeChallenge = {
  id: "portrait-depth-intention",
  lessonSlug: lessonThree.slug,
  sceneId: windowLightPortraitScene.id,
  photographicIntentions: {
    "soft-background": { label: "Keep the portrait usable while strongly softening the room.", targetExposureStops: 0 },
    "defined-background": { label: "Keep the portrait usable while preserving the Source Photograph’s available background definition.", targetExposureStops: 0 },
  },
  successCriteria: [
    { id: "usable-exposure", label: "Usable exposure", essential: true, feedback: { achieved: "The portrait has usable exposure.", close: "The portrait is close to usable.", missed: "The portrait is not usable yet." } },
    { id: "intended-depth", label: "Intended depth of field", essential: true, feedback: { achieved: "The relative depth supports the intention.", close: "The depth is close to the intention.", missed: "The depth conflicts with the intention." } },
  ] satisfies SuccessCriterion[],
} as const satisfies PortraitChallenge;

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

function validateLessonThree() {
  const manifestSlugs = new Set(lessons.map(({ slug }) => slug));
  const sourceUrls = new Set(lessonThree.sources.map(({ url }) => url));
  const criterionIds = new Set(lessonThreeChallenge.successCriteria.map(({ id }) => id));
  const validSources = lessonThree.sources.every((source) => source.title.trim() && source.publisher.trim() && source.url.startsWith("https://"));
  const validCriteria = lessonThreeChallenge.successCriteria.every((criterion) => criterion.label.trim() && Object.values(criterion.feedback).every((text) => text.trim()));
  const validScene = windowLightPortraitScene.sourceAsset.endsWith(".jpg") && windowLightPortraitScene.depthAssets.subjectMask.endsWith(".svg") && windowLightPortraitScene.assumptions.focalLengthMm > 0 && windowLightPortraitScene.assumptions.focusDistanceM > 0 && windowLightPortraitScene.calibration.representativeApertures.length >= 3;
  const assetRecord = imageManifest.windowLightPortrait;
  const validAssets = assetRecord.file === windowLightPortraitScene.sourceAsset && assetRecord.depthAssets.some(({ file }) => file === windowLightPortraitScene.depthAssets.subjectMask) && assetRecord.photographer.trim() && assetRecord.sourceUrl.startsWith("https://") && assetRecord.licenseUrl.startsWith("https://");
  if (!manifestSlugs.has(lessonThreeChallenge.lessonSlug) || lessonThreeChallenge.sceneId !== windowLightPortraitScene.id || sourceUrls.size < 3 || sourceUrls.size !== lessonThree.sources.length || criterionIds.size !== 2 || !validSources || !validCriteria || !validScene || !validAssets) {
    throw new Error("Lesson 3 curriculum, Challenge, and calibrated depth assets must be complete.");
  }
}

function validateLessonFive() {
  const asset = imageManifest.dimIndoorPerformance;
  const sourceUrls = new Set(lessonFive.sources.map(({ url }) => url));
  if (!lessons.some(({ slug }) => slug === lessonFive.slug) || lessonFiveChallenge.sceneId !== dimIndoorPerformanceScene.id || sourceUrls.size < 3 || asset.file !== dimIndoorPerformanceScene.sourceAsset || !asset.photographer.trim() || !asset.sourceUrl.startsWith("https://") || !asset.licenseUrl.startsWith("https://") || asset.noiseAssets.length === 0 || dimIndoorPerformanceScene.calibration.noise.some(({ iso, opacity }) => iso <= 0 || opacity < 0)) {
    throw new Error("Lesson 5 curriculum, provenance, and calibrated noise assets must be complete.");
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
validateLessonThree();
validateLessonFive();
