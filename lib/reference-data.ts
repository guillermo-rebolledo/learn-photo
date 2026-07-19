import imageManifest from "@/public/images/manifest.json";
import {
  lessonFive,
  lessonFour,
  lessonOne,
  lessonSeven,
  lessonSix,
  lessonThree,
  lessonTwo,
  lessons,
} from "@/lib/curriculum";

export type ReferenceTerm = {
  name: string;
  definition: string;
  keywords: string;
};

export const referenceTerms: readonly ReferenceTerm[] = [
  { name: "Attempt", definition: "Exposure choices deliberately submitted with Take photo, after which feedback appears and a later retry can be compared.", keywords: "challenge submission retry" },
  { name: "Auto ISO", definition: "An optional digital-Camera behavior that lets the Camera select ISO within configured limits.", keywords: "automatic sensitivity" },
  { name: "Available Light", definition: "The light already present in a Curated Scene. The Learner responds to it with Camera settings.", keywords: "illumination scene" },
  { name: "Beginner Scale", definition: "A full-stop scale used early so doubling, halving, and equivalent settings are easy to see.", keywords: "full stop controls" },
  { name: "Camera Scale", definition: "A third-stop scale like the finer increments commonly available on a Camera.", keywords: "third stop controls" },
  { name: "Captured Light", definition: "Light recorded by the sensor or film. Scene light, aperture, and shutter speed determine it; ISO does not.", keywords: "exposure aperture shutter" },
  { name: "Clipping", definition: "Tones recorded at the darkest or brightest limit, where distinguishable detail may be lost.", keywords: "histogram shadow highlight detail" },
  { name: "Criterion Status", definition: "The assessment of one Success Criterion: Achieved, Close, or Missed.", keywords: "challenge feedback" },
  { name: "Conceptual Simulator", definition: "An educational approximation of important exposure relationships, not an emulator of a particular Camera.", keywords: "simulation" },
  { name: "Curated Scene", definition: "A prepared photographic situation used to explore exposure and visible tradeoffs under fixed conditions.", keywords: "photograph simulation" },
  { name: "Curriculum Source", definition: "An authoritative reference supporting a technical claim in a Lesson or Challenge.", keywords: "citation further reading" },
  { name: "Digital-First Model", definition: "The main teaching model, where ISO can change for each photograph while film differences are taught explicitly.", keywords: "sensor film iso" },
  { name: "Exposure Compensation", definition: "An instruction to an automatic or priority Exposure Mode to render lighter or darker than the Meter Reference.", keywords: "ev brighter darker mode" },
  { name: "Exposure Control", definition: "Aperture, shutter speed, or ISO when deliberately adjusted to influence exposure and the resulting image.", keywords: "settings aperture shutter iso" },
  { name: "Exposure Mode", definition: "The division of responsibility between Learner and Camera for selecting aperture and shutter speed.", keywords: "auto program aperture priority shutter priority manual" },
  { name: "Film Constraint", definition: "A Challenge where ISO is fixed by the selected film speed, leaving aperture and shutter speed to balance.", keywords: "roll analog iso" },
  { name: "Histogram", definition: "A graph of image tones from darker values on the left to brighter values on the right. Its shape describes, but does not grade, an image.", keywords: "luminance graph tones" },
  { name: "Learner", definition: "A beginner building an understanding of Camera fundamentals and deliberate control.", keywords: "beginner" },
  { name: "Learning Loop", definition: "A concise explanation, guided simulation, Challenge, and immediate feedback repeated as a learning sequence.", keywords: "experiment challenge feedback" },
  { name: "Learning Path", definition: "The recommended order of Lessons and Challenges, without locking access to other content or the Sandbox.", keywords: "lesson order progress" },
  { name: "Lesson", definition: "A short unit that introduces one Exposure Fundamentals concept through explanation, guided experiment, and Challenges.", keywords: "learning unit" },
  { name: "Meter Reference", definition: "The Camera meter’s estimate for rendering the measured scene near neutral. It is evidence, not the definition of a correct image.", keywords: "meter exposure neutral" },
  { name: "Progress", definition: "The browser-local record of completed Lessons and Challenges and the recommended next Learning Path step.", keywords: "completion saved" },
  { name: "Photographic Intention", definition: "The visible result a Challenge asks for, such as freezing motion or preserving depth of field.", keywords: "challenge result" },
  { name: "Rendered Brightness", definition: "How light or dark the result appears after sensor or film response and processing, including ISO’s influence.", keywords: "iso appearance" },
  { name: "Rendered Result", definition: "The deterministic simulated photograph produced from a Curated Scene, its assumptions, and current exposure choices.", keywords: "simulation output" },
  { name: "Reference", definition: "A concise collection of definitions and quick tables available outside the Learning Path.", keywords: "glossary sources credits tables" },
  { name: "Sandbox", definition: "An unrestricted simulation where the Learner can vary Exposure Controls outside a prescribed Challenge.", keywords: "explore controls" },
  { name: "Scene Assumptions", definition: "Fixed format, focal length, focus distance, Camera stability, and subject behavior that shape a Curated Scene.", keywords: "conditions" },
  { name: "Source Photograph", definition: "A real, licensed photograph used to derive a Curated Scene, with creator and usage rights recorded.", keywords: "credit license provenance" },
  { name: "Stop", definition: "A relative unit for doubling or halving. Aperture and shutter change Captured Light; ISO changes rendered response.", keywords: "double half exposure" },
  { name: "Success Criterion", definition: "One independently evaluated quality of a Challenge result, such as usable exposure or intended motion.", keywords: "challenge requirement" },
  { name: "Tradeoff Feedback", definition: "An explanation of which Success Criteria were met and how changing one Exposure Control affects the others.", keywords: "challenge explanation" },
  { name: "Camera", definition: "A film or digital photographic Camera whose settings can be deliberately controlled by the Learner.", keywords: "photographic equipment" },
  { name: "Challenge", definition: "A prompt to choose settings for a stated Photographic Intention in a Curated Scene.", keywords: "assessment settings" },
  { name: "Exposure Fundamentals", definition: "The learning scope covering light, Stops, Exposure Controls, metering, Histograms, Exposure Modes, and equivalent exposures.", keywords: "learning scope" },
  { name: "Exposure Triangle", definition: "Familiar shorthand for aperture, shutter speed, and ISO, acknowledged without treating the three as physically equivalent.", keywords: "controls shorthand" },
  { name: "Capstone", definition: "The minimally guided conclusion of the Learning Path, combining motion, depth-of-field, low-light, and a Film Constraint.", keywords: "final challenge" },
  { name: "Bulb Exposure", definition: "A Night Sky bonus setting that holds the simulated shutter open beyond the standard 30-second limit.", keywords: "long shutter night" },
] as const;

