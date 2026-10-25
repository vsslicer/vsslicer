---
id: 155
title: Register the static models as calibration entries
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US45
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [154, 147]
created: 2026-10-25
---

Static models appear in the registry beside the generators, with no sweep and no write-back.

**Code:** `vsslicer/modules/calibration/src/application/...` (module: `calibration`, layer: `application`)

## Acceptance criteria

- [ ] `Calibration.run` for a static entry returns the model and no sweep
- [ ] Listing returns generators and static entries with their kind
- [ ] Plain Node test loads every bundled model

## Tasks

- [ ] Manifest reader
- [ ] Registry entries
- [ ] Tests

## Progress

Not started.
