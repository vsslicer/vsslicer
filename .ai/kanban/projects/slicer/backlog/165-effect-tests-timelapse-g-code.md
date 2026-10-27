---
id: 165
title: "Effect tests: timelapse G-code"
type: chore
priority: P2
effort: S
model: sonnet
area: [engine]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [87, 159]
created: 2026-10-25
---

Effect test for `time_lapse_gcode` and `timelapse_type`: the template text appears at each layer change.

**Code:** `vsslicer/modules/common/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] The number of timelapse blocks equals the layer count minus the first-layer rule documented in the test
- [ ] Placeholders in the template are expanded by the engine and the test records which
- [ ] An engine without the key asserts its `unsupported` entry

## Tasks

- [ ] Define the test
- [ ] Layer-change helper
- [ ] Canned G-code tests

## Progress

Not started.
