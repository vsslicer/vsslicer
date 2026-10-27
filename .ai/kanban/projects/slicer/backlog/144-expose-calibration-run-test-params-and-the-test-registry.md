---
id: 144
title: "Expose `Calibration.run(test, params)` and the test registry"
type: feature
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [136, 138, 139, 140, 141, 142, 143]
created: 2026-10-25
---

One entry point other modules call: lists tests, checks the firmware, builds the plan and the model, and returns what the pipeline needs. Exposes the sweep definitions for reuse by PRN.

**Code:** `vsslicer/modules/core/calibration/src/application/...` (module: `calibration`, layer: `application`)

## Acceptance criteria

- [ ] `Calibration.run` for each registered test returns a plan, a mesh and a sweep; a refused firmware returns the refusal and no plan
- [ ] The registry accepts new tests without code changes in the facade (test registers a fake test)
- [ ] The README documents the API with an example that runs in plain Node

## Tasks

- [ ] Registry
- [ ] `run`
- [ ] README
- [ ] Tests

## Progress

Not started.
