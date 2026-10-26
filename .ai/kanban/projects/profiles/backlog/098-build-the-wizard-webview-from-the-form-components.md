---
id: 98
title: Build the wizard webview from the form components
type: feature
priority: P0
effort: M
model: sonnet
area: [wizard]
story: US40
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [144, 75, 74]
created: 2026-10-25
---

The step screens, built on E15's components, with inline offers for missing vendor data.

**Code:** `vsslicer/modules/profiles-extension/webview/wizard/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Playwright walks all steps for the Prusa and Bambu fixtures and shows the compatible materials only
- [ ] The missing-data step shows the offered actions and the offline message
- [ ] Keyboard-only walk and an axe-core pass report no violations

## Tasks

- [ ] Step screens
- [ ] Inline offers
- [ ] Playwright and axe tests

## Progress

Not started.
