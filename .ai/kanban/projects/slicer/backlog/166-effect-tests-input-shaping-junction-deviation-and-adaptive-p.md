---
id: 166
title: "Effect tests: input shaping, junction deviation and adaptive PA"
type: chore
priority: P2
effort: M
model: sonnet
area: [engine]
story: US49
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [87, 159]
created: 2026-10-25
---

Effect tests for the §2 motion rows: `input_shaping_*`, the junction deviation or jerk key, and `adaptive_pressure_advance_model`.

**Code:** `vsslicer/modules/common/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Each key shows up as its command (`SET_INPUT_SHAPER`/`M593`, `SET_VELOCITY_LIMIT`/`M205`, PA model lines) in the start or per-feature G-code when on
- [ ] The regression guarded is recorded for each
- [ ] An engine without a key asserts its `unsupported` entry

## Tasks

- [ ] Define three tests
- [ ] Start G-code helpers
- [ ] Canned G-code tests

## Progress

Not started.
