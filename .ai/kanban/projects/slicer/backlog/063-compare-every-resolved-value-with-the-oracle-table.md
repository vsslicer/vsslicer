---
id: 63
title: Compare every resolved value with the oracle table
type: chore
priority: P1
effort: M
model: sonnet
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [61, 62]
created: 2026-10-25
---

The correctness bar for the evaluator.

**Code:** `vsslicer/modules/cura-settings/` (module: `cura-settings`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Every key of every tuple resolves to the oracle's value (numeric tolerance only for float formatting)
- [ ] A mismatch prints tuple, key, expected and actual
- [ ] The test fails if the oracle has keys we do not resolve

## Tasks

- [ ] Load oracle
- [ ] Compare
- [ ] Report format

## Progress

Not started.
