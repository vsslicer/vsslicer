---
id: 218
title: Record the 200-object budget and test that cancel leaves nothing partial
type: feature
priority: P1
effort: S
model: sonnet
area: [arrange]
story: US62
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [213, 215]
created: 2026-10-25
---

Measures the 200-object fixture in a worker and the event loop delay, and checks that cancel returns no poses.

**Code:** `vsslicer/modules/arrange/test/perf/` (module: `arrange`, layer: n/a (tests))

## Acceptance criteria

- [ ] Time for 200 objects is recorded in CI and a budget is set from it
- [ ] Cancel mid-run returns no poses
- [ ] Event loop delay stays under 50 ms during the run

## Tasks

- [ ] Benchmark
- [ ] Cancel test

## Progress

Not started.
