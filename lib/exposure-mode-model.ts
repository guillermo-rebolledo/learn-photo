import type { ExposureSettings } from "./exposure-model";

export type ExposureMode = "Auto" | "P" | "A" | "S" | "M";
export type ExposureControl = keyof ExposureSettings;

type ExposureModeScene = {
  meterReference: ExposureSettings;
  limits: { [Control in ExposureControl]: readonly number[] };
};

type ResolveExposureModeInput = {
  mode: ExposureMode;
  selected: ExposureSettings;
  scene: ExposureModeScene;
  compensation: number;
  autoIso: boolean;
};

const modeControls: Record<ExposureMode, readonly ExposureControl[]> = {
  Auto: ["aperture", "shutter", "iso"],
  P: ["aperture", "shutter"],
  A: ["shutter"],
  S: ["aperture"],
  M: [],
};

function offsetFromReference(settings: ExposureSettings, reference: ExposureSettings) {
  return Math.log2((settings.iso / reference.iso) * (reference.shutter / settings.shutter) * ((reference.aperture / settings.aperture) ** 2));
}

function combinations(controls: readonly ExposureControl[], limits: ExposureModeScene["limits"]): Partial<ExposureSettings>[] {
  return controls.reduce<Partial<ExposureSettings>[]>((candidates, control) => candidates.flatMap((candidate) => limits[control].map((value) => ({ ...candidate, [control]: value }))), [{}]);
}

export function resolveExposureMode({ mode, selected, scene, compensation, autoIso }: ResolveExposureModeInput) {
  const cameraControls = [...modeControls[mode]];
  if (autoIso && !cameraControls.includes("iso")) cameraControls.push("iso");
  if (mode === "M" && !autoIso) {
    return { settings: selected, cameraControls, appliedCompensation: 0, atLimit: false };
  }

  const target = mode === "M" ? 0 : compensation;
  const candidates = combinations(cameraControls, scene.limits).map((choice) => {
    const settings = { ...selected, ...choice };
    const offset = offsetFromReference(settings, scene.meterReference);
    const distanceFromReference = cameraControls.reduce((total, control) => {
      if (control === "aperture") return total + Math.abs(Math.log2((settings.aperture / scene.meterReference.aperture) ** 2));
      if (control === "shutter") return total + Math.abs(Math.log2(settings.shutter / scene.meterReference.shutter));
      return total + Math.abs(Math.log2(settings.iso / scene.meterReference.iso));
    }, 0);
    return { settings, offset, error: Math.abs(offset - target), distanceFromReference };
  }).sort((a, b) => a.error - b.error || a.distanceFromReference - b.distanceFromReference || b.settings.shutter - a.settings.shutter);

  const resolved = candidates[0] ?? { settings: selected, offset: offsetFromReference(selected, scene.meterReference), error: 0 };
  const appliedCompensation = Math.round(resolved.offset * 100) / 100;
  return {
    settings: resolved.settings,
    cameraControls,
    appliedCompensation,
    atLimit: Math.abs(appliedCompensation - target) > 0.05,
  };
}
