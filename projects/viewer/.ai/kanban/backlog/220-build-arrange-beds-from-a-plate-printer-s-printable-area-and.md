---
id: 220
title: "Build arrange beds from a plate printer's printable area and exclusion areas"
type: feature
priority: P1
effort: S
model: sonnet
area: [arrange]
story: US58
milestone: "VSS:M4"
depends_on: [183, 219]
created: 2026-10-25
---

Reads `printable_area`, `bed_exclude_area` and height from the resolved profile of the plate's printer and builds the `Bed` for arrange.

**Code:** `vsslicer/modules/project-extension/src/application/arrangeBed.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A rectangular, a circular and an excluded-area fixture produce the expected beds
- [ ] A plate with its own printer uses that printer's bed

## Tasks

- [ ] Mapping
- [ ] Tests

## Progress

Not started.
