---
id: 161
title: "Smoke test: open the G-code and 3MF fixtures"
type: chore
priority: P2
effort: S
model: sonnet
area: [ci]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [160]
created: 2026-10-25
---

Opens the golden G-code and 3MF fixtures in the build and asserts the custom editors open without console errors.

**Code:** `vsslicer/modules/vsslicer-build/test/smoke/` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Both fixtures open; the preview and viewer webviews report ready
- [ ] Any error in the extension host log fails the test
- [ ] Fixtures only; no printer

## Tasks

- [ ] Add the open steps
- [ ] Add the log assertions

## Progress

Not started.
