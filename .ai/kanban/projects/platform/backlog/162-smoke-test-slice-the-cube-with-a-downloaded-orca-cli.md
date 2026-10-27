---
id: 162
title: "Smoke test: slice the cube with a downloaded Orca CLI (M3)"
type: chore
priority: P1
effort: M
model: sonnet
area: [ci]
story: US67
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [161, SLC-30]
created: 2026-10-25
---

Moved from M6 to M3 (owner, 2026-10-27): the Orca CLI download (SLC-30) lands in M3, so the build's smoke test slices only from then on.

**Code:** `test/smoke/` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The smoke test slices the cube fixture with the downloaded Orca CLI and finds G-code in the output
- [ ] It runs on every shipped target in CI (PLT-165)

## Tasks

- [ ] Slice step

## Progress

Not started.
