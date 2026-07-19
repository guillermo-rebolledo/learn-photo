import type { CriterionFeedback } from "./exposure-model";
import imageManifest from "@/public/images/manifest.json";
import sourceAsset from "@/public/images/night-sky-960.jpg";
import motionAsset from "@/public/images/night-sky-trails.svg";

export type NightSkyIntention = "sharp" | "trails";
export type NightSkySettings = { duration: 30 | 60 | 120 | 300 | 600; aperture: 2 | 2.8 | 4 | 5.6; iso: 200 | 400 | 800 | 1600 | 3200 };

export const bulbDurations = [30, 60, 120, 300, 600] as const;
export const nightSkyChallenges = {
  sharp: {
    title: "Hold stars relatively sharp",
    label: "Relatively sharp stars Challenge",
    intention: "Keep star motion restrained while preserving a usable night exposure.",
    defaults: { duration: 30, aperture: 2.8, iso: 3200 },
    criteria: [
      { id: "usable-exposure", essential: true },
      { id: "star-motion", essential: true },
      { id: "noise", essential: false },
    ],
  },
  trails: {
    title: "Draw deliberate star trails",
    label: "Deliberate star trails Challenge",
    intention: "Make extended star motion unmistakable while controlling exposure and noise.",
    defaults: { duration: 300, aperture: 4, iso: 400 },
    criteria: [
      { id: "usable-exposure", essential: true },
      { id: "star-motion", essential: true },
      { id: "noise", essential: false },
    ],
  },
} as const satisfies Record<NightSkyIntention, { title: string; label: string; intention: string; defaults: NightSkySettings; criteria: readonly { id: string; essential: boolean }[] }>;
export const nightSkyDefinition = {
  sceneId: "night-sky",
  sourceAsset: "night-sky-960.jpg",
  motionAsset: "night-sky-trails.svg",
  assumptions: { stability: "tripod", release: "remote or delayed", focus: "fixed manual focus", format: "full-frame", focalLengthMm: 24 },
  intentions: ["sharp", "trails"],
  successCriterionIds: ["usable-exposure", "star-motion", "noise"],
  representativeDurations: bulbDurations,
} as const;

export function validateNightSkyDefinition() {
  const asset = imageManifest.nightSky;
  const localFiles = new Set([asset.file, ...asset.derivatives.map(({ file }) => file), ...asset.motionAssets.map(({ file }) => file)]);
  const challengesValid = nightSkyDefinition.intentions.every((intention) => {
    const definition = nightSkyChallenges[intention];
    const evaluated = evaluateNightSky(intention, definition.defaults);
    return definition.title.trim() && definition.label.endsWith("Challenge") && definition.intention.trim() && evaluated.criteria.length === definition.criteria.length && evaluated.criteria.every((criterion, index) => criterion.id === definition.criteria[index].id && criterion.essential === definition.criteria[index].essential && criterion.result.explanation.trim());
  });
  if (sourceAsset.width !== 960 || motionAsset.width !== 960 || nightSkyDefinition.sourceAsset !== asset.file || !localFiles.has(nightSkyDefinition.motionAsset) || new Set(bulbDurations).size !== 5 || bulbDurations[0] !== 30 || bulbDurations[4] !== 600 || new Set(nightSkyDefinition.intentions).size !== 2 || new Set(nightSkyDefinition.successCriterionIds).size !== 3 || !asset.photographer.trim() || !asset.sourceUrl.startsWith("https://") || !asset.licenseVerifiedDate || !challengesValid) {
    throw new Error("Night Sky scene, provenance, calibrated motion asset, Bulb boundaries, and Challenges must be complete.");
  }
}

function criterion(status: CriterionFeedback["status"], explanation: string): CriterionFeedback {
  return { status, explanation };
}

export function nightSkyExposureStops(settings: NightSkySettings) {
  const reference = settings.duration / 30 * (2.8 / settings.aperture) ** 2 * (settings.iso / 3200);
  return Math.round(Math.log2(reference) * 10) / 10;
}

export function evaluateNightSky(intention: NightSkyIntention, settings: NightSkySettings) {
  const exposureStops = nightSkyExposureStops(settings);
  const exposure = Math.abs(exposureStops) <= 1
    ? criterion("Achieved", "Aperture, shutter duration, and ISO combine for usable Rendered Brightness.")
    : Math.abs(exposureStops) <= 2
      ? criterion("Close", `The result is ${exposureStops > 0 ? "bright" : "dark"}; rebalance aperture or ISO against the shutter duration.`)
      : criterion("Missed", `The result is much too ${exposureStops > 0 ? "bright" : "dark"}; rebalance aperture or ISO against the shutter duration.`);
  const motion = intention === "sharp"
    ? settings.duration === 30
      ? criterion("Achieved", "At this assumed 24 mm full-frame view, 30 seconds keeps star travel relatively restrained—not perfectly stationary.")
      : settings.duration === 60
        ? criterion("Close", "A one-minute duration makes star travel noticeable at this focal length.")
        : criterion("Missed", "This Bulb Exposure records obvious star motion, which conflicts with the relatively-sharp intention.")
    : settings.duration >= 300
      ? criterion("Achieved", `${settings.duration / 60} minutes records deliberate, clearly visible star trails.`)
      : settings.duration >= 120
        ? criterion("Close", "The trails are visible but short; a longer Bulb Exposure makes the intention clearer.")
        : criterion("Missed", "The duration is too short to make deliberate trails the dominant result.");
  const noise = settings.iso <= 800
    ? criterion("Achieved", "The restrained ISO keeps simulated noise comparatively low.")
    : settings.iso <= 3200
      ? criterion("Close", "The higher ISO supports shorter or narrower exposures but adds visible simulated noise.")
      : criterion("Missed", "The very high ISO produces pronounced simulated noise.");
  return {
    criteria: [
      { id: "usable-exposure", label: "Usable exposure", essential: true, result: exposure },
      { id: "star-motion", label: intention === "sharp" ? "Relatively sharp stars" : "Deliberate star trails", essential: true, result: motion },
      { id: "noise", label: "Noise tradeoff", essential: false, result: noise },
    ],
    complete: exposure.status === "Achieved" && motion.status === "Achieved",
    exposureStops,
    tradeoff: intention === "sharp"
      ? "There is no universal sharp-star limit: focal length, format, viewing size, direction in the sky, and tolerance for motion all matter. A wider aperture gathers more Captured Light; ISO raises Rendered Brightness with more noise."
      : "Longer shutter duration lengthens star motion and gathers more Captured Light. A narrower aperture or lower ISO can preserve Rendered Brightness, while lower ISO reduces noise.",
  };
}

validateNightSkyDefinition();
