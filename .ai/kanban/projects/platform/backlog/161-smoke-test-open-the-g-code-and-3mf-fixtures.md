---
id: 161
title: "Smoke test: open the G-code and 3MF fixtures"
type: chore
priority: P0
effort: S
model: sonnet
area: [ci]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP17"
depends_on: [160]
created: 2026-10-25
---

Before M3 the smoke test only opens files; slicing joins it in M3 (PLT-162).

**Code:** `test/smoke/` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The test opens the G-code fixture in the G-code preview and the 3MF fixture in the viewer, and finds no error notification
- [ ] Fixtures come from `vsslicer/` at a pinned commit, not copied by hand

## Tasks

- [ ] Fixture fetch
- [ ] Checks

## Progress

Not started.
