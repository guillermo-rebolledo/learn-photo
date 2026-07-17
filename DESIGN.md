<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->
---
name: Learn Photo
description: Clear, tactile photography learning through guided experimentation.
---

# Design System: Learn Photo

“Learn Photo” is a temporary working name for the MVP.

## Overview

**Creative North Star: "The Window-Lit Camera Table"**

The interface should feel like a learner sitting at a bright, quiet table with a camera in hand, changing one setting and immediately understanding what happened. It is clear, encouraging, tactile, and calm; the photograph is always the richest object on the screen, while the interface supplies orientation and confidence.

The compact landing surface demonstrates that promise instead of describing it at length: a large Neutral Still Life viewfinder, one immediately usable exposure control, a concise purpose statement, and a direct “Start learning” action. The Learning Path follows on the same route without a separate marketing funnel.

Use responsive motion to connect actions with outcomes and occasional learner-controlled animation to explain a concept. Motion must serve feedback, state, spatial continuity, or explanation, drawing craft inspiration from animations.dev without turning the product into a showreel. The learning cadence draws from Brilliant's learn-by-doing clarity without its gamification, while camera interactions draw from Halide's clean, elegant, relatable tactility.

Explicitly reject the density of Adobe Lightroom Classic's Develop workspace, dense camera manuals, sterile corporate course platforms, and childish gamified learning apps.

**Key Characteristics:**

- Photographs remain visually dominant.
- One clear learning action leads to one legible outcome.
- Complexity is revealed progressively rather than displayed all at once.
- Controls feel immediate, precise, and familiar across touch, mouse, and keyboard.
- Light and dark themes preserve the same hierarchy and photographic judgment.

## Colors

Use a restrained palette in which neutral surfaces give photographic scenes room and a moss-green anchor identifies action and state.

### Primary

- **Window Moss** (`[exact OKLCH value to be resolved during implementation]`): A green anchored near 150° hue, reserved for primary actions, current selections, focus, and meaningful state. It must occupy no more than roughly 10% of a screen.

### Neutral

- **Daylight** (`[exact OKLCH value to be resolved during implementation]`): A true-white light-theme background rather than cream or paper beige.
- **Darkroom** (`[exact OKLCH value to be resolved during implementation]`): An intentionally composed near-black dark-theme background rather than a color inversion.
- **Ink** (`[exact OKLCH value to be resolved during implementation]`): Primary text with at least 7:1 contrast against its theme background.
- **Quiet Surface** (`[exact OKLCH values to be resolved during implementation]`): Secondary layers for lessons, controls, and feedback without decorative card stacking.

### Named Rules

**The Photograph Leads Rule.** Interface color or effects must never compete with or recolor the Curated Scene.

**The Restrained Moss Rule.** Window Moss is semantic, not decorative, and stays under roughly 10% of any screen.

**The Independent Theme Rule.** Light and dark palettes are composed and contrast-tested separately; dark mode is never an inverted light theme.

## Typography

**Display Font:** Single humanist sans-serif (`[family to be chosen at implementation]`)
**Body Font:** Same humanist sans-serif (`[family to be chosen at implementation]`)

**Character:** Open, highly legible letterforms make technical ideas feel conversational rather than clinical. Clear, tabular numerals keep aperture, shutter, ISO, and meter values stable as controls change.

### Hierarchy

- **Display** (`[weight and size to be resolved]`): Used sparingly for the home introduction, never inside the simulator.
- **Headline** (`[weight and size to be resolved]`): Lesson titles and major workflow states.
- **Title** (`[weight and size to be resolved]`): Concepts, feedback groups, and scene names.
- **Body** (`[weight and size to be resolved]`): Explanations capped at 65–75 characters per line.
- **Label** (`[weight and size to be resolved]`): Controls and readouts, with tabular numerals and no tiny uppercase tracking.

### Named Rules

**The One Voice Rule.** One humanist family carries instruction and interface; fake digital-camera type, handwriting, and display faces inside controls are prohibited.

## Elevation

The system is flat by default and uses tonal layering for structure. Shadows, if implementation proves they are needed, must indicate a temporary elevated state such as a popover rather than decorate every container. Responsive transitions should generally remain below 300ms, use strong ease-out for entrances and feedback, and avoid animating layout properties.

“Take photo” uses immediate press feedback followed by a brief dark shutter-curtain sweep across the viewfinder (approximately 180–220ms). The Rendered Result and Criterion Statuses appear as it clears; reduced-motion replaces the sweep with a short stationary dimming transition. The MVP uses no shutter audio or vibration.

### Named Rules

**The State, Not Spectacle Rule.** Motion exists for feedback, state, spatial continuity, or explanation; no autoplay loops, cinematic page entrances, parallax, or bouncing rewards.

**The Reduced-Motion Rule.** Reduced-motion mode removes positional and scale movement while retaining immediate state changes and brief opacity or color transitions that aid comprehension.

## Do's and Don'ts

### Do:

- **Do** keep the photograph more prominent than the controls, following Halide's deliberate camera feel.
- **Do** make press feedback immediate and subtle, with state transitions that remain responsive under repeated use.
- **Do** provide equivalent light and dark experiences that meet WCAG 2.2 AA.
- **Do** make every feature usable by touch, mouse, and keyboard without depending on hover.
- **Do** use non-color labels and text equivalents for exposure, blur, noise, histogram, and Criterion Status.
- **Do** reveal one concept at a time and keep Tradeoff Feedback close to the resulting image.
- **Do** keep the landing page compact: one photographic demonstration, one promise, one primary action, then the Learning Path.
- **Do** use verified, credited real photography and keep source provenance alongside every Curated Scene.

### Don't:

- **Don't** recreate Adobe Lightroom Classic's Develop workspace or expose a wall of professional controls.
- **Don't** resemble a dense camera manual, a sterile corporate course platform, or a childish gamified learning app.
- **Don't** use punitive grading, streaks, leaderboards, confetti, or bouncing rewards.
- **Don't** use shutter audio, vibration, bright flashes, or repeated flicker for capture feedback.
- **Don't** use decorative complexity, camera-brand mimicry, or interactions that make experimentation feel risky.
- **Don't** use cream or beige surfaces with forest green, generic dark camera-tech dashboards, gradients in text, glassmorphism, nested cards, or decorative grid backgrounds.
- **Don't** recolor Curated Scenes between light and dark modes; learners must judge the same photographic result.
- **Don't** add testimonials, pricing blocks, newsletter capture, generic feature-card grids, or a long brand story to the MVP landing page.
- **Don't** use AI-generated images, unverified “royalty-free” search results, or visual placeholders in place of a Source Photograph.
