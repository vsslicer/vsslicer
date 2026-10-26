---
id: 199
title: Model the flush matrix with manual overrides surviving recalculation
type: feature
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [198]
created: 2026-10-25
---

A `FlushMatrix` value that remembers which cells the user edited and recalculates the rest when a filament or colour changes.

**Code:** `vsslicer/modules/multimaterial/src/domain/...` (module: `multimaterial`, layer: `domain`)

## Acceptance criteria

- [ ] Changing one filament colour recalculates its row and column only; edited cells keep their value
- [ ] Removing a filament drops its row and column and keeps the others
- [ ] The cap follows the engine passed in

## Tasks

- [ ] Matrix model
- [ ] Recalculation
- [ ] Tests

## Progress

Not started.
