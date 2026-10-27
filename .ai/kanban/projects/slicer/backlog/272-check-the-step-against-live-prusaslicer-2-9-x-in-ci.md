---
id: 272
title: Check the step against live PrusaSlicer 2.9.x in CI
type: chore
priority: P2
effort: M
model: sonnet
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [270, 271, 232]
created: 2026-10-25
---

In the module's CI job, installs the pinned PrusaSlicer with `@vsslicer/slicer-prusa`'s installer, slices a fixture with and without rules, applies the step to the unsubstituted output and compares with the substituted one.

**Code:** `vsslicer/modules/apps/slicer/` (module: `slicer-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The step's output equals PrusaSlicer's own substituted output byte for byte for each flag's rules
- [ ] The test is skipped with the reason when the binary is absent locally and is required in CI
- [ ] `@vsslicer/slicer-prusa` is a dev dependency with the range `^0.1.0`

## Tasks

- [ ] CI fetch
- [ ] Double slice
- [ ] Comparison

## Progress

Not started.
