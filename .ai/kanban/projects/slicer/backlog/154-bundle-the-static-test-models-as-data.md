---
id: 154
title: Bundle the static test models as data
type: chore
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US45
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [153]
created: 2026-10-25
---

Adds the approved models (cube, tolerance, bed levelling, ironing patterns) as files in the module with a manifest and provenance.

**Code:** `vsslicer/modules/core/calibration/data/` (module: `calibration`, layer: n/a (data))

## Acceptance criteria

- [ ] Each model is a manifold mesh within the bed size and has a manifest entry (name, file, licence, recommended settings)
- [ ] The package size stays below the budget in `package.json` (asserted)
- [ ] Manifest validates against a schema

## Tasks

- [ ] Add files
- [ ] Manifest and schema
- [ ] Size check

## Progress

Not started.
