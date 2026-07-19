import { expect, test } from "@playwright/test";
import { resolveExposureMode } from "../lib/exposure-mode-model";

const scene = {
  meterReference: { aperture: 5.6, shutter: 125, iso: 400 },
  limits: {
    aperture: [2.8, 4, 5.6, 8, 11],
    shutter: [30, 60, 125, 250, 500, 1000],
    iso: [100, 200, 400, 800, 1600, 3200],
  },
} as const;

test("each Exposure Mode preserves Learner controls and assigns only Camera controls", () => {
  const selected = { aperture: 2.8, shutter: 500, iso: 800 };

  expect(resolveExposureMode({ mode: "A", selected, scene, compensation: 0, autoIso: false })).toMatchObject({
    settings: { aperture: 2.8, shutter: 1000, iso: 800 },
    cameraControls: ["shutter"],
  });
  expect(resolveExposureMode({ mode: "S", selected, scene, compensation: 0, autoIso: false })).toMatchObject({
    settings: { aperture: 4, shutter: 500, iso: 800 },
    cameraControls: ["aperture"],
  });
  expect(resolveExposureMode({ mode: "M", selected, scene, compensation: 2, autoIso: false })).toMatchObject({
    settings: selected,
    cameraControls: [],
  });
});

test("Program and Auto resolve deterministically within scene limits", () => {
  const selected = { aperture: 2.8, shutter: 30, iso: 800 };
  const program = resolveExposureMode({ mode: "P", selected, scene, compensation: 0, autoIso: false });
  const automatic = resolveExposureMode({ mode: "Auto", selected, scene, compensation: 0, autoIso: false });

  expect(program.settings).toEqual({ aperture: 5.6, shutter: 250, iso: 800 });
  expect(program.cameraControls).toEqual(["aperture", "shutter"]);
  expect(automatic.settings).toEqual(scene.meterReference);
  expect(automatic.cameraControls).toEqual(["aperture", "shutter", "iso"]);
});

test("Exposure Compensation moves automatic results and reports a limit", () => {
  const selected = { aperture: 2.8, shutter: 125, iso: 400 };
  const brighter = resolveExposureMode({ mode: "A", selected, scene, compensation: 1, autoIso: false });
  const limited = resolveExposureMode({ mode: "A", selected: { ...selected, aperture: 11, iso: 100 }, scene, compensation: -8, autoIso: false });

  expect(brighter.settings).toEqual({ aperture: 2.8, shutter: 250, iso: 400 });
  expect(brighter.appliedCompensation).toBe(1);
  expect(limited.atLimit).toBe(true);
  expect(limited.appliedCompensation).toBeGreaterThan(-8);
});

test("Auto ISO is opt-in and changes ISO only when enabled", () => {
  const selected = { aperture: 11, shutter: 1000, iso: 400 };
  const manualIso = resolveExposureMode({ mode: "M", selected, scene, compensation: 0, autoIso: false });
  const automaticIso = resolveExposureMode({ mode: "M", selected, scene, compensation: 0, autoIso: true });

  expect(manualIso.settings.iso).toBe(400);
  expect(manualIso.cameraControls).toEqual([]);
  expect(automaticIso.settings.iso).toBe(3200);
  expect(automaticIso.cameraControls).toEqual(["iso"]);
});
