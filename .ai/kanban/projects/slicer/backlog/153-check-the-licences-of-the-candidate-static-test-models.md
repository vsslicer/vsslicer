---
id: 153
title: Check the licences of the candidate static test models
type: docs
priority: P2
effort: S
model: opus
area: [calibration]
story: US45
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [131]
created: 2026-10-25
---

Records, per file, the licence and origin of every candidate static model (cube, tolerance test, bed levelling pattern, ironing patterns) including Orca's bundled models, and rules which can ship.

**Code:** `vsslicer/modules/calibration/docs/` (module: `calibration`, layer: n/a (docs))

## Acceptance criteria

- [ ] Each candidate has a row with source URL, licence, author and the decision; Orca's bundled models ship only when the file's licence allows it (BO Licence notes)
- [ ] Models whose licence is unclear are replaced by models we generate
- [ ] The table is committed with the module

## Tasks

- [ ] List candidates
- [ ] Check each licence
- [ ] Write the table

## Progress

Not started.
