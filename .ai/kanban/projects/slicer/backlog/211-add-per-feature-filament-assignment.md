---
id: 211
title: Add per-feature filament assignment
type: feature
priority: P2
effort: M
model: sonnet
area: [multimaterial]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [208]
created: 2026-10-25
---

Panel section listing the engine's assignable features with a filament picker each.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The feature list comes from the engine's table (Orca and Cura differ in the test)
- [ ] Picking a filament writes the engine's key via MM8
- [ ] A warning appears for an engine that ignores the feature

## Tasks

- [ ] Feature list
- [ ] Pickers
- [ ] Tests

## Progress

Not started.
