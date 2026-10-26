---
id: 209
title: Add the flush matrix grid with recalculation
type: feature
priority: P2
effort: M
model: sonnet
area: [multimaterial]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [208]
created: 2026-10-25
---

Panel section with the colour-labelled flush grid, the multiplier and an edited-cell marker; changes of filament or colour recalculate through `multimaterial`.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Changing a filament colour in the fixture project updates the grid; edited cells stay
- [ ] The grid shows the cap in effect and the engine it follows
- [ ] The matrix written to the plate equals the calculator's output for the shown colours

## Tasks

- [ ] Grid rendering
- [ ] Edit handling
- [ ] Recalculation on change
- [ ] Tests

## Progress

Not started.