const lessonDefinitions = [lessonOne, lessonTwo, lessonThree, lessonFour, lessonFive, lessonSix, lessonSeven] as const;

export const curriculumSourceGroups = lessonDefinitions.map((lesson) => ({
  lesson: lessons.find(({ slug }) => slug === lesson.slug)?.title ?? lesson.slug,
  slug: lesson.slug,
  sources: lesson.sources,
}));

export const sourcePhotographs = Object.values(imageManifest);

export function validateReferenceData() {
  const lessonSlugs = new Set(curriculumSourceGroups.map(({ slug }) => slug));
  const validSources = curriculumSourceGroups.length === lessonDefinitions.length
    && lessonSlugs.size === curriculumSourceGroups.length
    && curriculumSourceGroups.every(({ sources }) => sources.length >= 2 && sources.every(({ title, publisher, url }) => title.trim() && publisher.trim() && url.startsWith("https://")));
  const validPhotographs = sourcePhotographs.length > 0 && sourcePhotographs.every((asset) => asset.file.trim()
    && asset.photographer.trim()
    && asset.sourceUrl.startsWith("https://")
    && asset.license.trim()
    && asset.licenseUrl.startsWith("https://")
    && /^\d{4}-\d{2}-\d{2}$/.test(asset.downloadDate)
    && /^\d{4}-\d{2}-\d{2}$/.test(asset.licenseVerifiedDate)
    && asset.modifications.trim());
  const validTerms = referenceTerms.length > 0 && new Set(referenceTerms.map(({ name }) => name)).size === referenceTerms.length
    && referenceTerms.every(({ name, definition }) => name.trim() && definition.trim());

  if (!validSources || !validPhotographs || !validTerms) throw new Error("Reference terms, Curriculum Sources, and Source Photograph provenance must be complete.");
}

validateReferenceData();
