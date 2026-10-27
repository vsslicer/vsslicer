---
id: 162
title: "Smoke test: slice the cube with a downloaded Orca CLI"
type: chore
priority: P2
effort: M
model: sonnet
area: [ci]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [161, SLC-30]
created: 2026-10-25
---

In the build, runs the slice command on the cube fixture after the engine download from the pinned release, and checks the output G-code parses.

**Code:** `vsslicer/modules/tooling/vsslicer-build/test/smoke/` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The engine is downloaded with checksum verification, the cube slices, and the output G-code opens in the preview
- [ ] The test fails with the slicer log tail when the slice fails
- [ ] Fixtures and the downloaded CLI only; the H2C print check belongs to the slicer module

## Tasks

- [ ] Add the slice step
- [ ] Add the output check

## Progress

Not started.
