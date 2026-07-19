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
type CyclistScene = {
  id: string;
  sourceAsset: string;
  motionAssets: readonly { file: string; role: string }[];
  assumptions: { focalLengthMm: number; stability: string; subjectMotion: string; panning: string };
  meterReference: { aperture: number; shutter: number; iso: number };
  calibration: { motion: { frozenFrom: number; flowingThrough: number; offsets: { frozen: number; trace: number; flowing: number }; representativeShutters: readonly number[] }; exposure: { achievedWithinStops: number; closeWithinStops: number } };
};
type MeteringSceneDefinition<Id extends string> = {
  id: Id;
  name: string;
  sourceAsset: string;
  assumptions: { focalLengthMm: number; stability: string; subjectMotion: string; fixedIso: number };
  meterReference: { aperture: number; shutter: number; iso: number };
  controls: { aperture: readonly number[]; shutter: readonly number[]; iso: readonly [number] };
  calibration: {
    sourceRenderingOffset: number;
    intendedOffset: { achievedFrom: number; achievedThrough: number; closeFrom: number; closeThrough: number };
    fallbackLuminances: readonly number[];
    detail: {
      achievedHighlightClippingThrough: number;
      closeHighlightClippingThrough: number;
      achievedShadowClippingThrough?: number;
      closeShadowClippingThrough?: number;
    };
    representativeOffsets: readonly number[];
  };
};
type ChallengeDefinition<SceneId extends string> = {
  id: string;
  lessonSlug: string;
  sceneId: SceneId;
  photographicIntention: string;
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

export const lessonFour = {
  slug: "shutter-speed-and-motion",
  sources: [
    { title: "Understanding shutter speed", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-shutter-speed" },
    { title: "Shutter speed", publisher: "Canon", url: "https://www.canon-europe.com/get-inspired/tips-and-techniques/shutter-speed/" },
    { title: "Camera shake and shutter speed", publisher: "Cambridge in Colour", url: "https://www.cambridgeincolour.com/tutorials/camera-shake.htm" },
  ] satisfies CurriculumSource[],
} as const satisfies LessonDefinition;

export const lessonFourControls = {
  aperture: [4, 5.6, 8, 11],
  shutter: [30, 60, 125, 250, 500, 1000],
  iso: [100, 200, 400, 800, 1600],
} as const;

export const movingCyclistScene = {
  id: "moving-cyclist",
  sourceAsset: "moving-cyclist-960.jpg",
  motionAssets: [{ file: "moving-cyclist-subject.svg", role: "source-derived cyclist mask for calibrated directional motion echoes" }],
  assumptions: { focalLengthMm: 85, stability: "stable support", subjectMotion: "cyclist crossing left to right at a steady pace", panning: "Camera remains fixed" },
  meterReference: { aperture: 5.6, shutter: 125, iso: 400 },
  calibration: { motion: { frozenFrom: 500, flowingThrough: 60, offsets: { frozen: 0, trace: 16, flowing: 32 }, representativeShutters: [30, 125, 1000] }, exposure: { achievedWithinStops: 0.4, closeWithinStops: 1.1 } },
} as const satisfies CyclistScene;

const cyclistCriteria = [
  { id: "usable-exposure", label: "Usable exposure", essential: true, feedback: { achieved: "The cyclist and road remain within this scene’s usable exposure range.", close: "The exposure is close, with a noticeable compromise.", missed: "The exposure falls outside the scene’s usable range." } },
  { id: "intended-motion", label: "Intended motion rendering", essential: true, feedback: { achieved: "The motion rendering supports the selected Photographic Intention.", close: "The motion is recognizable but only partly supports the intention.", missed: "The motion rendering conflicts with the selected intention." } },
] as const satisfies readonly SuccessCriterion[];

export const lessonFourChallenges = {
  freeze: { id: "freeze-moving-cyclist", label: "Freeze the cyclist", photographicIntention: "Hold the cyclist with little visible directional travel.", successCriteria: cyclistCriteria },
  "express-motion": { id: "express-cyclist-motion", label: "Express the cyclist’s motion", photographicIntention: "Let directional travel communicate the cyclist’s movement.", successCriteria: cyclistCriteria },
} as const;

export const lessonFive = {
  slug: "iso-and-image-quality",
  sources: [
    { title: "Understanding ISO sensitivity", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-iso-sensitivity" },
    { title: "ISO speed and exposure", publisher: "Canon", url: "https://www.canon-europe.com/pro/infobank/iso/" },
    { title: "Digital camera noise", publisher: "Cambridge in Colour", url: "https://www.cambridgeincolour.com/tutorials/image-noise.htm" },
  ] satisfies CurriculumSource[],
} as const satisfies LessonDefinition;

export const lessonSix = {
  slug: "meter-and-histogram",
  sources: [
    { title: "Exposure Indicator and Exposure Compensation", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/photography-glossary" },
    { title: "Tips for Shooting in Cold Weather", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/tips-for-shooting-in-cold-weather" },
    { title: "EOS-1Ds Mark III instruction manual: brightness Histogram", publisher: "Canon", url: "https://files.canon-europe.com/files/soft31355/Manual/CUG_EOS1DsMKIII_EN_Flat.pdf" },
    { title: "Using the Highlight-Weighted Metering Mode", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/products-and-innovation/using-the-highlight-weighted-metering-mode" },
  ] satisfies CurriculumSource[],
} as const satisfies LessonDefinition;

export const lessonSeven = {
  slug: "exposure-modes",
  sources: [
    { title: "Camera modes", publisher: "Nikon", url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/camera-modes" },
    { title: "Exposure compensation", publisher: "Canon", url: "https://www.canon-europe.com/get-inspired/tips-and-techniques/exposure-compensation/" },
    { title: "Auto ISO sensitivity control", publisher: "Nikon", url: "https://onlinemanual.nikonimglib.com/z7II_z6II/en/09_menu_guide_03_05.html" },
  ] satisfies CurriculumSource[],
} as const satisfies LessonDefinition;

export const exposureModeScene = {
  id: movingCyclistScene.id,
  meterReference: movingCyclistScene.meterReference,
  limits: lessonFourControls,
} as const;

export const lessonSevenChallenge = {
  id: "exposure-mode-moving-cyclist",
  lessonSlug: lessonSeven.slug,
  sceneId: movingCyclistScene.id,
  photographicIntention: "Freeze the cyclist with usable exposure, regardless of which Exposure Mode divides the work.",
  successCriteria: lessonFourChallenges.freeze.successCriteria,
} as const satisfies ChallengeDefinition<typeof movingCyclistScene.id>;

export const dimIndoorPerformanceScene = {
  id: "dim-indoor-performance",
  sourceAsset: "dim-indoor-performance-960.jpg",
  assumptions: { format: "full frame", focalLengthMm: 85, stability: "handheld", subjectMotion: "energetic performer" },
  meterReference: { aperture: 1.8, shutter: 250, iso: 800 },
  calibration: { noise: [{ iso: 100, opacity: 0 }, { iso: 800, opacity: 0.08 }, { iso: 3200, opacity: 0.17 }, { iso: 12800, opacity: 0.26 }], motionSafeShutter: 250 },
} as const;

export const brightSnowScene = {
  id: "bright-snow",
  name: "Bright Snow",
  sourceAsset: "bright-snow-960.jpg",
  assumptions: { focalLengthMm: 27, stability: "handheld", subjectMotion: "still mountain landscape", fixedIso: 100 },
  meterReference: { aperture: 8, shutter: 250, iso: 100 },
  controls: { aperture: [4, 5.6, 8, 11], shutter: [60, 125, 250, 500, 1000], iso: [100] },
  calibration: {
    sourceRenderingOffset: 1,
    intendedOffset: { achievedFrom: 0.75, achievedThrough: 1.5, closeFrom: 0.25, closeThrough: 2 },
    fallbackLuminances: [110, 145, 170, 185, 195, 205, 215, 220, 225, 230, 232, 235, 238, 240, 244, 248, 250],
    detail: { achievedHighlightClippingThrough: 0.2, closeHighlightClippingThrough: 0.45 },
    representativeOffsets: [-1, 0, 1, 2],
  },
} as const satisfies MeteringSceneDefinition<"bright-snow">;

export const darkStageScene = {
  id: "dark-stage",
  name: "Dark Stage",
  sourceAsset: "dark-stage-960.jpg",
  assumptions: { focalLengthMm: 200, stability: "handheld", subjectMotion: "singer held within the scene’s 1/125s-or-faster range", fixedIso: 1600 },
  meterReference: { aperture: 2.8, shutter: 125, iso: 1600 },
  controls: { aperture: [2, 2.8, 4, 5.6], shutter: [125, 250, 500], iso: [1600] },
  calibration: {
    sourceRenderingOffset: -1,
    intendedOffset: { achievedFrom: -1.5, achievedThrough: -0.75, closeFrom: -2, closeThrough: -0.25 },
    fallbackLuminances: [0, 0, 1, 2, 4, 7, 10, 14, 20, 28, 38, 52, 72, 96, 130, 180, 232],
    detail: { achievedHighlightClippingThrough: 0.08, closeHighlightClippingThrough: 0.2, achievedShadowClippingThrough: 0.45, closeShadowClippingThrough: 0.65 },
    representativeOffsets: [-2, -1, 0, 1],
  },
} as const satisfies MeteringSceneDefinition<"dark-stage">;

export const meteringScenes = {
  [brightSnowScene.id]: brightSnowScene,
  [darkStageScene.id]: darkStageScene,
} as const;

export const lessonSixChallenges = {
  brightSnow: {
    id: "bright-snow-intention",
    lessonSlug: lessonSix.slug,
    sceneId: brightSnowScene.id,
    photographicIntention: "Keep the snowy landscape recognizably bright while watching for lost highlight detail.",
    successCriteria: [
      { id: "intended-tonal-rendering", label: "Bright Snow tonal rendering", essential: true, feedback: { achieved: "The snow remains intentionally bright without treating meter zero as the answer.", close: "The snow is close to its intended brightness, with a noticeable tonal compromise.", missed: "The snow is rendered against its naturally bright intention." } },
      { id: "highlight-detail", label: "Snow highlight detail", essential: true, feedback: { achieved: "The bright snow retains useful tonal separation.", close: "Some snow detail is compressed at the brightest limit.", missed: "Broad highlight Clipping removes too much distinguishable snow detail." } },
    ] satisfies SuccessCriterion[],
  } satisfies ChallengeDefinition<"bright-snow">,
  darkStage: {
    id: "dark-stage-intention",
    lessonSlug: lessonSix.slug,
    sceneId: darkStageScene.id,
    photographicIntention: "Keep the stage naturally dark while preserving the lit performer as the visual focus.",
    successCriteria: [
      { id: "intended-tonal-rendering", label: "Dark Stage tonal rendering", essential: true, feedback: { achieved: "The stage remains intentionally dark without treating meter zero as the answer.", close: "The stage is close to its intended darkness, with a noticeable tonal compromise.", missed: "The stage is rendered against its naturally dark intention." } },
      { id: "performer-separation", label: "Performer and stage detail", essential: true, feedback: { achieved: "The lit performer remains separated from the intentionally dark surround.", close: "Clipping compresses some performer or stage separation.", missed: "Clipping removes too much distinguishable performer or stage detail." } },
    ] satisfies SuccessCriterion[],
  } satisfies ChallengeDefinition<"dark-stage">,
} as const;

export const meteringChallenges = {
  [brightSnowScene.id]: lessonSixChallenges.brightSnow,
  [darkStageScene.id]: lessonSixChallenges.darkStage,
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

function validateLessonFour() {
  const assetRecord = imageManifest.movingCyclist;
  const challengeIds = Object.values(lessonFourChallenges).map(({ id }) => id);
  const validAssets = assetRecord.file === movingCyclistScene.sourceAsset
    && movingCyclistScene.motionAssets.every(({ file }) => assetRecord.motionAssets.some((asset) => asset.file === file))
    && assetRecord.photographer.trim() && assetRecord.sourceUrl.startsWith("https://") && assetRecord.licenseUrl.startsWith("https://");
  const validCalibration = movingCyclistScene.calibration.motion.representativeShutters.length >= 3
    && movingCyclistScene.calibration.motion.frozenFrom > movingCyclistScene.calibration.motion.flowingThrough;
  if (lessonFour.sources.length < 2 || new Set(lessonFour.sources.map(({ url }) => url)).size !== lessonFour.sources.length || new Set(challengeIds).size !== challengeIds.length || !validAssets || !validCalibration) {
    throw new Error("Lesson 4 curriculum, Challenges, and calibrated motion assets must be complete.");
  }
}

function validateLessonFive() {
  const asset = imageManifest.dimIndoorPerformance;
  const sourceUrls = new Set(lessonFive.sources.map(({ url }) => url));
  const noiseCalibration = dimIndoorPerformanceScene.calibration.noise;
  const validNoiseCalibration = noiseCalibration.length >= 2 && noiseCalibration.every(({ iso, opacity }, index, anchors) => Number.isFinite(iso) && Number.isFinite(opacity) && iso > 0 && opacity >= 0 && opacity <= 1 && (index === 0 || iso > anchors[index - 1].iso));
  if (!lessons.some(({ slug }) => slug === lessonFive.slug) || lessonFiveChallenge.sceneId !== dimIndoorPerformanceScene.id || sourceUrls.size < 3 || asset.file !== dimIndoorPerformanceScene.sourceAsset || !asset.photographer.trim() || !asset.sourceUrl.startsWith("https://") || !asset.licenseUrl.startsWith("https://") || asset.noiseAssets.length === 0 || !validNoiseCalibration) {
    throw new Error("Lesson 5 curriculum, provenance, and calibrated noise assets must be complete.");
  }
}

function validateLessonSix() {
  const scenes = [
    { scene: brightSnowScene, asset: imageManifest.brightSnow },
    { scene: darkStageScene, asset: imageManifest.darkStage },
  ];
  const validAssets = scenes.every(({ scene, asset }) => asset.file === scene.sourceAsset
    && asset.derivatives.length >= 2
    && asset.photographer.trim()
    && asset.sourceUrl.startsWith("https://")
    && asset.licenseUrl.startsWith("https://")
    && asset.licenseVerifiedDate === "2026-07-18");
  const validScenes = scenes.every(({ scene }) => {
    const detail = scene.calibration.detail;
    const validHighlightCalibration = Number.isFinite(detail.achievedHighlightClippingThrough)
      && Number.isFinite(detail.closeHighlightClippingThrough)
      && detail.achievedHighlightClippingThrough >= 0
      && detail.closeHighlightClippingThrough <= 1
      && detail.achievedHighlightClippingThrough < detail.closeHighlightClippingThrough;
    const validShadowCalibration = scene.id !== "dark-stage" || ("achievedShadowClippingThrough" in detail
      && "closeShadowClippingThrough" in detail
      && Number.isFinite(detail.achievedShadowClippingThrough)
      && Number.isFinite(detail.closeShadowClippingThrough)
      && detail.achievedShadowClippingThrough >= 0
      && detail.closeShadowClippingThrough <= 1
      && detail.achievedShadowClippingThrough < detail.closeShadowClippingThrough);
    return scene.id.trim()
    && scene.name.trim()
    && scene.assumptions.focalLengthMm > 0
    && scene.assumptions.stability.trim()
    && scene.assumptions.subjectMotion.trim()
    && scene.assumptions.fixedIso === scene.meterReference.iso
    && scene.controls.aperture.length >= 3
    && scene.controls.shutter.length >= 3
    && scene.controls.iso.length === 1
    && scene.controls.aperture.some((value) => value === scene.meterReference.aperture)
    && scene.controls.shutter.some((value) => value === scene.meterReference.shutter)
    && scene.controls.iso.some((value) => value === scene.meterReference.iso)
    && [...scene.controls.aperture, ...scene.controls.shutter, ...scene.controls.iso].every((value) => Number.isFinite(value) && value > 0)
    && scene.calibration.fallbackLuminances.length >= 16
    && scene.calibration.fallbackLuminances.every((value) => Number.isFinite(value) && value >= 0 && value <= 255)
    && scene.calibration.intendedOffset.closeFrom <= scene.calibration.intendedOffset.achievedFrom
    && scene.calibration.intendedOffset.achievedFrom < scene.calibration.intendedOffset.achievedThrough
    && scene.calibration.intendedOffset.achievedThrough <= scene.calibration.intendedOffset.closeThrough
    && validHighlightCalibration
    && validShadowCalibration
    && scene.calibration.representativeOffsets.length >= 3;
  });
  const validIntentions = Object.values(lessonSixChallenges).every((challenge) => challenge.lessonSlug === lessonSix.slug
    && challenge.photographicIntention.trim()
    && challenge.successCriteria.length >= 2
    && new Set(challenge.successCriteria.map(({ id }) => id)).size === challenge.successCriteria.length
    && challenge.successCriteria.every((criterion) => criterion.label.trim() && Object.values(criterion.feedback).every((text) => text.trim()))
    && scenes.some(({ scene }) => scene.id === challenge.sceneId));
  if (lessonSix.sources.length < 3 || new Set(lessonSix.sources.map(({ url }) => url)).size !== lessonSix.sources.length || !validAssets || !validScenes || !validIntentions) {
    throw new Error("Lesson 6 curriculum, metering scenes, provenance, and Challenges must be complete.");
  }
}

function validateLessonSeven() {
  const controls = exposureModeScene.limits;
  const validLimits = Object.values(controls).every((values) => values.length >= 3 && values.every((value) => Number.isFinite(value) && value > 0));
  const validCriteria = lessonSevenChallenge.successCriteria.length >= 2
    && new Set(lessonSevenChallenge.successCriteria.map(({ id }) => id)).size === lessonSevenChallenge.successCriteria.length
    && lessonSevenChallenge.successCriteria.every((criterion) => criterion.id.trim() && criterion.label.trim() && Object.values(criterion.feedback).every((text) => text.trim()));
  if (!lessons.some(({ slug }) => slug === lessonSeven.slug) || lessonSevenChallenge.lessonSlug !== lessonSeven.slug || !lessonSevenChallenge.id.trim() || !lessonSevenChallenge.photographicIntention.trim() || lessonSeven.sources.length < 3 || new Set(lessonSeven.sources.map(({ url }) => url)).size !== lessonSeven.sources.length || lessonSevenChallenge.sceneId !== movingCyclistScene.id || !validCriteria || !validLimits) {
    throw new Error("Lesson 7 Exposure Modes, sources, Curated Scene, and Challenge must be complete.");
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
validateLessonFour();
validateLessonFive();
validateLessonSix();
validateLessonSeven();
