---
id: 71
title: "Record frame time at 1, 5 and 20 million triangles"
type: chore
priority: P0
effort: M
model: opus
area: [viewer]
story: US24
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [66, 56, 76]
created: 2026-10-25
---

Measures first-render and frame time on the reference machines and writes the budgets into the epic's notes; the size policy reads them.

**Code:** `vsslicer/modules/project-extension/test/perf/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] Numbers recorded per size per machine
- [ ] Budgets documented and consumed by `sizePolicy`
- [ ] Fails CI if a budget is exceeded on the CI runner profile

## Tasks

- [ ] Harness
- [ ] Measure
- [ ] Write budgets

## Progress

Not started.
