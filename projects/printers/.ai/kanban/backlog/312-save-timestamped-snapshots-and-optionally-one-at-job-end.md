---
id: 312
title: Save timestamped snapshots and optionally one at job end
type: feature
priority: P2
effort: M
model: sonnet
area: [camera]
story: US49
milestone: "VSS:M4"
depends_on: [296, 293]
created: 2026-10-25
---

Snapshots saved with a timestamped name to a configured folder, and an optional setting that takes one when a print ends (from the registry's status events).

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Save snapshot writes `<printer>-<yyyyMMdd-HHmmss>.jpg` to the configured folder without a dialog; names never collide
- [ ] With the setting on, a status change to finished saves one snapshot, once (fake printer test); with it off nothing is saved

## Tasks

- [ ] Add the name and folder setting
- [ ] Add the job-end trigger
- [ ] Write tests

## Progress

Not started.
