---
id: 290
title: "Measure paint tree memory, codec and fill time on the 1 M triangle fixture"
type: chore
priority: P2
effort: M
model: opus
area: [mesh, painting]
story: US85
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [283, 284, 288, 36]
created: 2026-10-25
---

Paints the generated 1 M triangle mesh with scripted strokes and fills and records tree memory, decode and encode time and fill time, so the subdivision-depth risk is measured.

**Code:** `vsslicer/modules/core/mesh/test/perf/paint/` (module: `mesh`, layer: n/a (ci))

## Acceptance criteria

- [ ] Numbers recorded for memory per painted triangle, decode, encode, stroke and fill time
- [ ] Budgets written down and a CI check fails when a number is exceeded on the CI runner profile
- [ ] If the default depth limit blows the budget, the limit is changed here with the measured reason

## Tasks

- [ ] Harness
- [ ] Measure
- [ ] Budgets and CI check

## Progress

Not started.
