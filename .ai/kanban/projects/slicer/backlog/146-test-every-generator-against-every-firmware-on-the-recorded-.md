---
id: 146
title: Test every generator against every firmware on the recorded outputs
type: chore
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US48
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [144, 145, 137, GCP-3]
created: 2026-10-25
---

The matrix test of the epic: each generator applied to each recorded output for Klipper, Marlin, RRF and Bambu, parsed back, and compared with the sweep definition.

**Code:** `vsslicer/modules/calibration/test/` (module: `calibration`, layer: n/a (tests))

## Acceptance criteria

- [ ] The parser detects the intended parameter per block for every generator and firmware (oracle: the sweep definition)
- [ ] A firmware without the command refuses and no output is produced
- [ ] A mutation (shifting the sweep by one layer) fails the test

## Tasks

- [ ] Matrix harness
- [ ] Assertions via the parser
- [ ] Mutation check

## Progress

Not started.
