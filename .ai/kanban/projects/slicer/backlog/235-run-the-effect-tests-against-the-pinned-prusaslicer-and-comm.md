---
id: 235
title: Run the effect tests against the pinned PrusaSlicer and commit the report
type: chore
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP29"
depends_on: [233, 169, 229, 228]
created: 2026-10-25
---

Wires the testkit to `PrusaEngine` and commits the capability report for the pinned version.

**Code:** `vsslicer/modules/slicer-prusa/` (module: `slicer-prusa`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Every effect test for a supported row passes; unsupported rows are asserted
- [ ] The committed report equals the regenerated one
- [ ] Pressure equalizer and ramping travel tests pass here and are `unsupported` elsewhere

## Tasks

- [ ] Adapter callback
- [ ] Run all effect tests
- [ ] Commit the report

## Progress

Not started.
