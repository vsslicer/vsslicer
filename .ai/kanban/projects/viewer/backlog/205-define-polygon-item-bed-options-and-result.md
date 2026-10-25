---
id: 205
title: "Define Polygon, Item, Bed, Options and Result"
type: feature
priority: P1
effort: S
model: sonnet
area: [arrange]
story: US61
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [202]
created: 2026-10-25
---

Plain types: a polygon as number arrays, an item with id, name, footprint and current pose, a bed (shape, size, exclusion areas, locked flag per plate), options (spacing, rotation steps, alignment, multi-plate) and a result with placed and unplaced items.

**Code:** `vsslicer/modules/arrange/src/domain/` (module: `arrange`, layer: `domain`)

## Acceptance criteria

- [ ] The types are serialisable JSON (round-trip test)
- [ ] A result separates placed items from unplaced ones by name
- [ ] No I/O in the folder

## Tasks

- [ ] Types
- [ ] Tests

## Progress

Not started.
