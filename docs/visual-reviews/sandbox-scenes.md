# Sandbox Curated Scene visual review

Reviewed 2026-07-19 at 1440 × 1000 desktop and 390 × 844 phone widths in light and dark themes. The committed Chromium baselines are under [`tests/visual-regression.spec.ts-snapshots`](../../tests/visual-regression.spec.ts-snapshots/).

| Curated Scene | Dark, reference, and bright exposure | Aperture review | Motion review | ISO review |
| --- | --- | --- | --- | --- |
| Neutral Still Life | −2, 0, and +2 Stops remain visibly distinct; the reference state keeps highlight and shadow detail. | f/1.4, f/5.6, and f/22 preserve the still-life rendering while the exposure response follows the paired controls. | 1/30s through 1/4000s introduce no false subject motion under the tripod/still-object Scene Assumptions. | ISO 100, 400, and 12,800 change Rendered Brightness without claiming additional Captured Light or adding scene-unsupported noise. |
| Window-Light Portrait | −2, 0, and +2 Stops remain distinct without changing color between themes. | f/1.4–f/2.8 produces strong background softening, f/5.6 is moderate, and f/8–f/22 retains more definition while the subject layer stays legible. | Slow and fast shutter choices do not invent subject travel under the still-subject assumption. | The available ISO range changes Rendered Brightness; the textual outcome continues to identify depth rather than implying a universal optical threshold. |
| Moving Cyclist | Dark, reference, and bright states preserve a readable cyclist and directional result. | Aperture changes affect exposure without adding an unsupported depth claim. | 1/500s and faster holds the cyclist, 1/125s shows a short trace, and 1/30s shows three progressively softened directional echoes. | ISO changes Rendered Brightness without replacing the shutter-specific motion explanation. |
| Dim Indoor Performance | Dark and bright extremes retain stage context; the reference state keeps the performer readable. | Wide and narrow aperture choices respond consistently under the fixed 85 mm / handheld assumptions. | Fast settings retain the source subject; slower settings remain described without presenting a camera-certified threshold. | ISO 100 has no added grain, ISO 800 is restrained, ISO 3200 is visible, and ISO 12,800 is pronounced without obscuring the performer. |
| Bright Snow | Meter Reference is intentionally subdued, +1 Stop restores the intended bright snow, and the bright extreme visibly approaches highlight loss. | f/4 through f/11 can preserve the intended result with paired shutter changes; no unsupported depth effect is shown. | The still landscape does not acquire false directional motion. | ISO is visibly constrained to 100 by the Scene Assumptions, avoiding an effect the scene does not render. |
| Dark Stage | Meter Reference lifts the naturally dark stage, −1 Stop preserves the intended surround, and the dark extreme approaches shadow loss. | f/2 and f/4 can preserve intended tones with paired shutter choices. | 1/125s and 1/500s retain the held performer under the explicit handheld 200 mm assumption. | ISO is visibly constrained to 1600, so no unsupported variable grain claim is introduced. |

The Source Photograph color is identical between themes. At 200% text, the phone layout keeps every control in one column without horizontal overflow. The unsupported-effects baseline removes blur, echo, and grain layers while retaining the representative Source Photograph and explicit textual disclosure.

Representative committed baselines:

- [Neutral reference](../../tests/visual-regression.spec.ts-snapshots/scene-neutral-reference-chromium-darwin.png)
- [Portrait wide aperture](../../tests/visual-regression.spec.ts-snapshots/scene-portrait-wide-aperture-chromium-darwin.png)
- [Cyclist slow shutter](../../tests/visual-regression.spec.ts-snapshots/scene-cyclist-slow-shutter-chromium-darwin.png)
- [Performance high ISO](../../tests/visual-regression.spec.ts-snapshots/scene-performance-high-iso-chromium-darwin.png)
- [Bright snow](../../tests/visual-regression.spec.ts-snapshots/scene-snow-bright-chromium-darwin.png)
- [Dark stage](../../tests/visual-regression.spec.ts-snapshots/scene-stage-dark-chromium-darwin.png)

