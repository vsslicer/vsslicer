---
id: 157
title: Test the second set of generators against every firmware
type: chore
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [156, 155, 146]
created: 2026-10-25
---

Extends the matrix test to PA, flow, input shaping and cornering. Motion tests are fixtures only (D5).

**Code:** `vsslicer/modules/calibration/test/` (module: `calibration`, layer: n/a (tests))

## Acceptance criteria

- [ ] The parser detects the intended parameter per block or line group for each generator and firmware
- [ ] A refusal test exists for input shaping on Bambu naming the reason
- [ ] A mutation shifting the sweep by one layer fails the test

## Tasks

- [ ] Extend the harness
- [ ] Assertions
- [ ] Mutation check

## Progress

Not started.
