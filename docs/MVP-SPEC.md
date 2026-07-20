# Learn Photo MVP Specification

“Learn Photo” is a temporary name for a free, public, English-language web application that helps beginners understand camera settings through explanation, guided experimentation, and realistic-looking conceptual simulation.

## Learner and outcome

The MVP serves people considering their first film or digital camera and camera owners who want to move beyond automatic operation without being overwhelmed by menus or jargon.

After completing the Learning Path, a learner should be able to predict how aperture, shutter speed, and ISO affect a photograph, choose reasonable settings for a Photographic Intention, explain the resulting tradeoffs, use a meter and basic luminance Histogram as evidence rather than answers, and transfer the mental model to both digital and film-constrained situations.

Editing, composition, and professional workflows are outside the learning outcome.

## Experience structure

The compact landing surface and Learn destination share one route. It contains a concise purpose statement, a large Neutral Still Life viewfinder with one immediately usable exposure control, a primary “Start learning” action, and the Learning Path directly below. There is no separate marketing funnel.

The top-level destinations are:

- **Learn**: landing surface, recommended path, Progress, and next step.
- **Lesson**: focused explanation, guided experiment, Challenge, and feedback flow.
- **Sandbox**: unrestricted Curated Scene exploration.
- **Reference**: glossary, stop and mode tables, film differences, and Curriculum Sources.

The Learning Path recommends an order but never hard-locks Lessons, Challenges, the Sandbox, or the Night Sky bonus.

## Learning Loop

Every core Lesson repeats the same model:

1. Explain one concept concisely in plain English.
2. Let the learner manipulate that concept in a guided experiment with immediate preview updates.
3. Present one or two Challenges with a scene and Photographic Intention.
4. Require the learner to commit settings with “Take photo.”
5. Reveal per-criterion status and Tradeoff Feedback.
6. Allow unlimited, penalty-free retries and comparison with the immediately previous Attempt.

Hints become progressively more specific after repeated misses. Capstone hints remain learner-initiated. Guided experiments update continuously; Challenges reveal status only after an Attempt.

## Curriculum

The eight core Lessons should total approximately 60–90 minutes, with each Lesson taking roughly 5–10 minutes:

1. Light and exposure
2. Stops and equivalent exposures
3. Aperture and depth of field
4. Shutter speed and motion
5. ISO and image quality
6. Exposure meter and basic luminance Histogram reading
7. Exposure modes and compensation
8. Choosing settings for an intention and completing the Capstone

Relevant Lessons include a short “On film” explanation. Film coverage also includes a dedicated explanation of film speed, fixed roll ISO, grain, and the consequences of choosing a stock. Later Challenges apply a Film Constraint by locking ISO. Pushing, pulling, development, reciprocity failure, and stock-specific rendering are deferred.

The curriculum distinguishes Captured Light from Rendered Brightness. It acknowledges “exposure triangle” as common external terminology but does not teach aperture, shutter speed, and ISO as physically equivalent controls.

The Capstone contains three minimally guided Challenges covering motion, depth of field, and low light; one applies the Film Constraint. Learning Path completion requires every essential Success Criterion to reach Achieved, without a grade, certificate, leaderboard, or social comparison.

## Curated Scene library

The six core scenes are launch requirements:

1. **Neutral Still Life**: basic exposure and equivalent settings; also powers the landing demonstration.
2. **Window-Light Portrait**: aperture and depth of field.
3. **Moving Cyclist**: freezing or expressing motion.
4. **Dim Indoor Performance**: balancing shutter speed and ISO.
5. **Bright Snow**: meter compensation in a high-key scene.
6. **Dark Stage**: meter compensation in a low-key scene.

The **Night Sky** scene is a post-core bonus but remains required for the MVP release. It provides separate Challenges for relatively sharp stars and intentional star trails, assumes a tripod and remote or delayed release, and introduces bonus-only Bulb Exposure presets at 30 seconds, 1 minute, 2 minutes, 5 minutes, and 10 minutes without real-time waiting.

Scene subjects should not assume a particular culture, location, gender, or expensive camera setup.

Every scene derives from a real Source Photograph. AI-generated imagery is prohibited. Each asset records photographer, source URL, license, and download date; creator credit remains visible even when optional. The app stores optimized derivatives and avoids recognizable logos, artwork, or people without sufficient rights confidence.

## Simulator model

The Conceptual Simulator preserves correct relationships and believable photographic appearance without claiming to predict a particular camera, lens, sensor, film, or scene exactly.

Each Curated Scene has fixed Available Light and Scene Assumptions for format, focal length, focus distance, camera stability, and subject behavior. The learner controls camera settings, not lighting or geometry. Lessons state that depth of field and motion outcomes vary in real life, while an expandable “Why this varies” note exposes relevant assumptions.

