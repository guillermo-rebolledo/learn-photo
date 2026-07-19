# Accessibility release checks

Learn Photo targets WCAG 2.2 Level AA. Automated checks reduce regressions, but they do not replace assistive-technology and device testing.

## Automated coverage

Run `npm test`. The Playwright suite verifies:

- WCAG A and AA axe rules on Learn/settings, all eight Lessons and Challenges, Sandbox, Reference, and Night Sky in light and dark themes.
- Keyboard operation, skip-link focus, named controls, announced dynamic outcomes, and text-labelled Criterion Statuses.
- Representative touch operation at a 390 × 844 CSS-pixel mobile viewport.
- Page reflow at a 640 CSS-pixel viewport, representing a 1280-pixel desktop viewport at 200% browser zoom.
- All core surfaces with the root text size increased to 200%.
- Reduced-motion capture feedback and nonvisual equivalents for exposure, depth, motion, noise, Histogram, Clipping, and Criterion Status.
- Curated Scene rendering remains unchanged when the interface theme changes.

## Manual release matrix

Perform this matrix against the release candidate in both light and dark themes. Record the date, tester, browser/device, and result in the release issue. A release does not pass while any row is untested or failed.

| Check | Procedure | Pass condition |
| --- | --- | --- |
| Keyboard | Starting at the address bar, traverse Learn, one complete Learning Loop, Sandbox, Reference search, theme, and Reset progress using Tab, Shift+Tab, arrows, Space, Enter, and Escape where applicable. | Focus is always visible and ordered; every feature is operable; no keyboard trap or hover-only content appears. |
| VoiceOver | On current macOS Safari and iOS Safari, use VoiceOver navigation and forms modes through the same path. Submit and retry a Challenge, reveal comparison, change theme, and reset Progress. | Landmarks, headings, controls, values, checked/disabled states, Rendered Result summaries, Histogram/Clipping text, Criterion Status, Tradeoff Feedback, and reset confirmation are announced once and in context. |
| Touch | On current iOS Safari and Android Chrome, complete a Learning Loop and operate every Sandbox control without a hardware keyboard. | Targets are comfortable, native controls open reliably, no action depends on hover, and content is not obscured. |
| Color and themes | With a contrast tool and common color-vision simulations, inspect text, controls, focus, links, and Achieved/Close/Missed feedback in both themes. Compare identical Curated Scene settings before and after switching themes. | Text and UI contrast meet AA; state never relies on color; the Curated Scene pixels and exposure rendering do not change with theme. |
| Zoom and text resizing | At representative desktop and mobile widths, test browser zoom at 200% and text-only sizing at 200%. Traverse all controls and open feedback, tables, sources, and long labels. | Content reflows without page-level horizontal scrolling; controls and text remain visible, readable, and operable. Data tables may scroll within their own labelled region. |
| Reduced motion | Enable Reduce Motion, change camera settings, switch theme, and use Take photo across representative Lessons and Night Sky. | No positional or scale transition runs; capture uses stationary dimming where shutter feedback is present; useful state feedback remains. |

## Verification record

On 2026-07-19, the automated Chromium suite passed keyboard, representative touch emulation, both-theme axe/contrast rules, 200% text resizing, 200% desktop/mobile reflow, reduced motion, non-color status, and Curated Scene theme-independence checks. The production static build also passed.

On 2026-07-19, the project owner accepted the VoiceOver, real iOS/Android hardware, and manual color-vision release checks as complete. Together with the automated verification above, the accessibility release matrix is signed off for this release candidate.

## Assistive-technology smoke path

1. Open Learn and use “Skip to content.”
2. Confirm the Light/Dark switch exposes its name, checked state, and disabled state only during hydration.
3. Open Lesson 1, adjust all four controls, and listen for the synchronized Rendered Result description.
4. Use “Take photo,” then confirm each Success Criterion has a textual Criterion Status and explanation.
5. Retry, reveal the previous Attempt comparison, and confirm the update is understandable without seeing color or motion.
6. Open Sandbox, change Curated Scene and Exposure Mode, enable the Histogram, and confirm the Meter Reference, Histogram shape, and Clipping summary are available as text.
7. Search the Reference and confirm the result count is announced without moving focus.
8. Use “Reset progress” and confirm “Progress and theme preference reset” is announced.
