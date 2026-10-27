---
id: 156
title: "Record sliced fixtures for the PA, flow, input shaping and cornering models"
type: chore
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US42
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [148, 149, 150, 151, 152, 30, 82]
created: 2026-10-25
---

Same as CAL15 for the second set of generators.

**Code:** `vsslicer/modules/core/calibration/test/fixtures/` (module: `calibration`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each fixture has `PROVENANCE.md` and stays under the size cap
- [ ] The regeneration script from CAL15 covers the new models
- [ ] Fixtures exist for both engines where the engine can slice the model

## Tasks

- [ ] Slice the models
- [ ] Check in with provenance

## Progress

Not started.