The standard control envelope is:

- Aperture: `f/1.4` through `f/22`
- Shutter speed: `1/4000s` through `30s`
- Digital ISO: `100` through `12,800`
- Bulb Exposure: Night Sky bonus only

The Beginner Scale uses full stops. Later Lessons introduce half- and third-stop increments, and the Sandbox offers the Camera Scale with third stops. A scene may narrow an available range only when it explains the Scene Assumption causing the limit.

The Digital-First Model lets ISO vary by photograph. Film Constraints lock ISO to the selected film speed.

The exposure-mode scope includes:

- Auto
- Program (`P`)
- Aperture Priority (`A`/`Av`)
- Shutter Priority (`S`/`Tv`)
- Manual (`M`)
- Exposure Compensation
- Auto ISO, introduced after manual ISO and disabled in early Challenges

Brand-specific scene modes are excluded.

The Meter Reference estimates neutral brightness but never defines correctness. The luminance-only Histogram shows tonal distribution and shadow or highlight Clipping, with a textual summary; it has no RGB channels, waveform, vectorscope, or RAW-accuracy claim.

## Rendering

Rendered Results use deterministic, scene-calibrated 2D composition. A Source Photograph may have subject, background-depth, motion, and highlight masks. The renderer applies stops-based exposure, calibrated defocus, directional motion, and ISO noise or film grain, then derives the luminance Histogram from the result. Generic filters alone are insufficient; representative settings for every scene require visual review.

During manipulation, a lower-resolution preview may update immediately and refine after input settles. Expensive rendering yields to input. Unsupported effects degrade explicitly: settings, evaluation, Histogram, and textual outcomes remain available, with a representative fallback image where possible. The app never displays a misleading effect merely to avoid admitting a limitation.

No 3D library is required. Personal photo uploads, camera access, EXIF analysis, and personal-image review are excluded.

## Challenge evaluation

Challenges evaluate independent Success Criteria rather than compare against one hidden answer:

- Usable exposure
- Intended motion rendering
- Intended depth of field
- ISO compatible with the image-quality goal

Each criterion receives one status:

- **Achieved**: satisfies the criterion.
- **Close**: usable with a noticeable compromise.
- **Missed**: conflicts with the intention or is unusable.

Thresholds are calibrated per scene and intention rather than treated as universal camera rules. Feedback explains cause, consequence, and one useful next adjustment. A Challenge completes when all essential criteria are Achieved; optional preferences may remain Close.

## Interaction and visual direction

The brand personality is clear, encouraging, and tactile. The visual North Star is “The Window-Lit Camera Table”: restrained light and dark themes, realistic photography as the richest visual material, a semantic moss-green accent, and one highly legible humanist sans-serif family with tabular numerals.

Halide informs clean, elegant, relatable camera tactility; Brilliant informs bite-sized learn-by-doing structure without heavy gamification; animations.dev and Emil Kowalski's design-engineering principles inform responsive, purposeful motion.

Standard buttons, menus, fields, tooltips, toggles, and dialogs begin with shadcn and Base UI, restyled to the Learn Photo system. Exposure dials, Meter, Histogram, viewfinder, and comparison control are dedicated accessible components rather than skeuomorphic copies of a camera body.

The silent MVP uses no audio or vibration. “Take photo” triggers immediate press feedback and a dark shutter-curtain sweep lasting approximately 180–220ms; the Rendered Result and Criterion Statuses appear as it clears. Reduced-motion substitutes a stationary dimming transition. There are no bright flashes, repeated flicker, decorative autoplay loops, parallax, bouncing rewards, or cinematic page choreography.

The interface must not resemble Adobe Lightroom Classic's Develop workspace, a dense camera manual, a sterile corporate course platform, or a childish gamified learning app.

## Accessibility and responsive behavior

WCAG 2.2 Level AA is a release requirement. Every feature works with touch, mouse, and keyboard; nothing depends on hover or requires a physical keyboard. Both themes independently meet contrast and focus requirements and never recolor a Curated Scene.

The app provides visible focus, comfortably sized touch targets, screen-reader labels and state announcements, non-color status cues, text and zoom resilience, reduced-motion behavior, and textual equivalents for exposure, blur, motion, noise, Histogram shape, and Criterion Status.

Desktop may place controls beside the viewfinder; small screens stack or switch between them without reducing capability. Primary coverage includes current Chrome, Safari, Firefox, and Edge, plus iOS Safari and Android Chrome.

## Progress and privacy

The MVP requires no account or sign-in. Browser-local Progress remembers completed Lessons and Challenges, current Lesson position, the last unfinished Challenge settings, scale preference, and theme preference. Only the immediately previous Attempt is retained for comparison. It stores no full attempt history, streaks, time tracking, statistics, behavioral profile, or hidden backup.

