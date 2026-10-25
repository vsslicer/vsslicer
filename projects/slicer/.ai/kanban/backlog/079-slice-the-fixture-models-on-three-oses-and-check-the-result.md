---
id: 79
title: Slice the fixture models on three OSes and check the result
type: chore
priority: P1
effort: M
model: sonnet
area: [cura]
story: US17
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [76, 77, 1, GCP-3, GCP-4, GCP-24]
created: 2026-10-25
---

The I5 CI criterion for Cura: parse with `@vsslicer/gcode`, expected layers and roles, estimate versus `;TIME:`.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Fixture models slice on Linux, macOS and Windows runners
- [ ] Layer count and roles equal `expected.json`
- [ ] Our estimate is within the I5 tolerance (10 percent) of the engine's `;TIME:`

## Tasks

- [ ] Integration test
- [ ] Tolerance helper
- [ ] CI wiring

## Progress

Not started.
