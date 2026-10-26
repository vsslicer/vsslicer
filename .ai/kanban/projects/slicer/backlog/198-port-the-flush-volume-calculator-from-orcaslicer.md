---
id: 198
title: Port the flush volume calculator from OrcaSlicer
type: feature
priority: P2
effort: L
model: opus
area: [multimaterial]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [197]
created: 2026-10-25
---

Computes the flush matrix from filament colours, ported from `OrcaSlicer@09aa0114:src/libslic3r/FlushVolCalc.cpp` (AGPL-3.0, D2), with the cap and multiplier as parameters.

**Code:** `vsslicer/modules/multimaterial/src/domain/...` (module: `multimaterial`, layer: `domain`)

## Acceptance criteria

- [ ] The matrix equals the oracle for every recorded colour set (exact match; tolerance only if Orca uses float rounding, stated in the test)
- [ ] Files carry the notice and a `Ported from OrcaSlicer@09aa0114:src/libslic3r/FlushVolCalc.cpp` line; the licence check passes
- [ ] The 20000 mm3 cap and a 900 mm3 cap are both tested; the multiplier scales every cell

## Tasks

- [ ] Read the upstream code
- [ ] Port colour space maths
- [ ] Cap and multiplier
- [ ] Oracle test

## Progress

Not started.
