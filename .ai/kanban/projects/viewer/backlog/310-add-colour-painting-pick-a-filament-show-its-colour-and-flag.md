---
id: 310
title: "Add colour painting: pick a filament, show its colour and flag missing filaments"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, painting]
story: US83
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [303, 307]
created: 2026-10-25
---

A filament picker built from the palette drives the brush, bucket and other tools in colour mode; painted indices without a filament show a warning on the object.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/paint/colour.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Painting with filament 3 sets state 3 and renders in its colour
- [ ] Removing a used filament shows the warning with the object name
- [ ] More than four filaments work (extra nibble) and round-trip on save

## Tasks

- [ ] Picker
- [ ] Warning
- [ ] Harness test

## Progress

Not started.
