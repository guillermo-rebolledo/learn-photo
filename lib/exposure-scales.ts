export type ExposureSettings = {
  aperture: number;
  shutter: number;
  iso: number;
};

export type ExposureScale = {
  aperture: readonly number[];
  shutter: readonly number[];
  iso: readonly number[];
};

export const beginnerScale = {
  aperture: [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22],
  shutter: [4000, 2000, 1000, 500, 250, 125, 60, 30, 15, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.067, 0.033],
  iso: [100, 200, 400, 800, 1600, 3200, 6400, 12800],
} as const satisfies ExposureScale;

export const cameraScale = {
  aperture: [1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22],
  shutter: [4000, 3200, 2500, 2000, 1600, 1250, 1000, 800, 640, 500, 400, 320, 250, 200, 160, 125, 100, 80, 60, 50, 40, 30, 25, 20, 15, 13, 10, 8, 6, 5, 4, 3, 2.5, 2, 1.6, 1.3, 1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.167, 0.125, 0.1, 0.077, 0.067, 0.05, 0.04, 0.033],
  iso: [100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800],
} as const satisfies ExposureScale;

export function equivalentExposureStops(reference: ExposureSettings, candidate: ExposureSettings): number {
  const apertureStops = Math.log2((reference.aperture / candidate.aperture) ** 2);
  const shutterStops = Math.log2(reference.shutter / candidate.shutter);
  const isoStops = Math.log2(candidate.iso / reference.iso);

  return apertureStops + shutterStops + isoStops;
}

export function formatShutter(value: number): string {
  if (value >= 1) return `1/${value}s`;
  const seconds = 1 / value;
  return `${seconds >= 10 ? Math.round(seconds) : Math.round(seconds * 10) / 10}s`;
}

export function nearestScaleSettings(settings: ExposureSettings, scale: ExposureScale): ExposureSettings {
  function nearest(value: number, values: readonly number[]) {
    return values.reduce((best, candidate) => Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best);
  }
  return {
    aperture: nearest(settings.aperture, scale.aperture),
    shutter: nearest(settings.shutter, scale.shutter),
    iso: nearest(settings.iso, scale.iso),
  };
}
