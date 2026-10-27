---
id: 101
title: Add the printer grouping and flag marks to the filament tree models
type: feature
priority: P1
effort: S
model: sonnet
area: [ui]
story: US22
milestone: "VSS:M4"
sprint: "VSS:SP38"
depends_on: [51, 46]
created: 2026-10-27
---

Split out of FIL-51 when FIL-51 moved to SP14 for E70 on the in-memory store: the parts that need slot assignments and disagreement flags (`filament@0.3.0`, FIL-46).

**Code:** `vsslicer/modules/apps/filament/src/application/...` (module: `filament-extension`, layer: `application`)

## Acceptance criteria

- [ ] The printer > tool or tray grouping uses slot assignments and matches a fixture inventory
- [ ] A spool with an open disagreement flag carries a flag mark that clears after a scale correction event

## Tasks

- [ ] Grouping and flags
- [ ] Unit tests

## Progress

Not started.
