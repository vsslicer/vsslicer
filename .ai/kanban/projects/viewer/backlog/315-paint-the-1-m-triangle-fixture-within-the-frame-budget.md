---
id: 315
title: Paint the 1 M triangle fixture within the frame budget
type: chore
priority: P2
effort: M
model: opus
area: [viewer, painting]
story: US85
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [307, 308, 309, 71, 290]
created: 2026-10-25
---

Drives strokes, fills and the overlay on the 1 M triangle fixture in headless Chromium and checks interaction against the frame budget set when the viewer was measured.

**Code:** `vsslicer/modules/apps/project/test/perf/paint/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] Frame time during a stroke and after a fill stays inside the recorded budget for the 1 M fixture
- [ ] The overlay upload time per stroke is recorded
- [ ] Fails CI if a budget is exceeded on the CI runner profile

## Tasks

- [ ] Harness
- [ ] Measure
- [ ] CI check

## Progress

Not started.
