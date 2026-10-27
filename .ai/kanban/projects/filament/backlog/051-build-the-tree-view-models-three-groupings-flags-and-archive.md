---
id: 51
title: "Build the tree view models: three groupings, flags and archived filter"
type: feature
priority: P1
effort: M
model: sonnet
area: [ui]
story: US22
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [16, 46]
created: 2026-10-25
---

Pure view models: brand > filament > spool, location, and printer > tool or tray (using slot assignments), with swatch colour, remaining grams and percent, flag marks and an archived filter.

**Code:** `vsslicer/modules/apps/filament/src/application/...` (module: `filament-extension`, layer: `application`)

## Acceptance criteria

- [ ] Output matches a fixture inventory for each grouping; archived spools hidden unless the filter is on
- [ ] Building the model for 2000 spools takes under 100 ms (measured)
- [ ] A spool with an open disagreement flag carries a flag mark that clears after a scale correction event

## Tasks

- [ ] Write the grouping
- [ ] Write the labels
- [ ] Performance test

## Progress

Not started.
