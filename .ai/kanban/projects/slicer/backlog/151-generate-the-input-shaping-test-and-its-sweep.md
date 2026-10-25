---
id: 151
title: Generate the input shaping test and its sweep
type: feature
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [147]
created: 2026-10-25
---

Ringing tower sweeping the shaper frequency per block with `SET_INPUT_SHAPER` or `M593`; writes `input_shaping_*` keys of the printer profile.

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] The plan covers frequency and type per axis; the parser detects the intended command per block (fixtures only, D5)
- [ ] Bambu and RRF cases refuse with a reason or emit their command as the table says
- [ ] The patch is exactly one key per run

## Tasks

- [ ] Mesh
- [ ] Plan
- [ ] Tests

## Progress

Not started.
