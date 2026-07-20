# MVP Quality Bar

The MVP is not complete until the following checks pass. Automated checks should run in continuous integration where practical; the named manual checks remain release requirements.

Anonymous product analytics are explicitly non-blocking for launch. They may be added after the core learning experience meets this quality bar and must not delay or weaken the requirements below.

## Domain correctness

- Unit tests cover stop calculations, equivalent exposures, Exposure Mode automation, Criterion Status boundaries, Film Constraints, and fixed film ISO.
- Identical scene assumptions and exposure choices produce an identical Rendered Result and evaluation.
- Typed schemas validate every Lesson, Curriculum Source, Curated Scene asset, Challenge, Success Criterion, and curriculum-manifest relationship at build time.
- Every scene is visually reviewed at representative dark, reference, and bright exposures and at representative aperture, motion, and ISO extremes.

## Content completeness

- All eight core Lessons, the three-part Capstone, and six core Curated Scenes meet this quality bar.
- The post-core Night Sky bonus, Bulb Exposure, sharp-star Challenge, and star-trail Challenge are complete before MVP launch.
- Every Lesson exposes Curriculum Sources and every Source Photograph has verified provenance and visible creator credit.
- Anonymous product analytics remain non-blocking and do not affect content-completeness status.

## Learning workflow

- End-to-end tests cover the explanation, guided experiment, Challenge Attempt, Tradeoff Feedback, retry, comparison, and completion flow.
- End-to-end tests cover browser-local Progress, unfinished Challenge restoration, theme and scale preferences, and complete reset.
- The recommended Learning Path never hard-locks a Lesson or the Sandbox.
- Graceful degradation preserves controls, evaluation, Histogram, and textual outcome descriptions when a visual effect is unavailable.

## Accessibility

- The product meets WCAG 2.2 Level AA in both light and dark themes.
- Component tests cover accessible names, roles, labels, state announcements, focus order, and keyboard behavior.
- Manual release checks cover keyboard-only use, VoiceOver, touch, 200% zoom and text resizing, color-independent statuses, and `prefers-reduced-motion`.
- Every feature works with touch, mouse, and keyboard; nothing depends on hover or requires a physical keyboard.
- Blur, motion, noise, exposure, Histogram, and Criterion Status have nonvisual text equivalents.

## Responsive and visual quality

- Visual regression tests cover representative phone and desktop layouts in light and dark themes.
- Visual regression tests cover representative simulator settings, feedback states, and long or zoomed text.
- A real mid-range phone is used for final touch, layout, and animation review.
- Curated Scenes are not recolored by the app theme.

## Performance

- Field targets are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 at the 75th percentile.
- Interaction and animation stay within a 16.7ms frame budget on the reference 60Hz mobile device and follow higher-refresh displays naturally.
- Only the active scene loads eagerly; later scenes and high-resolution layers load on demand.
- Expensive rendering yields to input and may use a lower-resolution preview until interaction settles.
- Route performance budgets are checked in continuous integration; field Web Vitals reporting may be added with the lower-priority analytics work.

## Manual browser coverage

- Current Chrome, Safari, Firefox, and Edge receive smoke coverage.
- Current iOS Safari and Android Chrome receive mobile coverage.
- Unsupported visual effects degrade explicitly rather than presenting a misleading result or blocking the learner.

## Release readiness

- Production metadata (canonical links, Open Graph/social preview, robots, sitemap) is accurate and points at the deployed domain.
- Landing, each top-level destination, a representative Challenge, Capstone completion, Reset progress, and Night Sky pass smoke tests against the deployed production build, not only the local build.
- A rollback or previous-deployment recovery path is documented and does not depend on data migration. See [the release runbook](./release-runbook.md).
