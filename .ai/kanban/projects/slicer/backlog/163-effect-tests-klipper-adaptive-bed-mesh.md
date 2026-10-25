---
id: 163
title: "Effect tests: Klipper adaptive bed mesh"
type: chore
priority: P2
effort: S
model: sonnet
area: [engine]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [87, 159]
created: 2026-10-25
---

Effect test for `bed_mesh_*`: the keys reach the `BED_MESH_CALIBRATE` parameters in the start G-code.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] With the feature on, `BED_MESH_CALIBRATE` carries `MESH_MIN`/`MESH_MAX` inside the object's bounds; off, it does not
- [ ] The regression is recorded in the definition
- [ ] An unsupported engine is skipped with its entry asserted

## Tasks

- [ ] Define the test
- [ ] Start G-code parser helper
- [ ] Canned G-code tests

## Progress

Not started.