A single Reset Progress action clears learning state. Progress does not synchronize across devices and may be lost when browser data is cleared.

The first visit follows `prefers-color-scheme`; an accessible Light/Dark control lets the learner override it, and the override is remembered locally.

## Content and sources

Lessons and asides live in repository-managed MDX. Typed definitions hold scenes, settings, Challenges, Success Criteria, and feedback rules, while a curriculum manifest defines order and relationships. Build-time validation rejects inconsistent values, missing assets, missing sources, and broken references. There is no CMS or runtime lesson service.

Every Lesson ends with a collapsed “Sources and further reading” section. Technical claims rely on authoritative manufacturer, film-maker, textbook, or institutional material; nuanced claims require an independent cross-check. Challenges link to their supporting Lesson, and the Reference consolidates Curriculum Sources. Unsourced blogs, affiliate articles, and forum posts cannot establish curriculum facts.

Professional subject-matter review is desirable in the future but is not available as an MVP launch requirement.

## Technical and deployment architecture

The MVP uses Next.js App Router, React, and TypeScript with static export. Static routes are prerendered; the simulator and browser-local state run in client components. The initial host is Vercel, including preview deployments, but core behavior must not depend on Vercel-only runtime features.

Motion prefers CSS transitions and the Web Animations API. A motion library may be added only for a validated interruptible interaction that those tools cannot serve well.

## Performance

The MVP must meet “good” Core Web Vitals at the 75th percentile: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. Excellent Lighthouse results are aspirational, not a promise of a perfect lab score.

Interaction and motion stay within a 16.7ms frame budget on the reference 60Hz mobile device and follow higher-refresh displays naturally. Only the active scene loads eagerly; later scenes and high-resolution layers load on demand.

## Launch priority

The release order is:

1. Core architecture, accessible design primitives, and deterministic exposure model
2. Eight-Lesson Learning Path and six core Curated Scenes
3. Capstone and full release-quality verification
4. Night Sky bonus and Bulb Challenges
5. Anonymous product analytics if time remains

Night Sky is launch-required despite its lower implementation priority. Analytics is non-blocking and may ship later. If added, analytics is anonymous and limited to curriculum events such as Lesson and Challenge completion, criterion difficulty, Sandbox use, and Learning Path drop-off; it must not create advertising profiles or reconstruct individual learners.

## Explicit exclusions

- Composition, editing, flash, autofocus systems, white balance, and focal-length controls
- Camera-brand menus, camera-body replicas, and brand-specific scene modes
- Advanced film development and stock-specific behavior
- Accounts, synchronization, payments, ads, community, certification, streaks, and leaderboards
- Photo upload, camera access, EXIF analysis, and personal-image review
- Native apps, offline guarantees, and installable PWA requirements
- CMS and runtime lesson services
- AI-generated imagery and 3D rendering
- Audio and vibration
- Languages other than English
- Analytics as a launch requirement

## Supporting decisions

- [ADR 0001: Keep MVP progress browser-local](./adr/0001-browser-local-progress-for-mvp.md)
- [ADR 0002: Teach captured light before the exposure triangle](./adr/0002-teach-captured-light-before-exposure-triangle.md)
- [ADR 0003: Evaluate the intended image, not meter zero](./adr/0003-evaluate-the-image-not-meter-zero.md)
- [ADR 0004: Build a static Next.js app with custom simulator controls](./adr/0004-static-nextjs-and-custom-simulator-controls.md)
- [ADR 0005: Version curriculum content with the application](./adr/0005-version-curriculum-with-the-application.md)
- [ADR 0006: Use only licensed real photography for scenes](./adr/0006-use-only-licensed-real-photography.md)
- [ADR 0007: Render scenes as calibrated 2D layers](./adr/0007-render-scenes-as-calibrated-2d-layers.md)
- [ADR 0008: Require transparent curriculum sources](./adr/0008-require-transparent-curriculum-sources.md)
- [ADR 0009: Protect Web Vitals and the animation frame budget](./adr/0009-protect-web-vitals-and-animation-frame-budget.md)
- [ADR 0010: Limit the MVP to curated scenes](./adr/0010-curated-scenes-only-for-mvp.md)
- [ADR 0011: Deploy the MVP to Vercel](./adr/0011-deploy-the-mvp-to-vercel.md)

The detailed release checks live in [MVP Quality Bar](./QUALITY.md), the production deploy and rollback path in [the release runbook](./release-runbook.md), the ubiquitous language in [Photography Learning Context](../CONTEXT.md), and the visual seed in [Learn Photo Design System](../DESIGN.md).
