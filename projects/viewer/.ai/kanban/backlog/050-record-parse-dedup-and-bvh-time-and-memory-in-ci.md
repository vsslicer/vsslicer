---
id: 50
title: "Record parse, dedup and BVH time and memory in CI"
type: chore
priority: P0
effort: M
model: opus
area: [mesh]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [48, 49, 36, 45, 37]
created: 2026-10-25
---

The final benchmark on the real library at 1, 5 and 20 M triangles; its numbers go to E10's budgets.

**Code:** `vsslicer/modules/mesh/test/bench/` (module: `mesh`, layer: n/a (ci))

## Acceptance criteria

- [ ] Time and peak memory for parse, dedup and BVH are recorded per size and per host (Node worker and Chromium)
- [ ] Results are written to a file consumed by the E10 budget card
- [ ] Compared with the spike's numbers and any large gap explained

## Tasks

- [ ] Harness
- [ ] Run and record
- [ ] Compare with spike

## Progress

Not started.
