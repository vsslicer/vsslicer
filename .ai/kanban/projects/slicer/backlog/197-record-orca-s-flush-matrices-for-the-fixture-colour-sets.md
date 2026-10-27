---
id: 197
title: "Record Orca's flush matrices for the fixture colour sets"
type: chore
priority: P2
effort: M
model: opus
area: [multimaterial]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [195, 160, 30]
created: 2026-10-25
---

Obtains the matrix the pinned Orca computes for each colour set of the multi-material fixtures (from `project_settings.config` after recalculation) and checks it in as the oracle.

**Code:** `vsslicer/modules/core/multimaterial/test/fixtures/` (module: `multimaterial`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] An oracle JSON exists per colour set with the Orca version, the cap in effect and the multiplier used
- [ ] A README documents how the values were produced (CLI or GUI export) and how to regenerate them
- [ ] At least two-, four- and eight-colour sets plus a black-and-white edge case are covered

## Tasks

- [ ] Find how Orca recalculates
- [ ] Record the values
- [ ] Write the README

## Progress

Not started.
