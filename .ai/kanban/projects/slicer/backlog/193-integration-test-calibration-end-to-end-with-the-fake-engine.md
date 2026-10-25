---
id: 193
title: "Integration test: calibration end to end with the fake engine"
type: chore
priority: P2
effort: M
model: sonnet
area: [tasks, calibration]
story: US46
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [191, 192, 188, PLT-15]
created: 2026-10-25
---

In the test host: run a test, pick a block, confirm the preset, undo it.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The chain run, pick, confirm and undo passes for the temperature tower and the PA line
- [ ] The store content after undo equals the content before the run
- [ ] A refused test never reaches the engine

## Tasks

- [ ] Test host scenario
- [ ] Assertions on the store
- [ ] Refusal scenario

## Progress

Not started.
