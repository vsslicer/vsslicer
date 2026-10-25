---
id: 148
title: Generate the pressure advance tower and its sweep
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US42
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [147]
created: 2026-10-25
---

Tower whose PA value steps per block using the firmware command; target key `pressure_advance`.

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] The plan and sweep use `SET_PRESSURE_ADVANCE`, `M900` or `M572` per firmware and refuse Bambu cases without a command
- [ ] The mesh is manifold and the plan targets `pressure_advance`
- [ ] Plan blocks follow CAL4

## Tasks

- [ ] Mesh
- [ ] Plan
- [ ] Tests

## Progress

Not started.
