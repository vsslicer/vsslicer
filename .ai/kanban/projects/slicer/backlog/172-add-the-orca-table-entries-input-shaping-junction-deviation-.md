---
id: 172
title: "Add the Orca table entries: input shaping, junction deviation and adaptive PA"
type: feature
priority: P2
effort: S
model: sonnet
area: [orca]
story: US49
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [171, 92]
created: 2026-10-25
---

Adds entries for `input_shaping_*`, the junction deviation or jerk keys of each flavour and `adaptive_pressure_advance_model`.

**Code:** `vsslicer/modules/slicer/orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes
- [ ] Every entry names the native key
- [ ] Keys Bambu firmware ignores are `unsupported` with the reason

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
