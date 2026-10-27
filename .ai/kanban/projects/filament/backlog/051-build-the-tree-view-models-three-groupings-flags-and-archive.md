---
id: 51
title: "Build the tree view models: three groupings, flags and archived filter"
type: feature
priority: P0
effort: M
model: sonnet
area: [ui]
story: US22
milestone: "VSS:M4"
sprint: "VSS:SP14"
depends_on: [99]
created: 2026-10-25
---

Pure view models: brand > filament > spool and location, with swatch colour, remaining grams and percent and an archived filter.

**E70 (2026-10-27):** moved to SP14 on the in-memory store; depends on FIL-99 instead of FIL-16 (file store) and FIL-46 (`filament@0.3.0`). The printer > tool or tray grouping and the flag marks need slot assignments and disagreement flags, so they moved to FIL-101.

**Code:** `vsslicer/modules/apps/filament/src/application/...` (module: `filament-extension`, layer: `application`)

## Acceptance criteria

- [ ] Output matches a fixture inventory for the brand and location groupings; archived spools hidden unless the filter is on
- [ ] Building the model for 2000 spools takes under 100 ms (measured)

## Tasks

- [ ] Write the grouping
- [ ] Write the labels
- [ ] Performance test

## Progress

Not started.
