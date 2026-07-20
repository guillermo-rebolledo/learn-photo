# Rendering and performance release evidence

This document maps issue #16’s release bar to repeatable evidence. Browser acceptance runs against the optimized static export served by `scripts/serve-static.mjs`, matching ADR-0004 rather than measuring the Next.js development runtime. Automated results are release gates; physical-device and assistive-technology checks remain named manual gates and must not be inferred from emulation.

## Automated release gates

| Requirement | Evidence |
| --- | --- |
| Only the active Curated Scene loads eagerly | `tests/sandbox.spec.ts` records photographic requests, proves the initial route requests only Neutral Still Life, and proves a later scene’s 480 px preview and 960 px refinement are requested only after selection. |
| Immediate preview; deferred refinement | The Sandbox exposes `data-render-quality="preview"` immediately with its 480 px derivative, waits 180 ms without further input, then mounts the active 960 px image, calibrated layers, and pixel-derived Histogram. Lesson 6 applies the same boundary to its per-pixel canvas/Histogram work while keeping a CSS preview and calibrated text summary immediate. Other Lessons use inexpensive CSS-only deterministic updates and do not add an artificial delay. Route tests assert both expensive paths. |
| Main-thread input guard below 16.7 ms | `tests/performance.spec.ts` applies a 4× mobile CPU throttle and measures eight consecutive Exposure Control commits from change dispatch to the Rendered Result mutation, rejecting a commit over 16.7 ms. This protects input headroom but is not a painted-frame trace or a substitute for the physical-device gate below. |
| LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 lab guard | Buffered browser performance entries on `/sandbox` are asserted against all three thresholds. CI runs the route budget file independently. This supports the target; it does not claim field-p75 evidence, which requires production traffic. |
| Graceful degradation | Existing Sandbox tests disable CSS visual support and separately fail Histogram layer assets. Controls, text outcomes, Histogram disclosure, and supported effects remain independently usable. A committed fallback screenshot protects the learner-visible disclosure. |
| Responsive and visual stability | Committed Chromium baselines cover desktop light/dark, phone light/dark, 200% text, Challenge feedback, unsupported effects, and representative extremes for all six core Curated Scenes. The phone/zoom route test also rejects horizontal overflow. |
| Automated browser proxies | `playwright.smoke.config.ts` defines branded Chrome and Edge channels, Firefox, desktop WebKit, Android Chromium emulation, and iOS WebKit emulation. CI runs each project separately. The WebKit/mobile projects are compatibility proxies; the named physical-browser acceptance remains a manual gate below. |
| Scene review | [`docs/visual-reviews/sandbox-scenes.md`](./visual-reviews/sandbox-scenes.md) records dark, reference, bright, aperture, motion, and ISO review for every core Curated Scene and links the representative baselines. |

## Commands

```sh
npm run typecheck
npm run build
npm test
npm run test:performance
npm run test:visual
npm run test:browsers
```

## Manual release gates

Before a production release, record these checks against the deployed build:

- A real agreed mid-range 60 Hz phone: touch layout, rapid Exposure Control manipulation, and frame timeline with no interaction frame above 16.7 ms.
- Current physical iOS Safari and Android Chrome devices, not only Playwright emulation.
- Current branded desktop Safari and Edge in addition to the engine/channel CI coverage.
- Network-conditioned LCP on the deployed static host and field 75th-percentile Web Vitals once sufficient traffic exists.

The local 2026-07-19 implementation run passed branded Chrome, Firefox, desktop WebKit, Android Chromium emulation, and iOS WebKit emulation. Branded Edge was not installed on the implementation Mac and is therefore delegated to the Windows CI project rather than claimed as locally verified.
